export interface DreamArcBeat {
  step: string;
  name: string;
  desc: string;
  image: string;
}

export interface DreamArchitectureCard {
  id: string;
  wikiSlug: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  highlights: string[];
  image: string;
  accentColor: string;
}

export interface DreamLevelShowcaseItem {
  id: string;
  wikiSlug: string;
  number: string;
  title: string;
  roleSuffix: string;
  realmBadge: string;
  emotions: string[];
  image: string;
  secondaryImages: { url: string; caption: string }[];
  accentColor: string;
  glowColor: string;
  overview: string;
  chapter1Title: string;
  chapter1Door: string;
  chapter1Image: string;
  chapter1Bullets: string[];
  chapter2Title: string;
  chapter2Door: string;
  chapter2Image: string;
  chapter2Bullets: string[];
  keyMechanics: string[];
}

export interface DreamSystemCard {
  id: string;
  wikiSlug: string;
  category: string;
  title: string;
  summary: string;
  detail: string;
  image: string;
  accentColor: string;
}

export interface DreamLevelsPageCopy {
  backToWorld: string;
  navWorld: string;
  navArchitecture: string;
  navLevels: string;
  navSystems: string;
  heroMinor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroOverview: string;
  arcLabel: string;
  arcBeats: DreamArcBeat[];
  architectureMinor: string;
  architectureMajor: string;
  architectureBody: string;
  architectureCards: DreamArchitectureCard[];
  levelsMinor: string;
  levelsMajor: string;
  levelsBody: string;
  chapter1Badge: string;
  chapter2Badge: string;
  connectedSystemsLabel: string;
  inGameCapturesLabel: string;
  levels: DreamLevelShowcaseItem[];
  systemsMinor: string;
  systemsMajor: string;
  systemsBody: string;
  systems: DreamSystemCard[];
  returnCtaTitle: string;
  returnCtaBody: string;
  returnCtaBtn: string;
}

