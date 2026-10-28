import fs from "fs/promises";
import path from "path";
import {
  splitLeadersAndRosterByRole,
  type DepartmentSummary,
  type PublicTeamLink,
  type PublicTeamMember,
  type TeamLeader,
} from "@/data/teamData";

const DATA_DIR = path.join(process.cwd(), "data");
const TEAM_FILE = path.join(DATA_DIR, "published-team.json");

export interface StoredTeamSnapshot {
  event: string;
  changed_person_id: string | null;
  updated_at: string;
  total: number;
  departments: DepartmentSummary[];
  members: PublicTeamMember[];
}

// In-process async mutex so concurrent webhook/pull writes never interleave
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
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

async function writeSnapshotAtomically(
  snapshot: StoredTeamSnapshot
): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${TEAM_FILE}.${Date.now()}-${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(snapshot, null, 2), "utf8");
  await fs.rename(tempFile, TEAM_FILE);
}

export async function saveTeamSnapshot(
  rawPayload: Record<string, unknown>
): Promise<StoredTeamSnapshot> {
  return enqueueWrite(async () => {
    const members = sanitizePublicTeamMembers(rawPayload.members);
    const departments = buildDepartmentsForMembers(members);

    const snapshot: StoredTeamSnapshot = {
      event:
        typeof rawPayload.event === "string"
          ? rawPayload.event
          : "team.updated",
      changed_person_id:
        typeof rawPayload.changed_person_id === "string"
          ? rawPayload.changed_person_id
          : null,
      updated_at:
        typeof rawPayload.updated_at === "string"
          ? rawPayload.updated_at
          : new Date().toISOString(),
      total: members.length,
      departments,
      members,
    };

    await writeSnapshotAtomically(snapshot);
    return snapshot;
  });
}

/**
 * Pulls the latest public team snapshot from Lunoris Wiki (`GET /api/v1/team`).
 * Tries configured `LUNORIS_WIKI_URL`, local dev ports (`3001`, `3000`), and
 * production `https://lunoris-wiki.vercel.app`.
 */
export async function pullTeamFromWiki(): Promise<StoredTeamSnapshot | null> {
  const candidateBaseUrls = Array.from(
    new Set(
      [
        process.env.LUNORIS_WIKI_URL?.trim().replace(/\/+$/, ""),
        "http://localhost:3001",
        "http://localhost:3000",
        "https://lunoris-wiki.vercel.app",
      ].filter((u): u is string => Boolean(u))
    )
  );

  for (const baseUrl of candidateBaseUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/team`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) continue;

      const data = (await res.json()) as Record<string, unknown>;
      if (data && data.ok === true && Array.isArray(data.members)) {
        return await saveTeamSnapshot({
          event: "team.pulled",
          changed_person_id: null,
          updated_at: new Date().toISOString(),
          members: data.members,
        });
      }
    } catch {
      // Try next candidate URL
    }
  }

  return null;
}

const STALE_PULL_INTERVAL_MS = 5 * 1000; // Re-verify with Wiki if cache is >5s old or empty

export async function getTeamSnapshot(options?: {
  forcePull?: boolean;
}): Promise<StoredTeamSnapshot> {
  if (options?.forcePull) {
    const pulled = await pullTeamFromWiki();
    if (pulled) return pulled;
  }

  let cached: StoredTeamSnapshot | null = null;
  try {
    const raw = await fs.readFile(TEAM_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredTeamSnapshot;
    if (parsed && Array.isArray(parsed.members)) {
      cached = parsed;
    }
  } catch {
    // File does not exist yet
  }

  const ageMs = cached?.updated_at
    ? Date.now() - Date.parse(cached.updated_at)
    : Infinity;

  // If no cache yet, or cache is empty, or cache is older than 5 seconds, try pulling fresh data from Wiki
  if (!cached || cached.members.length === 0 || ageMs > STALE_PULL_INTERVAL_MS) {
    const pulled = await pullTeamFromWiki();
    if (pulled) return pulled;
  }

  if (cached) {
    return cached;
  }

  const emptySnapshot: StoredTeamSnapshot = {
    event: "team.initialized",
    changed_person_id: null,
    updated_at: new Date().toISOString(),
    total: 0,
    departments: [{ key: "all", label: "All Departments", count: 0 }],
    members: [],
  };

  await enqueueWrite(() => writeSnapshotAtomically(emptySnapshot));
  return emptySnapshot;
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
