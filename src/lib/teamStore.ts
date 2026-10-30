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
const DEFAULT_PROD_WIKI_URL = "https://lunoris-wiki.vercel.app";
export const TEAM_TAG = "team";

export interface StoredTeamSnapshot {
  updated_at: string;
  allowed_social_platforms: string[];
  total: number;
  departments: DepartmentSummary[];
  members: PublicTeamMember[];
}

interface SocialPlatformDef {
  key: string;
  label: string;
  domains: string[];
  extraHosts?: string[];
  allowSubdomains?: boolean;
  requireSubdomain?: boolean;
  requirePathOnRoot?: boolean;
  requiredPathPrefix?: string;
}

export const ALLOWED_SOCIAL_PLATFORMS: readonly SocialPlatformDef[] = [
  {
    key: "github",
    label: "GitHub",
    domains: ["github.com"],
    extraHosts: ["gist.github.com"],
  },
  {
    key: "github_pages",
    label: "GitHub Pages",
    domains: ["github.io"],
    allowSubdomains: true,
    requireSubdomain: true,
  },
  {
    key: "gitlab",
    label: "GitLab",
    domains: ["gitlab.com"],
  },
  {
    key: "gitlab_pages",
    label: "GitLab Pages",
    domains: ["gitlab.io"],
    allowSubdomains: true,
    requireSubdomain: true,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    domains: ["linkedin.com"],
    allowSubdomains: true,
    requirePathOnRoot: true,
  },
  {
    key: "artstation",
    label: "ArtStation",
    domains: ["artstation.com"],
    allowSubdomains: true,
  },
  {
    key: "behance",
    label: "Behance",
    domains: ["behance.net"],
  },
  {
    key: "dribbble",
    label: "Dribbble",
    domains: ["dribbble.com"],
  },
  {
    key: "cara",
    label: "Cara",
    domains: ["cara.app"],
  },
  {
    key: "deviantart",
    label: "DeviantArt",
    domains: ["deviantart.com"],
    allowSubdomains: true,
  },
  {
    key: "sketchfab",
    label: "Sketchfab",
    domains: ["sketchfab.com"],
  },
  {
    key: "figma",
    label: "Figma",
    domains: ["figma.com"],
  },
  {
    key: "x",
    label: "X",
    domains: ["x.com", "twitter.com"],
  },
  {
    key: "bluesky",
    label: "Bluesky",
    domains: ["bsky.app"],
  },
  {
    key: "telegram",
    label: "Telegram",
    domains: ["t.me", "telegram.me"],
  },
  {
    key: "discord",
    label: "Discord",
    domains: ["discord.com", "discordapp.com"],
    requiredPathPrefix: "/users/",
  },
  {
    key: "instagram",
    label: "Instagram",
    domains: ["instagram.com"],
  },
  {
    key: "threads",
    label: "Threads",
    domains: ["threads.net", "threads.com"],
  },
  {
    key: "youtube",
    label: "YouTube",
    domains: ["youtube.com", "youtu.be"],
    extraHosts: ["m.youtube.com"],
  },
  {
    key: "twitch",
    label: "Twitch",
    domains: ["twitch.tv"],
    extraHosts: ["m.twitch.tv"],
  },
  {
    key: "tiktok",
    label: "TikTok",
    domains: ["tiktok.com"],
  },
  {
    key: "reddit",
    label: "Reddit",
    domains: ["reddit.com"],
    extraHosts: ["old.reddit.com"],
  },
  {
    key: "facebook",
    label: "Facebook",
    domains: ["facebook.com", "fb.com"],
  },
  {
    key: "vk",
    label: "VK",
    domains: ["vk.com"],
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    domains: ["soundcloud.com"],
    extraHosts: ["on.soundcloud.com"],
  },
  {
    key: "bandcamp",
    label: "Bandcamp",
    domains: ["bandcamp.com"],
    allowSubdomains: true,
  },
  {
    key: "spotify",
    label: "Spotify",
    domains: ["open.spotify.com"],
  },
  {
    key: "vimeo",
    label: "Vimeo",
    domains: ["vimeo.com"],
  },
  {
    key: "itchio",
    label: "itch.io",
    domains: ["itch.io"],
    allowSubdomains: true,
  },
  {
    key: "steam",
    label: "Steam",
    domains: ["steamcommunity.com", "store.steampowered.com"],
  },
  {
    key: "medium",
    label: "Medium",
    domains: ["medium.com"],
    allowSubdomains: true,
  },
  {
    key: "devto",
    label: "DEV",
    domains: ["dev.to"],
  },
];