const EN_DREAM_LEVELS_COPY: DreamLevelsPageCopy = {
  backToWorld: "Return to World Portals",
  navWorld: "World Portals",
  navArchitecture: "Architecture",
  navLevels: "Dream Levels",
  navSystems: "Systems",
  heroMinor: "PRIMARY CAMPAIGN MODE · DREAM REALM",
  heroTitle: "DREAM LEVELS",
  heroSubtitle: "3D Platforming Through Seven Stages of Grief",
  heroOverview:
    "Every jump, glide, and climb expresses Lunora's inner state across seven surreal dream worlds.",
  arcLabel: "FOUR-BEAT EMOTIONAL ARC",
  arcBeats: [
    {
      step: "01",
      name: "CALM",
      desc: "First glimpse of the distant Dream Fragment.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
    },
    {
      step: "02",
      name: "FLOW",
      desc: "Rhythmic 3D parkour across Floating Stones.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/ccf85061-8ced-4b14-a417-981a78a6e4fc/thumbnail.jpg",
    },
    {
      step: "03",
      name: "CONFRONTATION",
      desc: "Memory echoes and timed Nightmare eruptions.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306435936-0-yho2HHpeActFU6BMYNOskLukZ5ex5P",
    },
    {
      step: "04",
      name: "RELIEF",
      desc: "Scattered stones align into a path to the Fragment.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/2d6bc5fd-cd30-46ae-be21-1e1c2d811bd3/thumbnail.jpg",
    },
  ],
  architectureMinor: "SPATIAL TOPOLOGY · HUB TO PORTAL",
  architectureMajor: "HOW DREAM LEVELS CONNECT",
  architectureBody:
    "Seamless diegetic transitions from Lunora's apartment onto floating islands and portal doors.",
  architectureCards: [
    {
      id: "dream-hub",
      wikiSlug: "dreamhub",
      badge: "CONNECTIVE LAYER",
      title: "Dream Hub",
      subtitle: "Purple-Lit Dream Apartment (~7 Rooms & 7 Doors)",
      desc: "Central apartment hub that visually restores across 3 stages as Lunora spends Lucid Orbs.",
      highlights: [
        "7 Chapter Doors",
        "Retro Vision (R3) Keepsakes",
        "Mirror → Nightmare · Well → ELAR",
      ],
      image: "/assets/dreamhub-scene.png",
      accentColor: "#a78bfa",
    },
    {
      id: "dream-islands",
      wikiSlug: "dream-islands",
      badge: "CHAPTER HUBS",
      title: "7 Dream Islands",
      subtitle: "Calm 100×100m Portal Spaces for Each Grief Stage",
      desc: "Safe emotional hubs between Dream Hub and playable levels, each housing 3 Portal Doors.",
      highlights: [
        "Ch. 1: Party House",
        "Ch. 2: Suburban Backyard",
        "100% Clarity · Zero Hazards",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/4416862e-2192-4e40-8630-70b9fa4774b2/1792633504864-0-GhjCjqdobLw0TDhD11xKzJ2zoV2WBO",
      accentColor: "#22d3ee",
    },
    {
      id: "doors-and-gates",
      wikiSlug: "dream-gates",
      badge: "THRESHOLDS",
      title: "Portal Doors & Dream Gates",
      subtitle: "Red/Green State Doors & Shatter Transitions",
      desc: "Doors glow Red when locked and Green when open, shattering into seamless realm transitions.",
      highlights: [
        "Glass Shatter Dissolve",
        "Seamless FMOD Crossfade",
        "Zero Loading Screens",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793203304408-0-pKuTvmqEkTMwd2WfAXunbfmXYvjaDW",
      accentColor: "#f5c451",
    },
    {
      id: "dream-fragment",
      wikiSlug: "dream-fragment",
      badge: "PRIMARY OBJECTIVE",
      title: "Dream Fragment",
      subtitle: "Distant Horizon Landmark & Level Goal",
      desc: "Glimpsed from afar at the start and reached at the summit to resolve each core memory.",
      highlights: [
        "3-Stage Horizon Beacon",
        "Resolves Chapter Memory",
        "Unlocks Return Portal",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999364723-0-2rM3UXsRcNO8TMIFr6PgU2n13Ji3pD",
      accentColor: "#34d399",
    },
  ],
  levelsMinor: "THREE PORTALS PER CHAPTER · PLAYABLE SPACES",
  levelsMajor: "THE THREE DREAM LEVELS",
  levelsBody:
    "Three portal worlds that transform between Chapter 1 (Denial, Shock, Breakthrough) and Chapter 2 (Pain, Guilt, Regret).",
  chapter1Badge: "CHAPTER 1 · PARTY HOUSE",
  chapter2Badge: "CHAPTER 2 · SUBURBAN BACKYARD",
  connectedSystemsLabel: "Key Mechanics",
  inGameCapturesLabel: "In-Game Captures (Click to Preview)",
  levels: [
    {
      id: "dream-level-1",
      wikiSlug: "dream-level-1",
      number: "LEVEL 01",
      title: "DREAM LEVEL 1",
      roleSuffix: "Denial (Ch. 1) & Pain (Ch. 2)",
      realmBadge: "DREAM REALM · PUBLIC DEMO",
      emotions: ["Wonder", "Sadness", "Fear"],
      image: "/assets/dream-level-1.png",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/96c0a386-9971-485b-a452-b3b43da19805/1786716524919-1-5J9JtWJItZDhMDOg6eaudr51ve4GKi",
          caption: "Diriyah Desert Architecture Bleed-Through",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/ccf85061-8ced-4b14-a417-981a78a6e4fc/thumbnail.jpg",
          caption: "Sliding Stone Platforms Over the Ravine",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999383139-0-N9KU6i8y8yIfAtbSP3HjVVbwHGnTxl",
          caption: "Violet-Blue Lucid Orb Crystals",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999380779-0-4jpiiHxB4dcn7yQa3aR38lT6xt5muh",
          caption: "Painting Quest Rainbow Forest Edge",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/9dff2316-0d4d-41f2-ac23-345435170cd6/thumbnail.jpg",
          caption: "Checkpoint Vista Near the Dream Fragment",
        },
      ],
      accentColor: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 0.35)",
      overview:
        "A 10-section surreal forest blended with Diriyah desert ruins where perception unlocks the path forward.",
      chapter1Title: "Denial Forest & Diriyah Ruins",
      chapter1Door: "Door 1 — Party House",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/96c0a386-9971-485b-a452-b3b43da19805/1786716524919-1-5J9JtWJItZDhMDOg6eaudr51ve4GKi",
      chapter1Bullets: [
        "4 floating stone slabs lock into a bridge over the ravine.",
        "Al-Ghashwa falcon hood & Dad's Rainbow Painting Quest.",
      ],
      chapter2Title: "Volcanic Smoke Canyon (Kai's Pain)",
      chapter2Door: "Door 1 — Backyard Toolshed",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792083625535-0-nrNdTZX2qvSGFIGsaylCs6z7kldQDK",
      chapter2Bullets: [
        "Crumbling volcanic rock, rolling boulders, and toxic smoke.",
        "Safe air pockets created by The Guide & Kai's Sketch Portal.",
      ],
      keyMechanics: [
        "Sliding Stone Bridge",
        "Pearl Necklace Summon",
        "Al-Ghashwa Hood",
        "Painting & Sketch Quests",
      ],
    },
    {
      id: "dream-level-2",
      wikiSlug: "dream-level-2",
      number: "LEVEL 02",
      title: "DREAM LEVEL 2",
      roleSuffix: "Shock (Ch. 1) & Guilt (Ch. 2)",
      realmBadge: "DREAM → NIGHTMARE RIFT · DEMO",
      emotions: ["Fear", "Hope", "Guilt"],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306424841-0-t-Bk3C2BwvYNaWcFtkkhZwKlk62Ix4O8",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
          caption: "Dual-Skybox Shader & Aerial Forest Islands",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306435936-0-yho2HHpeActFU6BMYNOskLukZ5ex5P",
          caption: "Fractured Sky Islands & Kurtam Gliding Gaps",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/998903bc-d448-44a9-a70b-e4a9c3926859/retro-1775577657678909-4-7pID94WSGiESiLJDmCwaHj15cc2gKA",
          caption: "Dream Island Portal Threshold",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793203304408-0-pKuTvmqEkTMwd2WfAXunbfmXYvjaDW",
          caption: "Shatter Portal Gate into Nightmare Rift",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/4416862e-2192-4e40-8630-70b9fa4774b2/1792633504864-0-GhjCjqdobLw0TDhD11xKzJ2zoV2WBO",
          caption: "Suspended Island Horizon Vista",
        },
      ],
      accentColor: "#a78bfa",
      glowColor: "rgba(167, 139, 250, 0.35)",
      overview:
        "Suspended sky islands where Kurtam gliding and echoing memory lines end in Lunora's first Nightmare rift.",
      chapter1Title: "Fractured Sky Forest & Nightmare Rift",
      chapter1Door: "Door 2 — Party House",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
      chapter1Bullets: [
        "Kurtam aerial gliding across suspended islands & dual skyboxes.",
        "1967 Chevy Impala collectible & Breaker rift into Nightmare.",
      ],
      chapter2Title: "The Giant Treehouse (Kane's Guilt)",
      chapter2Door: "Door 2 — Backyard Treehouse",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306435936-0-yho2HHpeActFU6BMYNOskLukZ5ex5P",
      chapter2Bullets: [
        "Vertical climb through brother Kane's fractured childhood hideout.",
        "Updates the Backyard hub with Kane holding his pocketknife.",
      ],
      keyMechanics: [
        "Kurtam Aerial Gliding",
        "Memory-Line Stabilization",
        "Toy Car (Chevy Impala)",
        "Breaker Rift → Nightmare",
      ],
    },
    {
      id: "dream-level-3",
      wikiSlug: "dream-level-3",
      number: "LEVEL 03",
      title: "DREAM LEVEL 3",
      roleSuffix: "Breakthrough (Ch. 1) & Museum of Regrets (Ch. 2)",
      realmBadge: "CHAPTER FINALE · POST-BOSS UNLOCK",
      emotions: ["Hope", "Serenity", "Guilt"],
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/2d6bc5fd-cd30-46ae-be21-1e1c2d811bd3/thumbnail.jpg",
      secondaryImages: [
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/5c0ebfe9-b6e6-4b9c-bb3f-28141da5d041/thumbnail.jpg",
          caption: "Ascending Toward the Sky-High Dream Fragment",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999385425-0-gpldLljRZludwWdXf4pVTsv4jDVGMJ",
          caption: "FloatingStairAssembly — Stones Forming a Sky Bridge",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792944632410-0-kT7mJ2cwdLVokV0bedNSlpNDcXsJKb",
          caption: "Summit Cliff at the Top of the Answer Stairs",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/preview/1792870270491-Kd2S3YCj6NiH1OlcIThvtg6LF1rgxr.webp",
          caption: "DL3 Arrival Camera Vista",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999364723-0-2rM3UXsRcNO8TMIFr6PgU2n13Ji3pD",
          caption: "Dream Fragment Beacon on the Summit",
        },
      ],
      accentColor: "#f5c451",
      glowColor: "rgba(245, 196, 81, 0.35)",
      overview:
        "Unlocked after FearClaw: admitting Lunora cannot cross alone causes The Guide to assemble void stones into a soaring stairway.",
      chapter1Title: "Breakthrough — Floating Stairway Finale",
      chapter1Door: "Door 3 — Party House (Post-FearClaw)",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999385425-0-gpldLljRZludwWdXf4pVTsv4jDVGMJ",
      chapter1Bullets: [
        "The Guide pulls scattered void stones into a soaring stairway bridge.",
        "Culminates in a final exchange with Dad's shadow.",
      ],
      chapter2Title: "Museum of Regrets (Non-Euclidean House)",
      chapter2Door: "Door 3 — Neighbor's House (Post-Icerend)",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792944629833-1-qwQBcWGBOFwOW4eHLZnBEzWkMluEdI",
      chapter2Bullets: [
        "4 curated memory rooms ending in a non-Euclidean attic.",
        "Three-Pass Mannequin Crash flips the room upside down.",
      ],
      keyMechanics: [
        "FloatingStairAssembly",
        "Spatial Reconfiguration",
        "Nightmare Encounters",
        "Mannequin Crash Finale",
      ],
    },
  ],
  systemsMinor: "WIKI MECHANICS & REALM RULES",
  systemsMajor: "SYSTEMS GOVERNING THE DREAM REALM",
  systemsBody:
    "Generous platforming, perceptual alignment, and zero-punishment recovery.",
  systems: [
    {
      id: "perception-shift",
      wikiSlug: "perception-shift-system",
      category: "CORE ABILITY",
      title: "Perception Shift",
      summary: "3–6s window where unstable geometry aligns into a true path.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792515697878-0-XQffXQ3a2ZVW1fFmaavWbVG3JAXy8M",
      accentColor: "#22d3ee",
    },
    {
      id: "floating-stones",
      wikiSlug: "mechanic-floating-stones",
      category: "TRAVERSAL",
      title: "Floating Stones & Flow",
      summary: "Generous platforms that boost momentum and never crumble.",
      detail: "",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/2d6bc5fd-cd30-46ae-be21-1e1c2d811bd3/thumbnail.jpg",
      accentColor: "#34d399",
    },
    {
      id: "nightmare-encounters",
      wikiSlug: "nightmare-encounters",
      category: "REALM ERUPTION",
      title: "Nightmare Encounters",
      summary: "Timed 4-phase emotional eruptions ending in a burst of light.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/673a6d46-73c9-45da-9fc8-9b9f275ab830/1786950734825-1-tcV3oXw17PM8CrS4jsP15vFpLKLFbh",
      accentColor: "#c084fc",
    },
    {
      id: "failure-recovery",
      wikiSlug: "failure-recovery",
      category: "THERAPEUTIC DESIGN",
      title: "Failure & Recovery",
      summary: "Instant soft-fade checkpoint reset with zero loading screens.",
      detail: "",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/9dff2316-0d4d-41f2-ac23-345435170cd6/thumbnail.jpg",
      accentColor: "#f5c451",
    },
    {
      id: "symbolic-puzzles",
      wikiSlug: "mechanic-puzzles",
      category: "ATTUNEMENT",
      title: "Symbolic Puzzles",
      summary: "Meditative memory shrines and cracked glass bridges.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/9b4ef678-3149-4b51-aa2e-f7f57ce4e02f/1788593797683-1-whUGWSi75dOTygzfo3RRza3fyg39DI",
      accentColor: "#60a5fa",
    },
    {
      id: "pulse-scan",
      wikiSlug: "ability-pulse",
      category: "EXPLORATION SENSE",
      title: "Pulse & Echo Keepsakes",
      summary: "Shader wave highlighting hidden keepsakes and quest landmarks.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792083596781-0-dGOngbtHZRJ2wT6CvraIbXZP0v10jt",
      accentColor: "#38bdf8",
    },
  ],
  returnCtaTitle: "STEP BACK THROUGH THE PORTAL",
  returnCtaBody:
    "Explore the Retro Memories, Nightmare Realm, and gardens of ELAR.",
  returnCtaBtn: "Return to World Portals",
};

