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
  bio: string;
  links?: PublicTeamLink[];
  social_links?: Record<string, string>;
}

interface ExecutiveRoleSlot {
  slotKey: "ceo-founder" | "cto" | "cmo";
  targetRoleLabel: "CEO/Founder" | "CTO" | "CMO";
  defaultSubtitle: string;
  accentColor: string;
  matchesRole: (roleOrTitle: string) => boolean;
  fallbackLeader: TeamLeader;
}

const EXECUTIVE_ROLE_SLOTS: ExecutiveRoleSlot[] = [
  {
    slotKey: "ceo-founder",
    targetRoleLabel: "CEO/Founder",
    defaultSubtitle: "Creative Direction & Studio Vision",
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
    fallbackLeader: {
      id: "ceo-founder",
      personId: "14d4e4aa-0bdb-4cf9-b292-35ea0a6726e8",
      slug: "aziz",
      name: "Aziz",
      role: "CEO/Founder",
      department: "Creative Direction & Studio Vision",
      initials: "AZ",
      avatar: null,
      accentColor: "#f5b851",
      bio: "Founder and Creative Director of Lunoris Studios. Shapes the emotional core, narrative architecture, and painterly artistic direction across every Dream Island and Nightmare realm.",
      links: [],
      social_links: {},
    },
  },
  {
    slotKey: "cto",
    targetRoleLabel: "CTO",
    defaultSubtitle: "Technology, Engineering & Production",
    accentColor: "#38bdf8",
    matchesRole: (raw) => {
      const r = raw.toLowerCase().trim();
      return (
        r === "cto" ||
        /\bcto\b/.test(r) ||
        r.includes("chief technology officer")
      );
    },
    fallbackLeader: {
      id: "cto",
      personId: "354f90f7-2dec-4590-a8fb-536c807dd375",
      slug: "andrew",
      name: "Andrew",
      role: "CTO",
      department: "Technology, Engineering & Production",
      initials: "AN",
      avatar: null,
      accentColor: "#38bdf8",
      bio: "Leads technical architecture, production pipelines, and cross-disciplinary studio operations—uniting engineering, world-building workflows, and milestone execution.",
      links: [],
      social_links: {},
    },
  },
  {
    slotKey: "cmo",
    targetRoleLabel: "CMO",
    defaultSubtitle: "Marketing, Partnerships & Talent",
    accentColor: "#c084fc",
    matchesRole: (raw) => {
      const r = raw.toLowerCase().trim();
      return (
        r === "cmo" ||
        /\bcmo\b/.test(r) ||
        r.includes("chief marketing officer")
      );
    },
    fallbackLeader: {
      id: "cmo",
      personId: "665f9f93-d02c-4635-b7f5-583a1004716d",
      slug: "nick-pain",
      name: "Nick Pain",
      role: "CMO",
      department: "Marketing, Partnerships & Talent",
      initials: "NP",
      avatar: null,
      accentColor: "#c084fc",
      bio: "Directs global publishing strategy, industry partnerships, SAG-AFTRA voice talent collaborations, and community outreach from Gamescom Cologne to worldwide launch.",
      links: [],
      social_links: {},
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

export const TEAM_LEADERS: TeamLeader[] = EXECUTIVE_ROLE_SLOTS.map(
  (slot) => slot.fallbackLeader
).sort(byDisplayOrder);

/**
 * Dynamically resolves the 3 main leaders (CEO/Founder, CTO, CMO) by matching
 * their `title` / `role` from the live `members[]` array returned by Lunoris Wiki,
 * and returns both the 3 `leaders` and the `remainingMembers` (everyone else).
 */
export function splitLeadersAndRosterByRole(members: PublicTeamMember[]): {
  leaders: TeamLeader[];
  remainingMembers: PublicTeamMember[];
} {
  const matchedMemberIds = new Set<string>();

  const leaders: TeamLeader[] = EXECUTIVE_ROLE_SLOTS.map((slot) => {
    const matched = members.find((m) => {
      if (matchedMemberIds.has(m.id)) return false;
      const candidateRole = m.title || m.role || "";
      return slot.matchesRole(candidateRole);
    });

    if (!matched) {
      return slot.fallbackLeader;
    }

    matchedMemberIds.add(matched.id);
    const resolvedRole =
      matched.title || matched.role || slot.targetRoleLabel;

    return {
      id: slot.slotKey,
      personId: matched.id,
      slug: matched.slug,
      name: matched.name,
      role: resolvedRole,
      department: matched.department || slot.defaultSubtitle,
      initials: matched.initials || slot.fallbackLeader.initials,
      avatar: matched.avatar_url || null,
      accentColor: slot.accentColor,
      bio:
        matched.bio && matched.bio.trim()
          ? matched.bio
          : slot.fallbackLeader.bio,
      links: matched.links && matched.links.length > 0 ? matched.links : [],
      social_links: matched.social_links || {},
    };
  });

  const remainingMembers = members.filter((m) => !matchedMemberIds.has(m.id));

  return {
    leaders: leaders.sort(byDisplayOrder),
    remainingMembers,
  };
}