export const ALLOWED_SOCIAL_PLATFORM_KEYS: string[] =
  ALLOWED_SOCIAL_PLATFORMS.map((p) => p.key);

const SUBDOMAIN_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const MAX_SOCIAL_LINKS = 8;

function matchHostToPlatform(hostname: string): {
  platform: SocialPlatformDef;
  isUserSubdomain: boolean;
} | null {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  for (const platform of ALLOWED_SOCIAL_PLATFORMS) {
    if (platform.extraHosts?.includes(host)) {
      return { platform, isUserSubdomain: false };
    }
    for (const domain of platform.domains) {
      if (
        !platform.requireSubdomain &&
        (host === domain || host === `www.${domain}`)
      ) {
        return { platform, isUserSubdomain: false };
      }
      if (platform.allowSubdomains && host.endsWith(`.${domain}`)) {
        const sub = host.slice(0, -(domain.length + 1));
        if (sub && sub !== "www" && SUBDOMAIN_LABEL_RE.test(sub)) {
          const isRegionalLinkedin = platform.key === "linkedin";
          return { platform, isUserSubdomain: !isRegionalLinkedin };
        }
      }
    }
  }
  return null;
}

function normalizeAllowedSocialLink(
  rawUrl: string,
  customLabel?: string | null
): PublicTeamLink | null {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 320 || /[\s<>"'`]/.test(trimmed)) {
    return null;
  }
  if (
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) &&
    !/^https?:\/\//i.test(trimmed)
  ) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }
  if (parsed.username || parsed.password || parsed.port) {
    return null;
  }

  parsed.protocol = "https:";
  parsed.hash = "";

  const matched = matchHostToPlatform(parsed.hostname);
  if (!matched) {
    return null;
  }

  const { platform, isUserSubdomain } = matched;
  const cleanPath = parsed.pathname.replace(/\/+/g, "/");

  if (
    platform.requiredPathPrefix &&
    !cleanPath.toLowerCase().startsWith(platform.requiredPathPrefix)
  ) {
    return null;
  }

  const needsPath = (platform.requirePathOnRoot ?? true) && !isUserSubdomain;
  if (needsPath && (!cleanPath || cleanPath === "/")) {
    return null;
  }

  const rawLabel = typeof customLabel === "string" ? customLabel.trim() : "";
  const isUrlLabel =
    /^https?:\/\//i.test(rawLabel) || rawLabel.includes("/");
  const label =
    rawLabel && !isUrlLabel ? rawLabel.slice(0, 40) : platform.label;

  return {
    platform: platform.key,
    label,
    url: parsed.toString(),
  };
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

function sanitizeLinksAndSocialMap(
  rawLinks: unknown,
  rawSocialLinks?: unknown
): {
  links: PublicTeamLink[];
  social_links: Record<string, string>;
} {
  const result: PublicTeamLink[] = [];
  const seen = new Set<string>();

  const pushCandidate = (urlVal: unknown, labelVal?: unknown) => {
    if (result.length >= MAX_SOCIAL_LINKS || typeof urlVal !== "string") return;
    const normalized = normalizeAllowedSocialLink(
      urlVal,
      typeof labelVal === "string" ? labelVal : null
    );
    if (!normalized) return;
    const dedupeKey = normalized.url.toLowerCase().replace(/\/$/, "");
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    result.push(normalized);
  };

  if (Array.isArray(rawLinks)) {
    for (const item of rawLinks) {
      if (typeof item === "string") {
        pushCandidate(item);
      } else if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        pushCandidate(rec.url, rec.label);
      }
    }
  }

  if (
    rawSocialLinks &&
    typeof rawSocialLinks === "object" &&
    !Array.isArray(rawSocialLinks)
  ) {
    for (const val of Object.values(
      rawSocialLinks as Record<string, unknown>
    )) {
      pushCandidate(val);
    }
  }

  const social_links: Record<string, string> = {};
  for (const link of result) {
    if (link.platform && !social_links[link.platform]) {
      social_links[link.platform] = link.url;
    }
  }

  return { links: result, social_links };
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
    const { links, social_links } = sanitizeLinksAndSocialMap(
      m.links,
      m.social_links
    );

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
      links,
      social_links,
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

function getCandidateWikiUrls(): string[] {
  const configured = (process.env.LUNORIS_WIKI_URL || "")
    .trim()
    .replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    return [configured || DEFAULT_PROD_WIKI_URL];
  }

  // In local development, probe explicit LUNORIS_WIKI_URL first, then local Wiki ports (3000 / 3001),
  // and finally fall back to production Wiki if local Wiki isn't running.
  return Array.from(
    new Set(
      [
        configured,
        "http://localhost:3000",
        "http://localhost:3001",
        DEFAULT_PROD_WIKI_URL,
      ].filter(Boolean)
    )
  );
}