const RU_DREAM_LEVELS_COPY: DreamLevelsPageCopy = {
  backToWorld: "Вернуться к порталам мира",
  navWorld: "Порталы мира",
  navArchitecture: "Архитектура",
  navLevels: "Уровни снов",
  navSystems: "Системы",
  heroMinor: "ОСНОВНОЙ РЕЖИМ КАМПАНИИ · МИР СНОВ",
  heroTitle: "DREAM LEVELS",
  heroSubtitle: "3D-платформинг сквозь семь стадий принятия утраты",
  heroOverview:
    "Каждый прыжок, полёт и подъём отражает внутреннее состояние Луноры в семи сюрреалистических мирах.",
  arcLabel: "ЧЕТЫРЕ ФАЗЫ КАЖДОГО УРОВНЯ",
  arcBeats: [
    {
      step: "01",
      name: "СПОКОЙСТВИЕ",
      desc: "Первый взгляд на далёкий Фрагмент Сна.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
    },
    {
      step: "02",
      name: "ПОТОК",
      desc: "Ритмичный паркур по Парящим Камням.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/ccf85061-8ced-4b14-a417-981a78a6e4fc/thumbnail.jpg",
    },
    {
      step: "03",
      name: "СТОЛКНОВЕНИЕ",
      desc: "Тени прошлого и вспышки Кошмара.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306435936-0-yho2HHpeActFU6BMYNOskLukZ5ex5P",
    },
    {
      step: "04",
      name: "ОБЛЕГЧЕНИЕ",
      desc: "Камни собираются в мост к Фрагменту Сна.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/2d6bc5fd-cd30-46ae-be21-1e1c2d811bd3/thumbnail.jpg",
    },
  ],
  architectureMinor: "ПРОСТРАНСТВЕННАЯ ТОПОЛОГИЯ · ОТ ХАБА К ПОРТАЛУ",
  architectureMajor: "КАК УСТРОЕНЫ УРОВНИ СНОВ",
  architectureBody:
    "Бесшовные переходы из квартиры Луноры на парящие острова и сквозь портальные двери.",
  architectureCards: [
    {
      id: "dream-hub",
      wikiSlug: "dreamhub",
      badge: "СВЯЗУЮЩИЙ ХАБ",
      title: "Dream Hub",
      subtitle: "Квартира снов (~7 комнат и 7 дверей)",
      desc: "Центральный хаб в пурпурном свете, восстанавливающийся в 3 стадии за Сферы Ясности.",
      highlights: [
        "7 дверей глав",
        "Артефакты Retro Vision (R3)",
        "Зеркало → Кошмар · Колодец → ELAR",
      ],
      image: "/assets/dreamhub-scene.png",
      accentColor: "#a78bfa",
    },
    {
      id: "dream-islands",
      wikiSlug: "dream-islands",
      badge: "ХАБЫ ГЛАВ",
      title: "7 Островов Снов",
      subtitle: "Спокойные пространства 100×100 м для 7 стадий горя",
      desc: "Безопасные острова между Dream Hub и уровнями, на каждом — 3 портальные двери.",
      highlights: [
        "Гл. 1: Party House",
        "Гл. 2: Задний двор",
        "100% Ясность · Без ловушек",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/4416862e-2192-4e40-8630-70b9fa4774b2/1792633504864-0-GhjCjqdobLw0TDhD11xKzJ2zoV2WBO",
      accentColor: "#22d3ee",
    },
    {
      id: "doors-and-gates",
      wikiSlug: "dream-gates",
      badge: "ПОРТАЛЫ И ВРАТА",
      title: "Двери и Врата Снов",
      subtitle: "Индикация дверей и стеклянный разлом",
      desc: "Двери светятся красным или зелёным и раскалывают пространство без экранов загрузки.",
      highlights: [
        "Эффект Shattered Reality",
        "Кроссфейд музыки FMOD",
        "Без экранов загрузки",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793203304408-0-pKuTvmqEkTMwd2WfAXunbfmXYvjaDW",
      accentColor: "#f5c451",
    },
    {
      id: "dream-fragment",
      wikiSlug: "dream-fragment",
      badge: "ГЛАВНАЯ ЦЕЛЬ",
      title: "Фрагмент Сна",
      subtitle: "Маяк на горизонте и цель каждого уровня",
      desc: "Виден издалека с первых шагов и ждёт на вершине, завершая воспоминание главы.",
      highlights: [
        "Ориентир в 3 этапа",
        "Исцеление памяти",
        "Возврат на Остров Снов",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999364723-0-2rM3UXsRcNO8TMIFr6PgU2n13Ji3pD",
      accentColor: "#34d399",
    },
  ],
  levelsMinor: "ТРИ ПОРТАЛА В КАЖДОЙ ГЛАВЕ · ИГРОВЫЕ МИРЫ",
  levelsMajor: "ТРИ УРОВНЯ СНОВ",
  levelsBody:
    "Три портальных мира, меняющих облик между Главой 1 (Отрицание, Шок, Прорыв) и Главой 2 (Боль, Вина, Сожаление).",
  chapter1Badge: "ГЛАВА 1 · PARTY HOUSE",
  chapter2Badge: "ГЛАВА 2 · ЗАДНИЙ ДВОР",
  connectedSystemsLabel: "Ключевые механики",
  inGameCapturesLabel: "Кадры из билда (нажмите для просмотра)",
  levels: [
    {
      id: "dream-level-1",
      wikiSlug: "dream-level-1",
      number: "УРОВЕНЬ 01",
      title: "DREAM LEVEL 1",
      roleSuffix: "Отрицание (Гл. 1) и Боль (Гл. 2)",
      realmBadge: "МИР СНОВ · ПУБЛИЧНОЕ ДЕМО",
      emotions: ["Wonder", "Sadness", "Fear"],
      image: "/assets/dream-level-1.png",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/96c0a386-9971-485b-a452-b3b43da19805/1786716524919-1-5J9JtWJItZDhMDOg6eaudr51ve4GKi",
          caption: "Руины пустыни Дирия сквозь лес снов",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/ccf85061-8ced-4b14-a417-981a78a6e4fc/thumbnail.jpg",
          caption: "Каменный мост над пропастью",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999383139-0-N9KU6i8y8yIfAtbSP3HjVVbwHGnTxl",
          caption: "Кристаллы Сфер Ясности (Lucid Orbs)",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999380779-0-4jpiiHxB4dcn7yQa3aR38lT6xt5muh",
          caption: "Живописный край мира (Painting Quest)",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/9dff2316-0d4d-41f2-ac23-345435170cd6/thumbnail.jpg",
          caption: "Чекпоинт у Фрагмента Сна",
        },
      ],
      accentColor: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 0.35)",
      overview:
        "Сюрреалистический лес из 10 секций с отголосками пустыни Дирия, где восприятие открывает путь вперёд.",
      chapter1Title: "Лес Отрицания и пустыня Дирия",
      chapter1Door: "Дверь 1 — Party House",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/96c0a386-9971-485b-a452-b3b43da19805/1786716524919-1-5J9JtWJItZDhMDOg6eaudr51ve4GKi",
      chapter1Bullets: [
        "4 парящие плиты соединяются в мост над ущельем.",
        "Клобучок сокола Al-Ghashwa и квест с картинами отца.",
      ],
      chapter2Title: "Вулканический каньон (Боль Кая)",
      chapter2Door: "Дверь 1 — Садовый сарай",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792083625535-0-nrNdTZX2qvSGFIGsaylCs6z7kldQDK",
      chapter2Bullets: [
        "Обрушивающиеся скалы, валуны и токсичный дым.",
        "Купола чистого воздуха от Проводника и портал рисунка Кая.",
      ],
      keyMechanics: [
        "Мост из парящих плит",
        "Жемчужное ожерелье",
        "Клобучок Al-Ghashwa",
        "Painting & Sketch Quests",
      ],
    },
    {
      id: "dream-level-2",
      wikiSlug: "dream-level-2",
      number: "УРОВЕНЬ 02",
      title: "DREAM LEVEL 2",
      roleSuffix: "Шок (Гл. 1) и Вина (Гл. 2)",
      realmBadge: "МИР СНОВ → РАЗЛОМ КОШМАРА · ДЕМО",
      emotions: ["Fear", "Hope", "Guilt"],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306424841-0-t-Bk3C2BwvYNaWcFtkkhZwKlk62Ix4O8",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
          caption: "Слияние двух скайбоксов и небесные острова",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306435936-0-yho2HHpeActFU6BMYNOskLukZ5ex5P",
          caption: "Маршруты планирования с соколом Куртамом",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/998903bc-d448-44a9-a70b-e4a9c3926859/retro-1775577657678909-4-7pID94WSGiESiLJDmCwaHj15cc2gKA",
          caption: "Портальная арка Острова Снов",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793203304408-0-pKuTvmqEkTMwd2WfAXunbfmXYvjaDW",
          caption: "Расколотый портал в разлом Кошмара",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/4416862e-2192-4e40-8630-70b9fa4774b2/1792633504864-0-GhjCjqdobLw0TDhD11xKzJ2zoV2WBO",
          caption: "Панорама парящего острова",
        },
      ],
      accentColor: "#a78bfa",
      glowColor: "rgba(167, 139, 250, 0.35)",
      overview:
        "Расколотые небесные острова, полёты с Куртамом и первый провал Луноры в Мир Кошмаров.",
      chapter1Title: "Небесный лес и разлом Кошмара",
      chapter1Door: "Дверь 2 — Party House",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
      chapter1Bullets: [
        "Планирование с соколом Куртамом под двойным небом.",
        "Игрушечная Chevy Impala и провал через разлом меча Breaker.",
      ],
      chapter2Title: "Домик на дереве (Вина Кейна)",
      chapter2Door: "Дверь 2 — Домик на дереве",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306435936-0-yho2HHpeActFU6BMYNOskLukZ5ex5P",
      chapter2Bullets: [
        "Вертикальный подъём сквозь детские воспоминания брата Кейна.",
        "После прохождения Кейн появляется во дворе с перочинным ножом.",
      ],
      keyMechanics: [
        "Планирование с Куртамом",
        "Стабилизация линий памяти",
        "Игрушечная Impala",
        "Разлом Breaker → Кошмар",
      ],
    },
    {
      id: "dream-level-3",
      wikiSlug: "dream-level-3",
      number: "УРОВЕНЬ 03",
      title: "DREAM LEVEL 3",
      roleSuffix: "Прорыв (Гл. 1) и Музей Сожалений (Гл. 2)",
      realmBadge: "ФИНАЛ ГЛАВЫ · ПОСЛЕ ПОБЕДЫ НАД БОССОМ",
      emotions: ["Hope", "Serenity", "Guilt"],
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/2d6bc5fd-cd30-46ae-be21-1e1c2d811bd3/thumbnail.jpg",
      secondaryImages: [
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/5c0ebfe9-b6e6-4b9c-bb3f-28141da5d041/thumbnail.jpg",
          caption: "Подъём к небесному Фрагменту Сна",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999385425-0-gpldLljRZludwWdXf4pVTsv4jDVGMJ",
          caption: "FloatingStairAssembly — мост-лестница из парящих камней",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792944632410-0-kT7mJ2cwdLVokV0bedNSlpNDcXsJKb",
          caption: "Вершина утёса у финальной лестницы",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/preview/1792870270491-Kd2S3YCj6NiH1OlcIThvtg6LF1rgxr.webp",
          caption: "Панорама при входе в Dream Level 3",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999364723-0-2rM3UXsRcNO8TMIFr6PgU2n13Ji3pD",
          caption: "Маяк Фрагмента Сна на вершине",
        },
      ],
      accentColor: "#f5c451",
      glowColor: "rgba(245, 196, 81, 0.35)",
      overview:
        "Открывается после победы над FearClaw: Проводник собирает камни над бездной в единую лестницу к небесам.",
      chapter1Title: "Прорыв — Небесная лестница",
      chapter1Door: "Дверь 3 — Party House (После FearClaw)",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1791999385425-0-gpldLljRZludwWdXf4pVTsv4jDVGMJ",
      chapter1Bullets: [
        "Проводник соединяет парящие в пустоте камни в мост-лестницу.",
        "Финальная встреча с тенью отца на вершине.",
      ],
      chapter2Title: "Музей Сожалений (Неевклидов дом)",
      chapter2Door: "Дверь 3 — Дом соседей (После Icerend)",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792944629833-1-qwQBcWGBOFwOW4eHLZnBEzWkMluEdI",
      chapter2Bullets: [
        "4 музейных зала памяти и неевклидов чердак.",
        "Сцена с манекенами в машине переворачивает комнату.",
      ],
      keyMechanics: [
        "FloatingStairAssembly",
        "Перестройка пространства",
        "Вспышки Кошмара",
        "Сцена с манекенами",
      ],
    },
  ],
  systemsMinor: "МЕХАНИКИ И ЗАКОНЫ МИРА ИЗ WIKI",
  systemsMajor: "СИСТЕМЫ МИРА СНОВ",
  systemsBody:
    "Щедрый платформинг, выравнивание восприятия и мгновенный возврат без штрафов.",
  systems: [
    {
      id: "perception-shift",
      wikiSlug: "perception-shift-system",
      category: "КЛЮЧЕВАЯ СПОСОБНОСТЬ",
      title: "Perception Shift",
      summary: "Окно 3–6 секунд, выравнивающее искажённый мир в верный путь.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792515697878-0-XQffXQ3a2ZVW1fFmaavWbVG3JAXy8M",
      accentColor: "#22d3ee",
    },
    {
      id: "floating-stones",
      wikiSlug: "mechanic-floating-stones",
      category: "МЕХАНИКА ДВИЖЕНИЯ",
      title: "Floating Stones & Flow",
      summary: "Парящие плиты, которые дарят ускорение и никогда не рушатся.",
      detail: "",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/2d6bc5fd-cd30-46ae-be21-1e1c2d811bd3/thumbnail.jpg",
      accentColor: "#34d399",
    },
    {
      id: "nightmare-encounters",
      wikiSlug: "nightmare-encounters",
      category: "ВСПЫШКИ РЕАЛЬНОСТЕЙ",
      title: "Nightmare Encounters",
      summary: "4-фазные прорывы Кошмара, сменяющиеся вспышкой чистого света.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/673a6d46-73c9-45da-9fc8-9b9f275ab830/1786950734825-1-tcV3oXw17PM8CrS4jsP15vFpLKLFbh",
      accentColor: "#c084fc",
    },
    {
      id: "failure-recovery",
      wikiSlug: "failure-recovery",
      category: "ТЕРАПЕВТИЧЕСКИЙ ДИЗАЙН",
      title: "Failure & Recovery",
      summary: "Мгновенный возврат на чекпоинт через мягкое затухание без загрузок.",
      detail: "",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/9dff2316-0d4d-41f2-ac23-345435170cd6/thumbnail.jpg",
      accentColor: "#f5c451",
    },
    {
      id: "symbolic-puzzles",
      wikiSlug: "mechanic-puzzles",
      category: "РЕЗОНАНС ПАМЯТИ",
      title: "Symbolic Puzzles",
      summary: "Медитативные святилища памяти и мосты из расколотого стекла.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/9b4ef678-3149-4b51-aa2e-f7f57ce4e02f/1788593797683-1-whUGWSi75dOTygzfo3RRza3fyg39DI",
      accentColor: "#60a5fa",
    },
    {
      id: "pulse-scan",
      wikiSlug: "ability-pulse",
      category: "ЧУВСТВО ИССЛЕДОВАНИЯ",
      title: "Pulse & Echo Keepsakes",
      summary: "Волна сканирования, подсвечивающая тайные тропы и артефакты.",
      detail: "",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1792083596781-0-dGOngbtHZRJ2wT6CvraIbXZP0v10jt",
      accentColor: "#38bdf8",
    },
  ],
  returnCtaTitle: "ШАГНУТЬ ОБРАТНО СКВОЗЬ ПОРТАЛ",
  returnCtaBody:
    "Исследуйте ретро-воспоминания, Мир Кошмаров и сады ELAR.",
  returnCtaBtn: "Вернуться к порталам мира",
};

export function getDreamLevelsPageCopy(locale: string): DreamLevelsPageCopy {
  if (locale === "ru") {
    return RU_DREAM_LEVELS_COPY;
  }
  return EN_DREAM_LEVELS_COPY;
}
