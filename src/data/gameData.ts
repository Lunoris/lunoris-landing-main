export interface CharacterCardItem {
  name: string;
  role: string;
  voiceOrTrait: string;
  lore: string;
  image: string;
  accent: string;
}

export interface RoadmapMilestone {
  phase: string;
  date: string;
  title: string;
  desc: string;
  status: "completed" | "active" | "upcoming";
  highlight: string;
}

export const CHARACTERS_GALLERY: CharacterCardItem[] = [
  {
    name: "Lunora",
    role: "Protagonist (Age 18)",
    voiceOrTrait: "Voiced by Kira Buckland",
    lore: "An 18-year-old artist adrift inside her own painted subconscious after a midnight crash on Wahm Lane, fighting to piece her fractured memories back together.",
    image: "/assets/lunora-render.png",
    accent: "#c084fc",
  },
  {
    name: "Fareeda",
    role: "Munchkin Cat Companion",
    voiceOrTrait: "Embodiment of Warmth",
    lore: "Lunora's Scottish Fold Munchkin cat. In the dream world, glowing Arabic calligraphy of serenity appears word by word across her fur, dampening incoming fear.",
    image: "/assets/fareeda-portrait.png",
    accent: "#38bdf8",
  },
  {
    name: "Kurtam",
    role: "Sugar Glider Companion",
    voiceOrTrait: "Embodiment of Clarity",
    lore: "A tiny pet sugar glider in reality who manifests as a bear-sized aerial mount in the Dream Realm, carrying Lunora across shattered chasms.",
    image: "/assets/kurtam-portrait.png",
    accent: "#34d399",
  },
  {
    name: "Freddy",
    role: "Miniature Dachshund",
    voiceOrTrait: "Embodiment of Loyalty",
    lore: "Steals socks at home and guards Lunora in the dark. His collar and tail blaze with blue fire as he sniffs out hidden Echo Shards and warns of Nightmare ambushes.",
    image: "/assets/freddy-portrait.png",
    accent: "#60a5fa",
  },
  {
    name: "John Ford",
    role: "Lunora's Father",
    voiceOrTrait: "Voiced by Scott Dreier",
    lore: "Lunora's greatest supporter and painting partner. His distant voice from the waking world echoes across every realm: 'Find me, Little Bug.'",
    image: "/assets/dad-portrait.png",
    accent: "#fbbf24",
  },
  {
    name: "Centric",
    role: "Blue & Gold Macaw",
    voiceOrTrait: "Voiced by Pete Capella",
    lore: "Soars high above the Dream Islands with translucent wings, scouting elevated Echo Shards and hidden vantage points.",
    image: "/assets/centric-portrait.png",
    accent: "#f59e0b",
  },
  {
    name: "Young Lunora",
    role: "Childhood Memory Form",
    voiceOrTrait: "Voiced by LilyPichu",
    lore: "Echoes of Lunora at age ten, preserved inside watercolor flashbacks and childhood moments before her mother Lulwah left.",
    image: "/assets/young-lunora-portrait.png",
    accent: "#e879f9",
  },
  {
    name: "Kai",
    role: "The Calm Conscience",
    voiceOrTrait: "Voiced by Ryan Drummond",
    lore: "The quiet, remorseful voice on the other side of the Wahm Lane crash who made the emergency call that saved Lunora's life.",
    image: "/assets/kai-portrait.png",
    accent: "#38bdf8",
  },
  {
    name: "Kane",
    role: "The Reckless Driver",
    voiceOrTrait: "Voiced by David Humphrey",
    lore: "A sixteen-year-old fleeing his own guilt after the collision on Wahm Lane, manifesting inside the storm of the first Nightmare realm.",
    image: "/assets/kane-portrait.png",
    accent: "#f43f5e",
  },
  {
    name: "Samantha",
    role: "The Party Host",
    voiceOrTrait: "Chapter 0 Memory Anchor",
    lore: "Lunora's friend whose house party triggered the fateful midnight phone call and the drive home down Wahm Lane.",
    image: "/assets/samantha-portrait.png",
    accent: "#34d399",
  },
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
    desc: "Full voiced story campaign, cinematic finales, the 8+1 Elarion ending paths shaped by how you restore Lunora's memories, New Game Plus, and launch on PC, PlayStation 5, and Xbox Series X|S.",
    status: "upcoming",
    highlight: "Full Game Launch",
  },
];