/** The opted-in team from the wiki. Throws when the wiki is unreachable, so a failure is never cached. */
async function pullTeamFromWiki(): Promise<StoredTeamSnapshot> {
  const candidates = getCandidateWikiUrls();
  let lastError: Error | null = null;

  for (const baseUrl of candidates) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/team`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(4500),
      });
      if (!res.ok) {
        lastError = new Error(`${baseUrl} returned HTTP ${res.status}`);
        continue;
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        lastError = new Error(`${baseUrl} did not return JSON`);
        continue;
      }

      const data = (await res.json()) as Record<string, unknown>;
      if (data?.ok !== true || !Array.isArray(data.members)) {
        lastError = new Error(`${baseUrl} returned invalid team payload`);
        continue;
      }

      const members = sanitizePublicTeamMembers(data.members);
      const allowedPlatforms = Array.isArray(data.allowed_social_platforms)
        ? data.allowed_social_platforms.filter(
            (k): k is string => typeof k === "string" && k.length <= 40
          )
        : ALLOWED_SOCIAL_PLATFORM_KEYS;

      return {
        updated_at:
          typeof data.updated_at === "string" && data.updated_at
            ? data.updated_at
            : new Date().toISOString(),
        allowed_social_platforms: allowedPlatforms,
        total: members.length,
        departments: buildDepartmentsForMembers(members),
        members,
      };
    } catch (err) {
      lastError =
        err instanceof Error ? err : new Error(`Failed reaching ${baseUrl}`);
    }
  }

  throw lastError || new Error("Wiki team API is unreachable.");
}

// Refreshed every 5 minutes in production (or instantly on POST /api/team push).
// In local development we pull directly so local edits on port 3000 appear right away.
const pullTeamCached = unstable_cache(pullTeamFromWiki, ["team-snapshot"], {
  tags: [TEAM_TAG],
  revalidate: 300,
});

export async function getTeamSnapshot(options?: {
  forcePull?: boolean;
}): Promise<StoredTeamSnapshot> {
  const bypassCache =
    Boolean(options?.forcePull) || process.env.NODE_ENV !== "production";

  try {
    return bypassCache ? await pullTeamFromWiki() : await pullTeamCached();
  } catch {
    // Wiki unreachable: the pages fall back to their built-in leader slots
    return {
      updated_at: new Date().toISOString(),
      allowed_social_platforms: ALLOWED_SOCIAL_PLATFORM_KEYS,
      total: 0,
      departments: [{ key: "all", label: "All Departments", count: 0 }],
      members: [],
    };
  }
}

export interface ResolvedSiteTeamData {
  updated_at: string;
  allowed_social_platforms: string[];
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
  team?: string | null;
  platform?: string | null;
  q?: string | null;
}): Promise<ResolvedSiteTeamData> {
  const snapshot = await getTeamSnapshot({ forcePull: options?.forcePull });

  // 1. Dynamically pick the 3 main leaders by their roles (CEO/Founder, CTO, CMO)
  //    and keep everyone else in `remainingMembers` for the /team roster
  const { leaders, remainingMembers: baseRoster } =
    splitLeadersAndRosterByRole(snapshot.members);
  const rosterDepartments = buildDepartmentsForMembers(baseRoster);

  const deptFilter = options?.department?.trim().toLowerCase() || "";
  const teamFilter = options?.team?.trim().toLowerCase() || "";
  const platformFilter = options?.platform?.trim().toLowerCase() || "";
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
    if (teamFilter) {
      if (
        (m.team || "").toLowerCase() !== teamFilter &&
        m.department.toLowerCase() !== teamFilter &&
        m.department_key.toLowerCase() !== teamFilter
      ) {
        return false;
      }
    }
    if (platformFilter) {
      const hasPlatform = m.links.some(
        (l) =>
          (l.platform || "").toLowerCase() === platformFilter ||
          l.label.toLowerCase() === platformFilter
      );
      if (!hasPlatform) return false;
    }
    if (qFilter) {
      const linksHay = m.links
        .map((l) => `${l.platform || ""} ${l.label} ${l.url}`)
        .join(" ");
      const hay =
        `${m.name} ${m.title} ${m.role} ${m.department} ${m.bio || ""} ${linksHay}`.toLowerCase();
      if (!hay.includes(qFilter)) return false;
    }
    return true;
  });

  return {
    updated_at: snapshot.updated_at,
    allowed_social_platforms: snapshot.allowed_social_platforms,
    leaders,
    rosterMembers,
    rosterDepartments,
    allPublicMembers: snapshot.members,
  };
}
