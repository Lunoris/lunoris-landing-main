export type EmotionKey = "clarity" | "fear" | "anger" | "sadness" | "hope";

export interface EmotionStateData {
  key: EmotionKey;
  label: string;
  tag: string;
  color: string;
  bg: string;
  overlay: string;
  clarityVal: number;
  secondaryName: string;
  secondaryVal: number;
  chip: string;
  title: string;
  desc: string;
  specs: {
    world: string;
    mechanic: string;
    audio: string;
  };
}

export interface RealmBentoItem {
  id: string;
  span: "wide" | "tall" | "normal";
  kicker: string;
  title: string;
  desc: string;
  mediaType: "image" | "video";
  src: string;
  poster?: string;
  accent: string;
}

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

export const EMOTIONS: Record<EmotionKey, EmotionStateData> = {
  clarity: {
    key: "clarity",
    label: "Clarity & Stillness",
    tag: "Anchor State",
    color: "#38bdf8",
    bg: "/assets/elar-stillness.jpg",
    overlay:
      "linear-gradient(180deg, rgba(14, 165, 233, 0.08) 0%, rgba(7, 6, 13, 0.92) 100%)",
    clarityVal: 92,
    secondaryName: "STILLNESS RESONANCE",
    secondaryVal: 88,
    chip: "REALITY STABILIZED",
    title: "Clarity: The World Holds Together",
    desc: "When Lunora regulates her breathing, fractured floating ruins lock into solid bridges and hidden memory paths illuminate across the sky.",
    specs: {
      world: "Stable horizons, wide camera FOV, luminous constellation bridges",
      mechanic: "Full platforming precision and Lucid Rush air-dash unlocked",
      audio: "Warm cello harmonic layers and calm heartbeat pulse",
    },
  },
  fear: {
    key: "fear",
    label: "Fear & Panic",
    tag: "Distortion Spike",
    color: "#a855f7",
    bg: "/assets/fearclaw-boss.png",
    overlay:
      "linear-gradient(180deg, rgba(147, 51, 234, 0.28) 0%, rgba(7, 6, 13, 0.95) 100%)",
    clarityVal: 28,
    secondaryName: "FEAR INTENSITY",
    secondaryVal: 91,
    chip: "PERCEPTION WARPING",
    title: "Fear: Corridors Stretch Into the Dark",
    desc: "As terror spikes, walls breathe inward, safe ground fractures beneath your feet, and shadow stalkers emerge from peripheral blind spots.",
    specs: {
      world: "Tunnel-vision FOV narrowing,chromatic edge tremor, shifting walls",
      mechanic: "High-speed Panic evasions and long-range sniper focus beam",
      audio: "Sub-bass pressure waves and distant waking-world echoes",
    },
  },
  anger: {
    key: "anger",
    label: "Anger & Volatility",
    tag: "Kinetic Surge",
    color: "#f43f5e",
    bg: "/assets/dream-level-1.png",
    overlay:
      "linear-gradient(180deg, rgba(225, 29, 72, 0.26) 0%, rgba(7, 6, 13, 0.94) 100%)",
    clarityVal: 46,
    secondaryName: "VOLATILITY CHARGE",
    secondaryVal: 86,
    chip: "COMBAT OVERDRIVE",
    title: "Anger: Shatter Every Barrier",
    desc: "Suppressed rage ignites the sky in crimson embers. Defensive hesitation vanishes as the Breaker blade cleaves straight through Nightmare armor.",
    specs: {
      world: "Heat-shimmer horizons, ember storms, destructible stone pillars",
      mechanic: "Heavy Breaker sword combos and close-range kinetic shockwaves",
      audio: "Distortedindustrial percussion and rising brass swells",
    },
  },
  sadness: {
    key: "sadness",
    label: "Grief & Sorrow",
    tag: "Memory Pull",
    color: "#60a5fa",
    bg: "/assets/elar-stillness.jpg",
    overlay:
      "linear-gradient(180deg, rgba(37, 99, 235, 0.26) 0%, rgba(7, 6, 13, 0.94) 100%)",
    clarityVal: 54,
    secondaryName: "GRIEF DEPTH",
    secondaryVal: 79,
    chip: "ECHO VISIBILITY",
    title: "Sadness: Rain Reveals What Was Lost",
    desc: "Sorrow slows the world down. Heavy rain fills sunken basins to float new pathways while uncovering echoed conversations from Wahm Lane.",
    specs: {
      world: "Monochrome mist, rising water reflections, slow-motion rain",
      mechanic: "Reveals invisible memory footprints and sustained carbine fire",
      audio: "Reverberant solo piano and whispered memory voices",
    },
  },
  hope: {
    key: "hope",
    label: "Hope & Renewal",
    tag: "ELAR Bloom",
    color: "#34d399",
    bg: "/assets/elar-hope.jpg",
    overlay:
      "linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, rgba(7, 6, 13, 0.92) 100%)",
    clarityVal: 96,
    secondaryName: "HOPE BLOOM",
    secondaryVal: 95,
    chip: "GARDEN AWAKENING",
    title: "Hope: Color Returns to the Void",
    desc: "Surviving the Nightmare converts raw emotional energy into Echo Lights, awakening dormant cocoons and painting the colourless void in living flora.",
    specs: {
      world: "Zero fog, full bioluminescent saturation, floating blossom currents",
      mechanic: "Awakens Echo Creatures and breaks endless Nightmare panic loops",
      audio: "Full orchestral bloom with choral harmonies",
    },
  },
};

