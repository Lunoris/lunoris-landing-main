export interface RetroArcBeat {
  step: string;
  name: string;
  desc: string;
  image: string;
}

export interface RetroArchitectureCard {
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

export interface RetroGameShowcaseItem {
  id: string;
  wikiSlug: string;
  number: string;
  title: string;
  roleSuffix: string;
  realmBadge: string;
  emotions: string[];
  image: string;
  videoSrc?: string;
  secondaryImages: { url: string; caption: string; isVideo?: boolean }[];
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

export interface RetroSystemCard {
  id: string;
  wikiSlug: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  accentColor: string;
}

export interface RetroGamesPageCopy {
  backToWorld: string;
  navWorld: string;
  navArchitecture: string;
  navGames: string;
  navSystems: string;
  transitionPackLabel: string;
  transitionModes: {
    pixel: string;
    shutter: string;
    iris: string;
    blinds: string;
  };
  heroMinor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroOverview: string;
  arcLabel: string;
  arcBeats: RetroArcBeat[];
  architectureMinor: string;
  architectureMajor: string;
  architectureBody: string;
  architectureCards: RetroArchitectureCard[];
  levelsMinor: string;
  levelsMajor: string;
  levelsBody: string;
  chapter1Badge: string;
  chapter2Badge: string;
  connectedSystemsLabel: string;
  inGameCapturesLabel: string;
  games: RetroGameShowcaseItem[];
  systemsMinor: string;
  systemsMajor: string;
  systemsBody: string;
  systems: RetroSystemCard[];
  returnCtaTitle: string;
  returnCtaBody: string;
  returnCtaBtn: string;
}

const EN_RETRO_GAMES_COPY: RetroGamesPageCopy = {
  backToWorld: "Return to World Portals",
  navWorld: "World Portals",
  navArchitecture: "Unlock Loop",
  navGames: "Retro Chapters",
  navSystems: "Arcade Tech",
  transitionPackLabel: "ARCADE TRANSITION PACK",
  transitionModes: {
    pixel: "01 · PIXEL",
    shutter: "02 · SHUTTER",
    iris: "03 · IRIS",
    blinds: "04 · BLINDS",
  },
  heroMinor: "ECHO MEMORIES · 7 PLAYABLE RETRO CHAPTERS",
  heroTitle: "RETRO LEVELS",
  heroSubtitle: "1988 Diriyah Memories & Basement Arcade Cabinets",
  heroOverview:
    "Cruise a 1967 Chevrolet Impala down an endless midnight highway between dreams, where family keepsakes and Retro Vision transform 3D memories into playable 2D retro arcade chapters.",
  arcLabel: "FOUR-STEP ECHO MEMORY UNLOCK LOOP",
  arcBeats: [
    {
      step: "01",
      name: "DREAM KEEPSAKE",
      desc: "Find hidden family artifacts like the Toy Car or Al-Ghashwa hood.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/6dbdcb18-f634-40cf-bbe6-e98568f34916/thumbnail.jpg",
    },
    {
      step: "02",
      name: "RETRO VISION (R3)",
      desc: "Scan the real keepsake in Dream Hub until its lock turns green.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/a1d063fa-b4e6-4656-8c6e-98b749cff629/thumbnail.jpg",
    },
    {
      step: "03",
      name: "PLAYABLE MEMORY",
      desc: "Relive 1988 Diriyah in locked 2D orthographic CRT arcade style.",
      image: "/assets/car-level-poster.jpg",
    },
    {
      step: "04",
      name: "ARCADE CABINET",
      desc: "Unlock one of John Ford's 7 basement arcade machines for replay.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/ec87706a-6e18-44fe-92ac-90556fd8f195/thumbnail.jpg",
    },
  ],
  architectureMinor: "TWO-KEY TOPOLOGY · KEEPSAKE TO CABINET",
  architectureMajor: "HOW RETRO MEMORIES UNLOCK",
  architectureBody:
    "Each of the 7 Echo Memories bridges a hidden Dream artifact, a Nightmare Puzzle Shrine, and a physical arcade cabinet in the basement.",
  architectureCards: [
    {
      id: "retro-vision-scanner",
      wikiSlug: "retro-vision",
      badge: "DREAM HUB SCANNER",
      title: "Retro Vision (R3)",
      subtitle: "Household Keepsake Inspection Sense",
      desc: "Activated exclusively inside Dream Hub after solving Nightmare Zone 1's Puzzle Shrine, highlighting real-world memory triggers.",
      highlights: [
        "R3 Hub Scanner",
        "Locked → Green Gate",
        "Zero Cooldown",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/cdae7eef-f77a-454b-8a08-f25951068d5c/1783408485742-adStRH4w3TPLL120t48F5ZBczYuBSP",
      accentColor: "#fbbf24",
    },
    {
      id: "chevrolet-impala-radio",
      wikiSlug: "impala",
      badge: "ICONIC VEHICLE & RADIO",
      title: "1967 Chevrolet Impala",
      subtitle: "Wahm Lane Midnight Highway & 1988 Diriyah",
      desc: "John Ford's classic 1967 Impala anchors both the prologue crash on Wahm Lane and the 2D side-scrolling Baby Race in 1988 Diriyah.",
      highlights: [
        "1967 Chevy Impala",
        "2D Orthographic Camera",
        "Apartment Radio Loop",
      ],
      image: "/assets/car-level-poster.jpg",
      accentColor: "#f59e0b",
    },
    {
      id: "basement-arcade-room",
      wikiSlug: "basement-arcade-room",
      badge: "REPLAY SANCTUARY",
      title: "Basement Arcade Room",
      subtitle: "7 Classic Father Cabinets & VHS Rec Room",
      desc: "Downstairs recreation room housing John Ford's 7 arcade cabinets (Out Run, Phoenix, Pac-Man, Galaga, Defender, Elevator Action, Street Fighter II).",
      highlights: [
        "7 Father Cabinets",
        "3 Restoration Stages",
        "Permanent CRT Replay",
      ],
      image: "/assets/dreamhub-scene.png",
      accentColor: "#e879f9",
    },
  ],
  levelsMinor: "PLAYABLE ECHO MEMORIES · CRT & DREAMCAST ERA",
  levelsMajor: "THE RETRO ARCADE CHAPTERS",
  levelsBody:
    "Self-contained 3-to-5 minute playable retro chapters with locked orthographic cameras, CRT scanlines, and emotional color grading.",
  chapter1Badge: "KEEP-KEY & UNLOCK",
  chapter2Badge: "ARCADE GAMEPLAY",
  connectedSystemsLabel: "Connected Wiki Systems & Props",
  inGameCapturesLabel: "Live Wiki & Build Captures",
  games: [
    {
      id: "car-level",
      wikiSlug: "car-level",
      number: "ARCADE 01",
      title: "THE BABY RACE — CAR LEVEL",
      roleSuffix: "1988 Diriyah · 1967 Chevrolet Impala",
      realmBadge: "RETRO MEMORY 1 · PLAYABLE IN DEMO",
      emotions: ["Hope", "Fear", "Wonder"],
      image: "/assets/car-level-poster.jpg",
      videoSrc: "/assets/car-level-loop.mp4",
      secondaryImages: [
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/b4a031cf-30ce-4003-810e-40db78c9d6eb/thumbnail.jpg",
          caption: "Car Level — 1988 Diriyah Start Cutscene",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/6dbdcb18-f634-40cf-bbe6-e98568f34916/thumbnail.jpg",
          caption: "Toy Chevrolet Keepsake in Dream Level 2",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/67d34c84-ded2-4d00-98af-d5b6dcace961/thumbnail.jpg",
          caption: "1967 Impala on Wahm Lane (Chapter 0 Prologue)",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/ec87706a-6e18-44fe-92ac-90556fd8f195/thumbnail.jpg",
          caption: "Echo Memory Unlock Flow in Dream Hub",
        },
      ],
      accentColor: "#fbbf24",
      glowColor: "rgba(251, 191, 36, 0.88)",
      overview:
        "Drive John Ford's 1967 Chevrolet Impala down a linear 1988 Diriyah highway while Lulwah Al Rashed races to her mother's doorway to give birth to Lunora.",
      chapter1Title: "Toy Chevrolet & Garage Key",
      chapter1Door: "Key 1 — Dream Level 2 Secret Trail",
      chapter1Image:
        "https://vz-9dfa69e0-38d.b-cdn.net/6dbdcb18-f634-40cf-bbe6-e98568f34916/thumbnail.jpg",
      chapter1Bullets: [
        "Follow the hidden Lucid Orb trail with Freddy in Dream Level 2 to recover the Toy Car.",
        "Scan the real 1967 Impala in Dream Hub with Retro Vision (R3) to start the race.",
      ],
      chapter2Title: "Side-Scrolling 1988 Diriyah Racer",
      chapter2Door: "2D Orthographic Camera · 3–5 Min",
      chapter2Image:
        "https://vz-9dfa69e0-38d.b-cdn.net/b4a031cf-30ce-4003-810e-40db78c9d6eb/thumbnail.jpg",
      chapter2Bullets: [
        "Locked 2D side-scrolling Dreamcast-era camera with win/loss timer and obstacle weaving.",
        "Ends at the Maternal Grandmother's doorway with Dialogues Log Entry 9 ('Mothers and Daughters').",
      ],
      keyMechanics: [
        "1967 Chevrolet Impala",
        "2D Side-Scrolling Camera",
        "Toy Car Keepsake",
        "Out Run Arcade Cabinet",
      ],
    },
    {
      id: "falcon-hunting",
      wikiSlug: "falcon-hunting",
      number: "ARCADE 02",
      title: "FALCON HUNTING — DIRIYAH DESERT",
      roleSuffix: "Last Memory with Lulwah Al Rashed (Age 6)",
      realmBadge: "RETRO MEMORY 2 · PUBLIC DEMO SCOPE",
      emotions: ["Wonder", "Hope", "Sadness"],
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/511f3413-00a1-4c27-8913-ece60ddd71e3/thumbnail.jpg",
      secondaryImages: [
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/a1d063fa-b4e6-4656-8c6e-98b749cff629/thumbnail.jpg",
          caption: "Retro Vision (R3) Keepsake Scan in Dream Hub",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
          caption: "Diriyah Desert Bleed-Through in Dream Level 1",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/96c0a386-9971-485b-a452-b3b43da19805/1786716524919-1-5J9JtWJItZDhMDOg6eaudr51ve4GKi",
          caption: "Diriyah Desert Ruins & Falcon Perch Alcove",
        },
        {
          url: "/assets/dream-level-1.png",
          caption: "Dream Level 1 — Section 7 Desert Vista",
        },
      ],
      accentColor: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.88)",
      overview:
        "Take direct flight control of Lulwah's Eagle Falcon across the warm 1988 Saudi desert before returning to her gloved arm as six-year-old Lunora watches.",
      chapter1Title: "Al-Ghashwa (Eagle's Hood)",
      chapter1Door: "Key 1 — Dream Level 1 (Section 7 Alcove)",
      chapter1Image:
        "https://vz-9dfa69e0-38d.b-cdn.net/511f3413-00a1-4c27-8913-ece60ddd71e3/thumbnail.jpg",
      chapter1Bullets: [
        "Gently remove the leather falconer's hood from the perched bird in Section 7 of Dream Level 1.",
        "Complete Nightmare Zone 1's right Puzzle Shrine to unlock Retro Vision and scan the hood in Dream Hub.",
      ],
      chapter2Title: "Top-Down Desert Flight Loop",
      chapter2Door: "Top-Down Fixed Orthographic Camera",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793306440639-4-fesdL61WzHQcwgXCvk8DmvIl1b37xY",
      chapter2Bullets: [
        "Hard-locked top-down orthographic camera with retro PS1/Dreamcast desert visuals.",
        "Embodies the level's core thesis: the falcon that leaves and returns in Lunora's final memory with her mother.",
      ],
      keyMechanics: [
        "Playable Eagle Falcon",
        "Al-Ghashwa Falcon Hood",
        "Top-Down Fixed Camera",
        "Phoenix Arcade Cabinet",
      ],
    },
    {
      id: "seven-arcade-cabinets",
      wikiSlug: "basement-arcade-room",
      number: "ARCADE 03–07",
      title: "SEVEN BASEMENT ARCADE CABINETS",
      roleSuffix: "John Ford's Downstairs Recreation Room",
      realmBadge: "FULL CAMPAIGN · 7 ECHO MEMORIES",
      emotions: ["Wonder", "Hope", "Serenity"],
      image: "/assets/dreamhub-scene.png",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1783941955271-3-TC5M4Oa1Mxmdb1qdBO84x1PgdEFmaw",
          caption: "Dream Hub Interior & Recreation Rooms",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/ec87706a-6e18-44fe-92ac-90556fd8f195/thumbnail.jpg",
          caption: "Basement Arcade Cabinet Unlock Sequence",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/6780ad06-de24-41c8-9bc9-8415232f6da8/thumbnail.jpg",
          caption: "Dream Hub Upstairs Radio Broadcast Prop",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1783465785808-3-4oRQ9hdpSEs8bLJ9BC4Q5r1hvd9aeA",
          caption: "Dream Hub Restoration Stage Progression",
        },
      ],
      accentColor: "#e879f9",
      glowColor: "rgba(232, 121, 249, 0.86)",
      overview:
        "Every completed Echo Memory uncovers one of John Ford's 7 classic arcade machines in the Dream Hub basement, restoring the room across three Lucid Orb stages.",
      chapter1Title: "Seven Fathers' Classic Cabinets",
      chapter1Door: "1:1 Echo Memory Mapping",
      chapter1Image:
        "https://vz-9dfa69e0-38d.b-cdn.net/ec87706a-6e18-44fe-92ac-90556fd8f195/thumbnail.jpg",
      chapter1Bullets: [
        "Houses Elevator Action, Phoenix, Defender, Pac-Man, Out Run, Galaga, and Street Fighter II.",
        "Each unlocked cabinet remains permanently playable with authentic CRT scanlines.",
      ],
      chapter2Title: "Three-Stage Basement Restoration",
      chapter2Door: "Early → Mid → Late Lucid Orb Upgrades",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1783941955271-3-TC5M4Oa1Mxmdb1qdBO84x1PgdEFmaw",
      chapter2Bullets: [
        "Spending Lucid Orbs clears dustsheets, lights up neon marquees, and restores VHS shelves.",
        "Transforms fractured subconscious trauma into warm, replayable family memories.",
      ],
      keyMechanics: [
        "7 Classic Arcade Machines",
        "Lucid Orb Restoration",
        "CRT Curvature & Scanlines",
        "VHS & Couch Sanctuary",
      ],
    },
  ],
  systemsMinor: "HARDWARE & DIEGETIC SYSTEMS · 1988–2026",
  systemsMajor: "SYSTEMS GOVERNING RETRO LEVELS",
  systemsBody:
    "Four interconnected systems power the discovery, presentation, and replay of Lunoris's retro chapters.",
  systems: [
    {
      id: "sys-retro-vision",
      wikiSlug: "retro-vision",
      category: "HUB ABILITY",
      title: "Retro Vision (R3)",
      summary:
        "Exclusive Dream Hub inspection wave that highlights household keepsakes and switches locked Echo Memories to green.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/a1d063fa-b4e6-4656-8c6e-98b749cff629/thumbnail.jpg",
      accentColor: "#fbbf24",
    },
    {
      id: "sys-two-key-keepsakes",
      wikiSlug: "al-ghashwa-hood",
      category: "ARTIFACTS",
      title: "Two-Key Keepsakes",
      summary:
        "Off-path Dream collectibles (Al-Ghashwa Hood, Toy Car) pair with Nightmare Puzzle Shrines to unlock retro levels.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/511f3413-00a1-4c27-8913-ece60ddd71e3/thumbnail.jpg",
      accentColor: "#f59e0b",
    },
    {
      id: "sys-crt-shader",
      wikiSlug: "mechanic-echo-memories",
      category: "VISUAL TECH",
      title: "Dreamcast & CRT Presentation",
      summary:
        "Low-poly 3D geometry, pixel-art UI overlays, horizontal CRT scanlines, and locked 2D/top-down orthographic cameras.",
      image: "/assets/car-level-poster.jpg",
      accentColor: "#38bdf8",
    },
    {
      id: "sys-apartment-radio",
      wikiSlug: "radio",
      category: "AUDIO PROP",
      title: "Apartment Radio & FMOD Tape",
      summary:
        "Diegetic radio broadcasts and vintage synth transitions bridge the Wahm Lane crash and 1988 Diriyah memories.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/6780ad06-de24-41c8-9bc9-8415232f6da8/thumbnail.jpg",
      accentColor: "#e879f9",
    },
  ],
  returnCtaTitle: "Step Back to the Portal Threshold",
  returnCtaBody:
    "Return to the World Portals to enter Dream Levels or confront the Nightmare realm.",
  returnCtaBtn: "Return to World Portals",
};

