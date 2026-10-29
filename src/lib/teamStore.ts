import { unstable_cache } from "next/cache";
import {
  splitLeadersAndRosterByRole,
  type DepartmentSummary,
  type PublicTeamLink,
  type PublicTeamMember,
  type TeamLeader,
} from "@/data/teamData";

// The wiki is the source of truth (GET /api/v1/team only lists people who opted in). The landing site keeps no
// copy on disk (Vercel's disk does not persist): it reads the wiki through Next's data cache, and the wiki's
// POST /api/team push expires that cache so a change shows up at once.
const WIKI_URL = (process.env.LUNORIS_WIKI_URL || "https://lunoris-wiki.vercel.app").trim().replace(/\/+$/, "");
export const TEAM_TAG = "team";

export interface StoredTeamSnapshot {
  updated_at: string;
  total: number;
  departments: DepartmentSummary[];
  members: PublicTeamMember[];
}

function sanitizeAvatarUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;

  // Support inline data:image/...;base64,... from Wiki local dev or external https:// / local /uploads/
  if (
    /^data:image\/(?:webp|png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(s)
  ) {
    return s.length <= 4 * 1024 * 1024 ? s : null;
  }

  if (s.startsWith("/assets/") || s.startsWith("/uploads/")) {
    if (s.includes("..") || s.includes("\\") || /['"()<>`\s;]/.test(s)) {
      return null;
    }
    return s;
  }

  if (/^https?:\/\//i.test(s) && s.length <= 2048 && !/['"()<>`\s;]/.test(s)) {
    return s;
  }

  return null;
}

function sanitizeLinks(raw: unknown): PublicTeamLink[] {
  if (!Array.isArray(raw)) return [];
  const result: PublicTeamLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    const label =
      typeof rec.label === "string" ? rec.label.trim().slice(0, 60) : url;
    if (/^https?:\/\//i.test(url) && url.length <= 2048) {
      result.push({ label: label || url, url });
    }
    if (result.length >= 8) break;
  }
  return result;
}

function getInitialsFallback(name: string): string {
  const parts = name.trim().split(/[\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0] || "LN").slice(0, 2).toUpperCase();
}

export function sanitizePublicTeamMembers(
  rawMembers: unknown
): PublicTeamMember[] {
  if (!Array.isArray(rawMembers)) return [];
  const cleaned: PublicTeamMember[] = [];

  for (const item of rawMembers) {
    if (!item || typeof item !== "object") continue;
    const m = item as Record<string, unknown>;

    // Strictly honor public === true
    if (m.public !== true) continue;

    const name = typeof m.name === "string" ? m.name.trim().slice(0, 120) : "";
    if (!name) continue;

    const id =
      typeof m.id === "string" && m.id.trim()
        ? m.id.trim().slice(0, 80)
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug =
      typeof m.slug === "string" && m.slug.trim()
        ? m.slug.trim().slice(0, 80)
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const lowerName = name.toLowerCase();
    const defaultExecutiveRole =
      lowerName === "aziz"
        ? "CEO/Founder"
        : lowerName === "andrew"
          ? "CTO"
          : lowerName === "nick" || lowerName === "nick pain"
            ? "CMO"
            : "";

    const rawTitle =
      typeof m.title === "string" ? m.title.trim().slice(0, 160) : "";
    const rawRole =
      typeof m.role === "string" ? m.role.trim().slice(0, 160) : "";
    const resolvedTitle = rawTitle || rawRole || defaultExecutiveRole;
    const role = resolvedTitle;
    const title = resolvedTitle;
    const team =
      typeof m.team === "string" && m.team.trim()
        ? m.team.trim().slice(0, 80)
        : null;
    const department =
      typeof m.department === "string" && m.department.trim()
        ? m.department.trim().slice(0, 80)
        : "Game Production";
    const department_key =
      typeof m.department_key === "string" && m.department_key.trim()
        ? m.department_key.trim().slice(0, 80)
        : department.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const initials =
      typeof m.initials === "string" && m.initials.trim()
        ? m.initials.trim().slice(0, 4).toUpperCase()
        : getInitialsFallback(name);
    const bio =
      typeof m.bio === "string" && m.bio.trim()
        ? m.bio.trim().slice(0, 4000)
        : null;

    cleaned.push({
      id,
      slug,
      name,
      initials,
      role,
      title,
      team,
      department,
      department_key,
      avatar_url: sanitizeAvatarUrl(m.avatar_url),
      bio,
      links: sanitizeLinks(m.links),
      public: true,
    });
  }

  return cleaned;
}

