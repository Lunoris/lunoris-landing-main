export interface NightmareArcBeat {
  step: string;
  name: string;
  desc: string;
  image: string;
}

export interface NightmareArchitectureCard {
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

export interface NightmareZoneShowcaseItem {
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

export interface NightmareSystemCard {
  id: string;
  wikiSlug: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  accentColor: string;
}

export interface NightmarePageCopy {
  backToWorld: string;
  navWorld: string;
  navArchitecture: string;
  navZones: string;
  navSystems: string;
  heroMinor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroOverview: string;
  arcLabel: string;
  arcBeats: NightmareArcBeat[];
  architectureMinor: string;
  architectureMajor: string;
  architectureBody: string;
  architectureCards: NightmareArchitectureCard[];
  levelsMinor: string;
  levelsMajor: string;
  levelsBody: string;
  chapter1Badge: string;
  chapter2Badge: string;
  connectedSystemsLabel: string;
  inGameCapturesLabel: string;
  zones: NightmareZoneShowcaseItem[];
  systemsMinor: string;
  systemsMajor: string;
  systemsBody: string;
  systems: NightmareSystemCard[];
  returnCtaTitle: string;
  returnCtaBody: string;
  returnCtaBtn: string;
}

const EN_NIGHTMARE_COPY: NightmarePageCopy = {
  backToWorld: "Return to World Portals",
  navWorld: "World Portals",
  navArchitecture: "Realm Structure",
  navZones: "Nightmare Zones",
  navSystems: "Combat & Clarity",
  heroMinor: "SHADOW COUNTERPART · 7 INTERCONNECTED ZONES",
  heroTitle: "NIGHTMARE",
  heroSubtitle: "Breaker Greatsword Parries, Shrine Keepers & Matchi Matchi",
  heroOverview:
    "Plunge through the fogged mirror or the Breaker's magenta rift into a seven-zone frozen wasteland where fears take physical form—parrying FearClaw's strikes to purify shadows into light.",
  arcLabel: "FOUR-PHASE NIGHTMARE CYCLE",
  arcBeats: [
    {
      step: "01",
      name: "BREAKER RIFT",
      desc: "Cross the magenta rift from Dream Level 2 or step through the Dream Hub's fogged mirror.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/673a6d46-73c9-45da-9fc8-9b9f275ab830/1786950734825-1-tcV3oXw17PM8CrS4jsP15vFpLKLFbh",
    },
    {
      step: "02",
      name: "PARRY & DISPEL",
      desc: "Deflect attacks with the Breaker greatsword (L1/LB) to fill enemy stun meters and dispel shadows.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/a3ee0eac-5098-43d8-9630-12abbfeb0eb2/thumbnail.jpg",
    },
    {
      step: "03",
      name: "SHRINE KEEPERS",
      desc: "Purify FearClaw (Shrine 2) and Icerend (Shrine 3) to unlock Stillness and Chapter 3 Finale doors.",
      image: "/assets/fearclaw-boss.png",
    },
    {
      step: "04",
      name: "SANCTUARY & BLOOM",
      desc: "Rest at purple campfires, visit Matchi Matchi's stand, or return safely via White Light Bloom.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/fc7d8082-f8bf-486e-b5e5-72bef445f0e9/1783713044532-3-3eLCWO0baiaMnxc2x0xAokg3n4QOqU",
    },
  ],
  architectureMinor: "NON-LINEAR WASTELAND · 5 GROUND + 2 UNDERGROUND ZONES",
  architectureMajor: "HOW THE NIGHTMARE REALM CONNECTS",
  architectureBody:
    "Authored non-linear exploration across seven interconnected zones with zero objective markers, guided by light, purple campfires, and shrine beacons.",
  architectureCards: [
    {
      id: "breaker-mirror-entry",
      wikiSlug: "breaker-intro-sequence",
      badge: "REALM THRESHOLDS",
      title: "Breaker Rift & Fogged Mirror",
      subtitle: "First Plunge from Dream Level 2 & Bathroom Mirror",
      desc: "Lunora's first entry happens mid-flight in Dream Level 2 as the Breaker pulls itself from a magenta rift; subsequent runs enter freely via the Dream Hub bathroom mirror.",
      highlights: [
        "Breaker Intro Sequence",
        "Dream Hub Bathroom Mirror",
        "Seamless Rift Slash",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/1793203304408-0-pKuTvmqEkTMwd2WfAXunbfmXYvjaDW",
      accentColor: "#d946ef",
    },
    {
      id: "seven-wasteland-zones",
      wikiSlug: "minimap-nightmare",
      badge: "SPATIAL TOPOLOGY",
      title: "7 Interconnected Zones",
      subtitle: "5 Ground + 2 Underground Frozen Wasteland",
      desc: "A readable maze separated by natural terrain bottlenecks rather than loading screens, housing 7 Safe Spots, 3 Dream Pockets, and 20 Echo Shards.",
      highlights: [
        "Zone 1 Safe Orientation",
        "7 Purple Campfires",
        "20 Echo Shards",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/retro-1778766369717519-0-8NEBrlvgy0oq4dVAyARdKsEOgFVvwh",
      accentColor: "#a855f7",
    },
    {
      id: "matchi-mountain-sanctuary",
      wikiSlug: "matchimountain",
      badge: "DREAM POCKET SANCTUARY",
      title: "Matchi Mountain & Stand",
      subtitle: "Breaking the Infinite Left Tunnel Loop",
      desc: "Entering Zone 1's endless left tunnel with maximum Hope and Father's Framed Painting breaks the non-Euclidean loop and opens the mountain path to Matchi Matchi.",
      highlights: [
        "Max Hope + Framed Painting",
        "Matchi Matchi Vendor",
        "Emotional Fragment Shop",
      ],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/fc7d8082-f8bf-486e-b5e5-72bef445f0e9/1783713044532-3-3eLCWO0baiaMnxc2x0xAokg3n4QOqU",
      accentColor: "#34d399",
    },
    {
      id: "shrine-keepers-gates",
      wikiSlug: "bosslevel-fearclaw",
      badge: "BOSS ARENAS & SHRINES",
      title: "5 Shrines & Boss Keepers",
      subtitle: "Purifying FearClaw & Icerend to Unlock Finale Doors",
      desc: "Clearing Nightmare Shrines purifies corrupted Dream creatures back into their peaceful forms and turns Door 3 green on Dream Islands 1 and 2.",
      highlights: [
        "Shrine 2: FearClaw → FrayClaw",
        "Shrine 3: Icerend → Frostkin",
        "Unlocks Dream Level 3",
      ],
      image: "/assets/fearclaw-boss.png",
      accentColor: "#f43f5e",
    },
  ],
  levelsMinor: "EXPLORATION & BOSS CONFRONTATIONS · REALM 1",
  levelsMajor: "THE NIGHTMARE ZONES & ARENAS",
  levelsBody:
    "Each Nightmare zone pairs atmospheric corridor exploration and Puzzle Shrines with high-stakes Keeper confrontations that directly unlock the next Dream chapter.",
  chapter1Badge: "EXPLORATION & SHRINE PUZZLE",
  chapter2Badge: "KEEPER ENCOUNTER & PAYOFF",
  connectedSystemsLabel: "Core Mechanics & Rewards",
  inGameCapturesLabel: "In-Game Captures (Click to Preview)",
  zones: [
    {
      id: "nightmare-zone-1",
      wikiSlug: "nightmare-zone1-tunnels",
      number: "ZONE 01",
      title: "SAVEZONE & THE TWO TUNNELS",
      roleSuffix: "Endless Left Loop (Matchi Mountain) & Right CRT Shrine",
      realmBadge: "NIGHTMARE ZONE 1 · PUBLIC DEMO",
      emotions: ["Fear", "Hope", "Wonder"],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/retro-1782472364786649-1-qnbm6T33RLAEqBNDAsHv4L2i2BD6Mw",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/retro-1782472364786649-0-cOHOUemRCD9zkxpIO3LpKxyUu5xLsh",
          caption: "Nightmare Zone 1 — Non-Euclidean Endless Tunnel",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/retro-1778766369717519-0-8NEBrlvgy0oq4dVAyARdKsEOgFVvwh",
          caption: "Stalker Ambush Tiles Inside the Left Tunnel Loop",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/fc7d8082-f8bf-486e-b5e5-72bef445f0e9/1783713044532-3-3eLCWO0baiaMnxc2x0xAokg3n4QOqU",
          caption: "Matchi Mountain — Matcha Vendor Sanctuary",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/9b4ef678-3149-4b51-aa2e-f7f57ce4e02f/1785182808736-1-0iZ66hEDuERoTTCk6tXZxwAeQBNorx",
          caption: "Right Tunnel Puzzle Shrine (Toy Car & Falcon)",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/57dd1ba2-4c72-4ed3-8c47-c15bc6b5b458/thumbnail.jpg",
          caption: "SaveZone Orientation & Tunnel Threshold",
        },
      ],
      accentColor: "#c084fc",
      glowColor: "rgba(192, 132, 252, 0.42)",
      overview:
        "Leaving Zone 1's safe campfire reveals two opposing tunnels: a Stalker-patrolled left loop that hides the Matchi Matchi sanctuary, and an enemy-free right CRT tunnel leading to the Falcon & Toy Car Puzzle Shrine.",
      chapter1Title: "Left Infinite Tunnel & Matchi Mountain",
      chapter1Door: "Dual Condition: Max Hope + Framed Painting",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/fc7d8082-f8bf-486e-b5e5-72bef445f0e9/1783713044532-3-3eLCWO0baiaMnxc2x0xAokg3n4QOqU",
      chapter1Bullets: [
        "Loops infinitely with Stalker ambushes until entered with Max Hope and Father's Framed Painting.",
        "Violin music guides Lunora to hang the painting, outlining the door to Matchi Matchi's sanctuary.",
      ],
      chapter2Title: "Right CRT Tunnel & Puzzle Shrine",
      chapter2Door: "Key 2 — Unlocks Pulse & Retro Vision",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/9b4ef678-3149-4b51-aa2e-f7f57ce4e02f/1785182808736-1-0iZ66hEDuERoTTCk6tXZxwAeQBNorx",
      chapter2Bullets: [
        "Walks through pixelated geometry and green CRT scan noise with zero enemies.",
        "Reassembles the shattered Toy Car and Falcon into a soaring sculpture, granting Pulse and Retro Vision.",
      ],
      keyMechanics: [
        "Non-Euclidean Tunnel Loop",
        "Matchi Matchi Sanctuary",
        "Stalker 1-Hit Dispel",
        "Falcon & Toy Car Shrine",
      ],
    },
    {
      id: "fearclaw-boss-arena",
      wikiSlug: "bosslevel-fearclaw",
      number: "ZONE 02",
      title: "FEARCLAW BOSS ARENA",
      roleSuffix: "Party School Path & Shrine 2 Keeper (FearClaw)",
      realmBadge: "CHAPTER 1 BOSS · PUBLIC DEMO CLIMAX",
      emotions: ["Fear", "Anger", "Stillness"],
      image: "/assets/fearclaw-boss.png",
      secondaryImages: [
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1787071354657-4-tUFRmegtXplLZjziPlrqwzNDsgkR8B",
          caption: "BossLevel-FearClaw — Crimson Fog & Nightmare Skybox",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1787071354547-2-a2wP7KFuLWvUtykpBLY0hLoTvxl323",
          caption: "Constricting Arena Pillars & Predatory Sightlines",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1787056698414-3-yPQwL23yosyN647L9ZYVEqgLwXZh1z",
          caption: "Shrine 2 Approach Along Party School Path",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1787056698286-1-wB2wIMYt1kvPS9pFCUce4ovC5Btcf6",
          caption: "Arena Perimeter During Phase 3 Dominance",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/61cd2b4f-d36e-43a2-be31-2628877b253a/thumbnail.jpg",
          caption: "Party School Path — Portal Threshold VFX",
        },
      ],
      accentColor: "#e879f9",
      glowColor: "rgba(232, 121, 249, 0.45)",
      overview:
        "At the end of Party School Path (Zone 2), Lunora enters a constricting crimson-fogged arena to face FearClaw—predatory vigilance made physical across a three-phase hunt.",
      chapter1Title: "Party School Path & Red Shield Shrine",
      chapter1Door: "Zone 2 Approach · Puzzle Shrine",
      chapter1Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1787056698414-3-yPQwL23yosyN647L9ZYVEqgLwXZh1z",
      chapter1Bullets: [
        "Completing the Party School Path Puzzle Shrine unlocks the aggressive Red Shield mode for the Breaker.",
        "Leads directly to NightmareShrine-FearClaw and the Shrine 2 boss threshold.",
      ],
      chapter2Title: "Three-Phase FearClaw Confrontation",
      chapter2Door: "Unlocks Stillness Pistol & Ch. 1 Door 3",
      chapter2Image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/028c49ab-5d61-4462-9fa8-298a1bccd19b/1787071354657-4-tUFRmegtXplLZjziPlrqwzNDsgkR8B",
      chapter2Bullets: [
        "Parry multi-hit claw combos with the Breaker (L1/LB) to fill FearClaw's stun meter into Execution State.",
        "Purifies FearClaw into FrayClaw, awards the Stillness Pistol, and turns Door 3 green on Dream Island 1.",
      ],
      keyMechanics: [
        "3-Phase Predator AI",
        "Breaker Parry (L1/LB)",
        "Stillness Pistol Reward",
        "Unlocks Dream Level 3",
      ],
    },
    {
      id: "icerend-shrine-zone-3",
      wikiSlug: "shrine-3-icerend",
      number: "ZONE 03",
      title: "ICEREND SHRINE & FROZEN WASTELAND",
      roleSuffix: "Shrine 3 Keeper · Frostkin's Corrupted Form",
      realmBadge: "CHAPTER 2 BOSS GATE · ZONE 3",
      emotions: ["Sadness", "Fear", "Serenity"],
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/673a6d46-73c9-45da-9fc8-9b9f275ab830/1786950734825-1-tcV3oXw17PM8CrS4jsP15vFpLKLFbh",
      secondaryImages: [
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/a3ee0eac-5098-43d8-9630-12abbfeb0eb2/thumbnail.jpg",
          caption: "Breaker Shield Orbiting Fragments in Combat",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/723723fd-bc52-43c1-a857-e694e0f3d048/thumbnail.jpg",
          caption: "Two-Handed Breaker Greatsword Heavy Combo",
        },
        {
          url: "https://vz-9dfa69e0-38d.b-cdn.net/c12b9b3b-c4d9-4c4a-a309-c83a9a9973b1/thumbnail.jpg",
          caption: "Dream Pocket Sanctuary Transition",
        },
        {
          url: "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/fc7d8082-f8bf-486e-b5e5-72bef445f0e9/1783713044221-1-U9AVDA8eCFIRs21ZdqES3vehIG1BLE",
          caption: "Dream Pocket Vendor Stand Between Zones",
        },
      ],
      accentColor: "#818cf8",
      glowColor: "rgba(129, 140, 248, 0.42)",
      overview:
        "Deep in the frozen dead-end of Zone 3, emotional withdrawal hardens into Icerend—testing movement under pressure with frozen ground and ice ridges before thawing back into Frostkin.",
      chapter1Title: "Movement Denial & Frozen Ridges",
      chapter1Door: "Shrine 3 Arena — Zone 3 Dead-End",
      chapter1Image:
        "https://vz-9dfa69e0-38d.b-cdn.net/a3ee0eac-5098-43d8-9630-12abbfeb0eb2/thumbnail.jpg",
      chapter1Bullets: [
        "Icerend freezes terrain and raises ice ridges to punish passive positioning and tunnel vision.",
        "Combines Breaker deflections with ranged Stillness windows to crack the frost armor.",
      ],
      chapter2Title: "Thawing Dispel & Chapter 2 Finale Gate",
      chapter2Door: "Awards Echo Shard & Unlocks Museum of Regrets",
      chapter2Image:
        "https://vz-9dfa69e0-38d.b-cdn.net/723723fd-bc52-43c1-a857-e694e0f3d048/thumbnail.jpg",
      chapter2Bullets: [
        "On dispel, the corruption thaws in stages to reveal peaceful Frostkin, who speaks a single line and melts.",
        "Awards 1 Echo Shard and unlocks Door 3 (Museum of Regrets / Dream Level 3) on Dream Island 2.",
      ],
      keyMechanics: [
        "Terrain Freeze & Ice Ridges",
        "Dual-Realm Keeper (Frostkin)",
        "Echo Shard Progression",
        "Unlocks Ch. 2 Door 3",
      ],
    },
  ],
  systemsMinor: "PSYCHOLOGICAL COMBAT · ZERO DEATH SCREENS",
  systemsMajor: "SYSTEMS GOVERNING THE NIGHTMARE",
  systemsBody:
    "In Lunoris, enemies are emotional states rather than monsters—dispelled through timed parries, orbiting shatter shields, and non-punitive Clarity resets.",
  systems: [
    {
      id: "sys-breaker-greatsword",
      wikiSlug: "weapon-breaker",
      category: "MELEE GREATSWORD",
      title: "The Breaker & Timed Parry",
      summary:
        "Two-handed greatsword pulled from the rift with zero ammo cost; Sekiro/Lies of P timed parries (L1/LB) fill enemy stun meters into Execution State.",
      image: "/assets/breaker-sword.png",
      accentColor: "#d946ef",
    },
    {
      id: "sys-breaker-shield",
      wikiSlug: "weapon-breaker-shield",
      category: "SHATTER & REFORM",
      title: "Blue & Red Shield Orbit",
      summary:
        "When instability shatters the blade, its fragments orbit as a 6-hit Blue Defensive Shield or 4-hit Red Aggressive Shield before reforming into a Resolve Surge.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/a3ee0eac-5098-43d8-9630-12abbfeb0eb2/thumbnail.jpg",
      accentColor: "#818cf8",
    },
    {
      id: "sys-nightmare-entities",
      wikiSlug: "nightmare-entities",
      category: "SHADOW ROSTER",
      title: "6 Emotional Manifestations",
      summary:
        "Wailers, Stalkers, Fractured, Screamers, Mimics, and Anchors manifest internal habits as silhouettes that are purified into light rather than killed.",
      image:
        "https://1h5v8g4wcwemicwp.public.blob.vercel-storage.com/tracker/474a11d3-a332-428e-99a7-f12f0c0677f6/retro-1778766369717519-0-8NEBrlvgy0oq4dVAyARdKsEOgFVvwh",
      accentColor: "#c084fc",
    },
    {
      id: "sys-white-light-bloom",
      wikiSlug: "nightmare-failure",
      category: "THERAPEUTIC FAILURE",
      title: "White Light Bloom & Carry-Over",
      summary:
        "Reaching zero Clarity triggers a gentle White Light Bloom back to the Dream Hub—preserving all Echo Shards, jewelry, and unlocked doors with no Game Over screen.",
      image:
        "https://vz-9dfa69e0-38d.b-cdn.net/c12b9b3b-c4d9-4c4a-a309-c83a9a9973b1/thumbnail.jpg",
      accentColor: "#f43f5e",
    },
  ],
  returnCtaTitle: "SLASH BACK THROUGH THE RIFT",
  returnCtaBody:
    "Return to the World Portals to soar across Dream Levels or replay 1988 Diriyah memories in Retro Levels.",
  returnCtaBtn: "Return to World Portals",
};