const RU_RETRO_GAMES_COPY: RetroGamesPageCopy = {
  ...EN_RETRO_GAMES_COPY,
  backToWorld: "Вернуться к порталам миров",
  navWorld: "Порталы миров",
  navArchitecture: "Цикл открытия",
  navGames: "Ретро-главы",
  navSystems: "Аркадные системы",
  transitionPackLabel: "ПАКЕТ РЕТРО-ПЕРЕХОДОВ",
  transitionModes: {
    pixel: "01 · PIXEL",
    shutter: "02 · SHUTTER",
    iris: "03 · IRIS",
    blinds: "04 · BLINDS",
  },
  heroMinor: "ЭХО-ВОСПОМИНАНИЯ · 7 ИГРАБЕЛЬНЫХ РЕТРО-ГЛАВ",
  heroTitle: "RETRO LEVELS",
  heroSubtitle: "Воспоминания Эд-Диръии 1988 и аркадные автоматы в подвале",
  heroOverview:
    "Мчитесь на Chevrolet Impala 1967 года по полуночному шоссе между снами, где семейные реликвии и Retro Vision превращают 3D-память в играбельные 2D ретро-аркады.",
  arcLabel: "ЧЕТЫРЁХЭТАПНЫЙ ЦИКЛ ОТКРЫТИЯ ЭХО-ПАМЯТИ",
  arcBeats: [
    {
      ...EN_RETRO_GAMES_COPY.arcBeats[0],
      name: "РЕЛИКВИЯ СНА",
      desc: "Найдите спрятанные семейные предметы: игрушечную Impala или соколиный клобучок Аль-Гашва.",
    },
    {
      ...EN_RETRO_GAMES_COPY.arcBeats[1],
      name: "RETRO VISION (R3)",
      desc: "Просканируйте реальный предмет в Dream Hub, пока замок не станет зелёным.",
    },
    {
      ...EN_RETRO_GAMES_COPY.arcBeats[2],
      name: "ИГРАБЕЛЬНАЯ ПАМЯТЬ",
      desc: "Проживите 1988 год в Эд-Диръии с фиксированной 2D-камерой и ЭЛТ-экраном.",
    },
    {
      ...EN_RETRO_GAMES_COPY.arcBeats[3],
      name: "АРКАДНЫЙ АВТОМАТ",
      desc: "Откройте один из 7 классических автоматов Джона Форда в подвале для повтора.",
    },
  ],
  architectureMinor: "СИСТЕМА ДВУХ КЛЮЧЕЙ · ОТ РЕЛИКВИИ К АВТОМАТУ",
  architectureMajor: "КАК ОТКРЫВАЮТСЯ РЕТРО-УРОВНИ",
  architectureBody:
    "Каждое из 7 Эхо-воспоминаний связывает секретный предмет из Уровня Снов, алтарь Кошмара и аркадный автомат в подвале.",
  levelsMinor: "ИГРАБЕЛЬНЫЕ ЭХО-ВОСПОМИНАНИЯ · ЭПОХА CRT И DREAMCAST",
  levelsMajor: "РЕТРО-АРКАДНЫЕ ГЛАВЫ",
  levelsBody:
    "Самодостаточные 3–5-минутные ретро-уровни с ортографической камерой, ЭЛТ-развёрткой и эмоциональной цветокоррекцией.",
  chapter1Badge: "КЛЮЧ И ОТКРЫТИЕ",
  chapter2Badge: "АРКАДНЫЙ ГЕЙМПЛЕЙ",
  connectedSystemsLabel: "Связанные системы и реликвии",
  inGameCapturesLabel: "Кадры из билда и вики",
  systemsMinor: "ТЕХНОЛОГИИ И ЗВУК · 1988–2026",
  systemsMajor: "СИСТЕМЫ МИРА RETRO LEVELS",
  systemsBody:
    "Четыре взаимосвязанные системы отвечают за поиск, ЭЛТ-визуализацию и повторное прохождение ретро-глав.",
  returnCtaTitle: "Вернуться к порогу порталов",
  returnCtaBody:
    "Вернитесь к порталам миров, чтобы войти в Dream Levels или бросить вызов Кошмару.",
  returnCtaBtn: "К порталам миров",
};

export function getRetroGamesPageCopy(locale: string): RetroGamesPageCopy {
  if (locale === "ru") return RU_RETRO_GAMES_COPY;
  return EN_RETRO_GAMES_COPY;
}