export function buildDepartmentsForMembers(
  members: PublicTeamMember[]
): DepartmentSummary[] {
  const counts = new Map<string, { key: string; label: string; count: number }>();

  for (const m of members) {
    const existing = counts.get(m.department_key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(m.department_key, {
        key: m.department_key,
        label: m.department,
        count: 1,
      });
    }
  }

  return [
    { key: "all", label: "All Departments", count: members.length },
    ...Array.from(counts.values()),
  ];
}

/** The opted-in team from the wiki. Throws when the wiki is unreachable, so a failure is never cached. */
async function pullTeamFromWiki(): Promise<StoredTeamSnapshot> {
  const res = await fetch(`${WIKI_URL}/api/v1/team`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(4500),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || data?.ok !== true || !Array.isArray(data.members)) {
    throw new Error(`Wiki team API returned ${res.status}.`);
  }
  const members = sanitizePublicTeamMembers(data.members);
  return {
    updated_at: new Date().toISOString(),
    total: members.length,
    departments: buildDepartmentsForMembers(members),
    members,
  };
}

// Refreshed every 5 minutes at most, or at once when the wiki pushes.
const pullTeamCached = unstable_cache(pullTeamFromWiki, ["team-snapshot"], {
  tags: [TEAM_TAG],
  revalidate: 300,
});

export async function getTeamSnapshot(options?: {
  forcePull?: boolean;
}): Promise<StoredTeamSnapshot> {
  try {
    return options?.forcePull ? await pullTeamFromWiki() : await pullTeamCached();
  } catch {
    // Wiki unreachable: the pages fall back to their built-in leader slots
    return {
      updated_at: new Date().toISOString(),
      total: 0,
      departments: [{ key: "all", label: "All Departments", count: 0 }],
      members: [],
    };
  }
}

export interface ResolvedSiteTeamData {
  updated_at: string;
  /** The 3 department heads for the Main Landing Page (/#team) */
  leaders: TeamLeader[];
  /** All public members excluding the 3 main-page department heads (for /team) */
  rosterMembers: PublicTeamMember[];
  /** Department filter tabs with counts for /team */
  rosterDepartments: DepartmentSummary[];
  /** Raw full list of public members received from Wiki */
  allPublicMembers: PublicTeamMember[];
}

export async function getResolvedSiteTeamData(options?: {
  forcePull?: boolean;
  department?: string | null;
  q?: string | null;
}): Promise<ResolvedSiteTeamData> {
  const snapshot = await getTeamSnapshot({ forcePull: options?.forcePull });

  // 1. Dynamically pick the 3 main leaders by their roles (CEO/Founder, CTO, CMO)
  //    and keep everyone else in `remainingMembers` for the /team roster
  const { leaders, remainingMembers: baseRoster } =
    splitLeadersAndRosterByRole(snapshot.members);
  const rosterDepartments = buildDepartmentsForMembers(baseRoster);

  const deptFilter = options?.department?.trim().toLowerCase() || "";
  const qFilter = options?.q?.trim().toLowerCase() || "";

  const rosterMembers = baseRoster.filter((m) => {
    if (deptFilter && deptFilter !== "all") {
      if (
        m.department_key.toLowerCase() !== deptFilter &&
        m.department.toLowerCase() !== deptFilter
      ) {
        return false;
      }
    }
    if (qFilter) {
      const hay =
        `${m.name} ${m.title} ${m.role} ${m.department} ${m.bio || ""}`.toLowerCase();
      if (!hay.includes(qFilter)) return false;
    }
    return true;
  });

  return {
    updated_at: snapshot.updated_at,
    leaders,
    rosterMembers,
    rosterDepartments,
    allPublicMembers: snapshot.members,
  };
}