const RU_NIGHTMARE_COPY: NightmarePageCopy = {
  ...EN_NIGHTMARE_COPY,
  backToWorld: "Вернуться к порталам миров",
  navWorld: "Порталы миров",
  navArchitecture: "Топология Кошмара",
  navZones: "Зоны и Боссы",
  navSystems: "Боевая система",
  heroMinor: "ТЕНЕВОЕ ОТРАЖЕНИЕ · 7 СВЯЗАННЫХ ЗОН",
  heroTitle: "NIGHTMARE",
  heroSubtitle: "Парирования мечом Breaker, Хранители Святилищ и Matchi Matchi",
  heroOverview:
    "Шагните сквозь запотевшее зеркало или пурпурный разлом меча Breaker в застывшую пустошь из семи зон, где страхи обретают форму — отражайте удары FearClaw и очищайте тени светом.",
  arcLabel: "ЧЕТЫРЁХФАЗНЫЙ ЦИКЛ МИРА КОШМАРОВ",
  arcBeats: [
    {
      ...EN_NIGHTMARE_COPY.arcBeats[0],
      name: "РАЗЛОМ BREAKER",
      desc: "Провалитесь сквозь пурпурный разлом из Dream Level 2 или войдите через зеркало в Dream Hub.",
    },
    {
      ...EN_NIGHTMARE_COPY.arcBeats[1],
      name: "ПАРИРОВАНИЕ",
      desc: "Отражайте удары двуручным мечом Breaker (L1/LB), заполняя шкалу оглушения и рассеивая тени.",
    },
    {
      ...EN_NIGHTMARE_COPY.arcBeats[2],
      name: "БОССЫ СВЯТИЛИЩ",
      desc: "Очистите FearClaw (Святилище 2) и Icerend (Святилище 3), чтобы открыть Дверь 3.",
    },
    {
      ...EN_NIGHTMARE_COPY.arcBeats[3],
      name: "КОСТРЫ И MATCHI",
      desc: "Отдохните у фиолетовых костров, загляните к Matchi Matchi или вернитесь через Белую Вспышку.",
    },
  ],
  architectureMinor: "НЕЛИНЕЙНЫЙ ЛАБИРИНТ · 5 НАЗЕМНЫХ И 2 ПОДЗЕМНЫЕ ЗОНЫ",
  architectureMajor: "КАК УСТРОЕН МИР КОШМАРОВ",
  architectureBody:
    "Семь взаимосвязанных зон замёрзшей пустоши без маркеров квестов, где путь подсказывают архитектура, фиолетовые костры Safe Spots и огни святилищ.",
  levelsMinor: "ИССЛЕДОВАНИЕ И СХВАТКИ С ХРАНИТЕЛЯМИ · МИР 1",
  levelsMajor: "ЗОНЫ И АРЕНЫ NIGHTMARE",
  levelsBody:
    "Каждая зона сочетает исследование неевклидовых туннелей и святилищ-головоломок с битвами против Хранителей, открывающими финальные двери глав в Мире Снов.",
  chapter1Badge: "ТУННЕЛИ И СВЯТИЛИЩА",
  chapter2Badge: "БИТВА И НАГРАДА",
  connectedSystemsLabel: "Ключевые механики и награды",
  inGameCapturesLabel: "Кадры из билда (нажмите для просмотра)",
  systemsMinor: "ПСИХОЛОГИЧЕСКИЙ БОЙ · БЕЗ ЭКРАНА GAME OVER",
  systemsMajor: "СИСТЕМЫ МИРА NIGHTMARE",
  systemsBody:
    "Противники в Lunoris — это сгустки эмоций, а не монстры: они рассеиваются в свет через точные парирования, орбитальный щит осколков и мягкое возвращение в хаб.",
  returnCtaTitle: "РАССЕЧЬ РАЗЛОМ ОБРАТНО",
  returnCtaBody:
    "Вернитесь к порталам миров, чтобы продолжить путь в Dream Levels или запустить ретро-аркады 1988 года.",
  returnCtaBtn: "Вернуться к порталам миров",
};

export function getNightmarePageCopy(locale: string): NightmarePageCopy {
  if (locale === "ru") return RU_NIGHTMARE_COPY;
  return EN_NIGHTMARE_COPY;
}
