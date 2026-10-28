export interface CharacterCardItem {
  name: string;
  lore: string;
  image: string;
  accent: string;
}

export interface CompanionItem {
  name: string;
  title: string;
  species: string;
  image: string;
  desc: string;
}

export interface WorldLocationItem {
  id: string;
  title: string;
  image: string;
  videoSrc?: string;
  isVideo: boolean;
  accentColor: string;
  strokeColor: string;
  glowColor: string;
  glowStrong: string;
  desc: string;
}

export interface RoadmapMilestone {
  phase: string;
  date: string;
  title: string;
  desc: string;
  status: "completed" | "active" | "upcoming";
  highlight: string;
}

export interface NavLinkItem {
  href: string;
  label: string;
}

export const STEAM_STORE_URL =
  "https://store.steampowered.com/app/3053030/Lunoris/";

export const MAIN_NAV_LINKS: NavLinkItem[] = [
  { href: "#news", label: "Latest News" },
  { href: "#world", label: "The World" },
  { href: "#companions", label: "Companions" },
  { href: "#characters", label: "Characters" },
  { href: "#team", label: "Team" },
  { href: "#roadmap", label: "Roadmap" },
];

export const COMPANIONS_SHOWCASE: CompanionItem[] = [
  {
    name: "Fareeda",
    title: "Sanity & Vision Anchor",
    species: "Scottish Fold Munchkin Cat",
    image: "/assets/fareeda-portrait.png",
    desc: "Glowing Arabic calligraphy of serenity ripples across her fur, projecting a warmth aura that suppresses Fear distortion and keeps shifting corridors stable.",
  },
  {
    name: "Kurtam",
    title: "Aerial Dream Mount",
    species: "Sugar Glider Companion",
    image: "/assets/kurtam-portrait.png",
    desc: "A tiny pocket glider from Lunora's waking life who transforms into a bear-sized aerial mount, riding thermal updrafts across shattered Dream Island chasms.",
  },
  {
    name: "Freddy",
    title: "Ambush Radar & Tracker",
    species: "Miniature Dachshund",
    image: "/assets/freddy-portrait.png",
    desc: "His collar and tail blaze with blue fire whenever unseen threats or buried Echo Shards are near, warning you seconds before Nightmare stalkers strike.",
  },
  {
    name: "Centric",
    title: "High-Altitude Spotter",
    species: "Blue & Gold Macaw",
    image: "/assets/centric-portrait.png",
    desc: "Soars above floating ruins on translucent wings, revealing secret memory doors through dense mist and marking boss weak points from the sky.",
  },
];

export const WORLD_LOCATIONS_SHOWCASE: WorldLocationItem[] = [
  {
    id: "dream-levels",
    title: "Dream Levels",
    image: "/assets/dream-level-1.png",
    isVideo: false,
    accentColor: "#22d3ee",
    strokeColor: "rgba(34, 211, 238, 0.95)",
    glowColor: "rgba(34, 211, 238, 0.48)",
    glowStrong: "rgba(6, 182, 212, 0.78)",
    desc: "Step through Lunora's School doors into all three Dream Levels—soaring across floating islands in The World That Answers, entering the living Van Gogh canvas of The Man in the Memory, and ascending toward Breakthrough's golden portal of hope.",
  },
  {
    id: "retro-games",
    title: "Retro Games",
    image: "/assets/car-level-poster.jpg",
    videoSrc: "/assets/car-level-loop.mp4",
    isVideo: true,
    accentColor: "#fbbf24",
    strokeColor: "rgba(251, 191, 36, 0.96)",
    glowColor: "rgba(251, 191, 36, 0.48)",
    glowStrong: "rgba(245, 158, 11, 0.78)",
    desc: "Cruise a 1967 Chevrolet Impala down an endless midnight highway between dreams, where family keepsakes and dashboard radio frequencies transform 3D memories into playable 2D retro arcade chapters.",
  },
  {
    id: "nightmare",
    title: "Nightmare",
    image: "/assets/fearclaw-boss.png",
    isVideo: false,
    accentColor: "#a855f7",
    strokeColor: "rgba(192, 132, 252, 0.96)",
    glowColor: "rgba(168, 85, 247, 0.52)",
    glowStrong: "rgba(147, 51, 234, 0.82)",
    desc: "Plunge through the fogged mirror or the basement's violet-indigo vortex into shifting Nightmare corridors—crossing magenta dissolve rifts to confront FearClaw or catch your breath at the Matchi Matchi sanctuary.",
  },
];