export const REALM_BENTO: RealmBentoItem[] = [
  {
    id: "elar",
    span: "wide",
    kicker: "Persistent Open Sanctuary",
    title: "ELAR: The Living Inner Garden",
    desc: "A 2000x2000 open world with zero enemies and zero timers. Enter through the backyard well to turn Echo Lights into living creatures across nine emotional biomes that transform from blank fog into vibrant color.",
    mediaType: "image",
    src: "/assets/elar-joy.jpg",
    accent: "#34d399",
  },
  {
    id: "retro",
    span: "normal",
    kicker: "Playable Memory Flashbacks",
    title: "1988 Diriyah & Retro Memories",
    desc: "Step inside playable nostalgia: drive a 1967 Chevrolet Impala through 1988 Diriyah or hunt with falcons in top-down retro flashbacks that piece together Lunora's family history.",
    mediaType: "video",
    src: "/assets/car-level-loop.mp4",
    poster: "/assets/car-level-poster.jpg",
    accent: "#fbbf24",
  },
  {
    id: "dreams",
    span: "normal",
    kicker: "Seven Chapters of Grief",
    title: "3D Dream Islands",
    desc: "Traverse surreal floating architecture shaped by denial, bargaining, and acceptance. Ride aerial currents on Kurtam and solve spatial puzzles where perspective shifts reality.",
    mediaType: "image",
    src: "/assets/dream-level-1.png",
    accent: "#38bdf8",
  },
  {
    id: "nightmare",
    span: "normal",
    kicker: "High-Tension Survival",
    title: "The Nightmare Realms",
    desc: "Cross through the apartment mirror into the Void Loadout and face wave survival arenas, claustrophobic panic tunnels, and towering bosses like FearClaw.",
    mediaType: "image",
    src: "/assets/fearclaw-boss.png",
    accent: "#f43f5e",
  },
  {
    id: "hub",
    span: "normal",
    kicker: "Where Every Loop Begins",
    title: "The Shifting Apartment Hub",
    desc: "Lunora's dreamscape apartment anchors every run. Listen for Freddy's paws in the hallway, Fareeda's purr by the couch, and subtle waking-world echoes drifting through the walls.",
    mediaType: "image",
    src: "/assets/elar-stillness.jpg",
    accent: "#c084fc",
  },
];

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
    lore: "The quiet, remorseful voice on the other side of the Wahm Lane crash who made the 911 call that saved Lunora's life.",
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
    phase: "Milestone I",
    date: "August - September 2026",
    title: "Gamescom Cologne Debut & Playable Demo",
    desc: "First public hands-on demo showcased at the Gamescom Indie Castle booth in Cologne. Honored with the 'Van Gogh' Art Award and shipped with Chapter 1 Dream Levels, ELAR gardens, and the FearClaw boss.",
    status: "completed",
    highlight: "Shipped & Award Winner",
  },
  {
    phase: "Milestone II",
    date: "Late 2026 - Early 2027",
    title: "The Awakening of ELAR & Companion Bond Loop",
    desc: "Full expansion of the 2000x2000 ELAR sanctuary across nine emotional biomes, four-stage Echo Creature hatching, and simultaneous companion abilities for Freddy, Kurtam, Fareeda, and Centric.",
    status: "active",
    highlight: "In Active Production",
  },
  {
    phase: "Milestone III",
    date: "Mid 2027",
    title: "Seven Dream Islands & Three Nightmare Realms",
    desc: "All seven grief-stage story chapters playable end-to-end, featuring the complete nine-weapon emotional arsenal, 2D retro memory flashbacks, and all three major Realm Boss encounters.",
    status: "upcoming",
    highlight: "World Content Complete",
  },
  {
    phase: "Milestone IV",
    date: "Late 2027 - Early 2028",
    title: "Full Voice Capture, 9 Endings & Global Launch",
    desc: "Complete SAG-AFTRA voice performances, Unreal Engine 5 cinematic sequences, the 8+1 Elarion behavioral ending system, New Game Plus, and release across PC, PlayStation 5, and Xbox Series X|S.",
    status: "upcoming",
    highlight: "Full Release Target",
  },
];
