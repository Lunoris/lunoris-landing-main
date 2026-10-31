export interface PublicTeamLink {
  platform?: string;
  label: string;
  url: string;
}

export interface PublicTeamMember {
  id: string;
  slug: string;
  name: string;
  initials: string;
  role: string;
  title: string;
  team: string | null;
  department: string;
  department_key: string;
  avatar_url: string | null;
  bio: string | null;
  links: PublicTeamLink[];
  social_links: Record<string, string>;
  public: true;
}

export interface DepartmentSummary {
  key: string;
  label: string;
  count: number;
}

export interface TeamLeader {
  id: string;
  personId: string;
  slug: string;
  name: string;
  role: string;
  department: string;
  initials: string;
  avatar?: string | null;
  accentColor: string;
  bio: string | null;
  links?: PublicTeamLink[];
  social_links?: Record<string, string>;
}

interface ExecutiveRoleSlot {
  slotKey: "ceo-founder" | "cto" | "cmo";
  accentColor: string;
  matchesRole: (roleOrTitle: string) => boolean;
}

const EXECUTIVE_ROLE_SLOTS: ExecutiveRoleSlot[] = [
  {
    slotKey: "ceo-founder",
    accentColor: "#f5b851",
    matchesRole: (raw) => {
      const r = raw.toLowerCase().trim();
      return (
        r === "ceo/founder" ||
        r === "ceo & founder" ||
        r === "ceo" ||
        r.includes("ceo") ||
        r.includes("founder")
      );
    },
  },
  {
    slotKey: "cto",
    accentColor: "#38bdf8",
    matchesRole: (raw) => {
      const r = raw.toLowerCase().trim();
      return (
        r === "cto" ||
        /\bcto\b/.test(r) ||
        r.includes("chief technology officer")
      );
    },
  },
  {
    slotKey: "cmo",
    accentColor: "#c084fc",
    matchesRole: (raw) => {
      const r = raw.toLowerCase().trim();
      return (
        r === "cmo" ||
        /\bcmo\b/.test(r) ||
        r.includes("chief marketing officer")
      );
    },
  },
];

// Left to right on the page: the founder in the middle, flanked by the CTO and the CMO.
// (Slots are still matched in EXECUTIVE_ROLE_SLOTS order, so the CEO claims a member first.)
const DISPLAY_ORDER: ExecutiveRoleSlot["slotKey"][] = [
  "cto",
  "ceo-founder",
  "cmo",
];
const byDisplayOrder = (a: TeamLeader, b: TeamLeader) =>
  DISPLAY_ORDER.indexOf(a.id as ExecutiveRoleSlot["slotKey"]) -
  DISPLAY_ORDER.indexOf(b.id as ExecutiveRoleSlot["slotKey"]);

/**
 * Dynamically resolves the executive leaders (CEO/Founder, CTO, CMO) strictly from
 * the live `members[]` array returned by Lunoris Wiki API, with zero fallback cards
 * or invented text, and returns both `leaders` and `remainingMembers` (everyone else).
 */
export function splitLeadersAndRosterByRole(members: PublicTeamMember[]): {
  leaders: TeamLeader[];
  remainingMembers: PublicTeamMember[];
} {
  const matchedMemberIds = new Set<string>();
  const leaders: TeamLeader[] = [];

  for (const slot of EXECUTIVE_ROLE_SLOTS) {
    const matched = members.find((m) => {
      if (matchedMemberIds.has(m.id)) return false;
      const candidateRole = m.title || m.role || "";
      return slot.matchesRole(candidateRole);
    });

    if (!matched) {
      continue;
    }

    matchedMemberIds.add(matched.id);
    const resolvedRole = (matched.title || matched.role || "").trim();

    leaders.push({
      id: slot.slotKey,
      personId: matched.id,
      slug: matched.slug,
      name: matched.name,
      role: resolvedRole,
      department: matched.department || "",
      initials: matched.initials,
      avatar: matched.avatar_url || null,
      accentColor: slot.accentColor,
      bio: matched.bio && matched.bio.trim() ? matched.bio.trim() : null,
      links: matched.links && matched.links.length > 0 ? matched.links : [],
      social_links: matched.social_links || {},
    });
  }

  const remainingMembers = members.filter((m) => !matchedMemberIds.has(m.id));

  return {
    leaders: leaders.sort(byDisplayOrder),
    remainingMembers,
  };
}