export const CHARACTERS_GALLERY: CharacterCardItem[] = [
  {
    name: "Lunora",
    lore: "An 18-year-old artist adrift inside her own painted subconscious after a midnight crash on Wahm Lane, fighting to piece her fractured memories back together.",
    image: "/assets/lunora-render.png",
    accent: "#c084fc",
  },
  {
    name: "Fareeda",
    lore: "Lunora's Scottish Fold Munchkin cat. In the dream world, glowing Arabic calligraphy of serenity appears word by word across her fur, dampening incoming fear.",
    image: "/assets/fareeda-portrait.png",
    accent: "#38bdf8",
  },
  {
    name: "Kurtam",
    lore: "A tiny pet sugar glider in reality who manifests as a bear-sized aerial mount in the Dream Realm, carrying Lunora across shattered chasms.",
    image: "/assets/kurtam-portrait.png",
    accent: "#34d399",
  },
  {
    name: "Freddy",
    lore: "Steals socks at home and guards Lunora in the dark. His collar and tail blaze with blue fire as he sniffs out hidden Echo Shards and warns of Nightmare ambushes.",
    image: "/assets/freddy-portrait.png",
    accent: "#60a5fa",
  },
  {
    name: "John Ford",
    lore: "Lunora's greatest supporter and painting partner. His distant presence from the waking world echoes across every realm: 'Find me, Little Bug.'",
    image: "/assets/dad-portrait.png",
    accent: "#fbbf24",
  },
  {
    name: "Centric",
    lore: "Soars high above the Dream Islands with translucent wings, scouting elevated Echo Shards and hidden vantage points.",
    image: "/assets/centric-portrait.png",
    accent: "#f59e0b",
  },
  {
    name: "Young Lunora",
    lore: "Echoes of Lunora at age ten, preserved inside watercolor flashbacks and childhood moments before her mother Lulwah left.",
    image: "/assets/young-lunora-portrait.png",
    accent: "#e879f9",
  },
  {
    name: "Kai",
    lore: "The quiet, remorseful presence on the other side of the Wahm Lane crash who made the emergency call that saved Lunora's life.",
    image: "/assets/kai-portrait.png",
    accent: "#38bdf8",
  },
  {
    name: "Kane",
    lore: "A sixteen-year-old fleeing his own guilt after the collision on Wahm Lane, manifesting inside the storm of the first Nightmare realm.",
    image: "/assets/kane-portrait.png",
    accent: "#f43f5e",
  },
  {
    name: "Samantha",
    lore: "Lunora's friend whose house party triggered the fateful midnight phone call and the drive home down Wahm Lane.",
    image: "/assets/samantha-portrait.png",
    accent: "#34d399",
  },
];

export const ROW_ONE_CAST: CharacterCardItem[] = CHARACTERS_GALLERY.slice(0, 5);
export const ROW_TWO_CAST: CharacterCardItem[] = CHARACTERS_GALLERY.slice(5, 10);

export const ROADMAP_VISUALS: string[] = [
  "/assets/dream-level-1.png",
  "/assets/elar-joy.jpg",
  "/assets/fearclaw-boss.png",
  "/assets/elar-hope.jpg",
];

export const GAME_ROADMAP: RoadmapMilestone[] = [
  {
    phase: "Act I",
    date: "August - September 2026",
    title: "Gamescom Cologne Debut & Free Steam Demo",
    desc: "Playable today on Steam: step inside the Apartment Hub, explore the opening Dream Islands and ELAR sanctuary gardens, and confront FearClaw in the first Nightmare arena.",
    status: "completed",
    highlight: "Playable Now on Steam",
  },
  {
    phase: "Act II",
    date: "Late 2026 - Early 2027",
    title: "The Awakening of ELAR & Companion Bond Loop",
    desc: "Expansion of the 2000x2000 ELAR sanctuary across all nine emotional biomes, four-stage Echo Creature hatching, and simultaneous companion abilities for Freddy, Kurtam, Fareeda, and Centric.",
    status: "active",
    highlight: "Next Sanctuary Update",
  },
  {
    phase: "Act III",
    date: "Mid 2027",
    title: "Seven Dream Islands & Three Nightmare Realms",
    desc: "All seven dreamscape chapters playable end-to-end, featuring the complete nine-weapon emotional arsenal, playable 1988 Diriyah retro flashbacks, and all three major Nightmare Bosses.",
    status: "upcoming",
    highlight: "Upcoming World Expansion",
  },
  {
    phase: "Act IV",
    date: "Late 2027 - Early 2028",
    title: "Full Story Campaign, 9 Endings & Global Launch",
    desc: "Complete story campaign, cinematic finales, the 8+1 Elarion ending paths shaped by how you restore Lunora's memories, New Game Plus, and launch on PC, PlayStation 5, and Xbox Series X|S.",
    status: "upcoming",
    highlight: "Full Game Launch",
  },
];
