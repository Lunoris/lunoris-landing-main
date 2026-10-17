export interface NewsArticle {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: "Update" | "World & Lore" | "Video";
  ctaLabel: "READ MORE" | "WATCH NOW";
  isVideo?: boolean;
  videoSrc?: string;
  image: string;
  excerpt: string;
  lead: string;
  sections: {
    heading: string;
    paragraphs: string[];
    quote?: string;
    image?: string;
    imageCaption?: string;
  }[];
  highlights: string[];
}

export const LUNORIS_NEWS: NewsArticle[] = [
  {
    slug: "gamescom-cologne-van-gogh-award-and-demo",
    title: "Lunoris Wins the Gamescom 'Van Gogh' Art Award as Public Demo Launches",
    date: "October 14, 2026",
    readTime: "6 Min Read",
    category: "Update",
    ctaLabel: "READ MORE",
    image: "/assets/elar-joy.jpg",
    excerpt:
      "Following our hands-on showcase at the Indie Castle booth in Cologne, Lunoris: Piece of Mind has been honored with the 'Van Gogh' Award for artistic direction alongside our free Steam demo.",
    lead: "During Gamescom in Cologne, hundreds of players stepped inside Lunora's painted subconscious for the first time at the Indie Castle showcase, culminating in Lunoris: Piece of Mind receiving the 'Van Gogh' Award — presented 'for the game that should be in an art museum.'",
    highlights: [
      "Honored with the Indie Castle 'Van Gogh' Award at Gamescom Cologne",
      "Playable Chapter 1 Dream Islands, Apartment Hub, and FearClaw Boss Arena live on Steam",
      "First public preview of the 2000x2000 ELAR Sanctuary and Echo Creature awakening",
    ],
    sections: [
      {
        heading: "A Living Canvas Inside the Subconscious",
        paragraphs: [
          "From the earliest sketches of Lunoris: Piece of Mind, our goal was to treat every realm of Lunora's inner world not as a conventional video game level, but as an evolving painting shaped by memory, grief, and renewal. When eighteen-year-old artist Lunora is drawn deep inside her own mind after the midnight crash on Wahm Lane, her emotional state literally repaints the geometry, sky, and weather around her.",
          "At Gamescom in Cologne, players experienced this shift firsthand — moving from the quiet rain of her childhood apartment into the fractured verticality of the Dream Islands and the bioluminescent meadows of ELAR.",
        ],
        quote:
          "The 'Van Gogh' Award — For the game that should be in an art museum.",
        image: "/assets/dream-level-1.png",
        imageCaption:
          "Floating ruins of Chapter 1 Dream Islands, where memory fragments suspend across a violet sky.",
      },
      {
        heading: "What Awaits in the Public Steam Demo",
        paragraphs: [
          "The public Steam demo invites you to explore the Apartment Hub, step through the backyard well into the open sanctuary of ELAR, and test your emotional stability inside the first Nightmare incursion against FearClaw.",
          "Along the way, you will travel alongside Fareeda, Kurtam, Freddy, and Centric — Lunora's beloved companions who manifest as luminous guardians across her dreamscape.",
        ],
      },
    ],
  },
  {
    slug: "title-update-elar-sanctuary-bloom",
    title: "Sanctuary Update 0.4.2: ELAR Biome Blooming & Echo Creature Evolution",
    date: "October 9, 2026",
    readTime: "8 Min Read",
    category: "Update",
    ctaLabel: "READ MORE",
    image: "/assets/elar-hope.jpg",
    excerpt:
      "Tomorrow we are rolling out Sanctuary Update 0.4.2, expanding the 2000x2000 open garden of ELAR with dynamic flora saturation, new Echo Light shrines, and four-stage creature hatching.",
    lead: "ELAR is the emotional heart of Lunoris: Piece of Mind — a 2000x2000 persistent open world with zero enemies, zero timers, and zero combat pressure. Update 0.4.2 deepens how harvested Echo Lights transform colourless fog into living painted ecosystems.",
    highlights: [
      "Real-time shader transition from monochrome slumber mist to golden bioluminescent bloom",
      "Four-stage evolution loop (Cocoon, Sprout, Juvenile, Ascended) for all 32 Echo Creatures",
      "New echoed audio memories unlocked as each emotional biome reaches harmony",
    ],
    sections: [
      {
        heading: "Turning Nightmare Energy Into Living Color",
        paragraphs: [
          "Every incursion into a Nightmare realm yields raw emotional energy. When you return through the backyard well into ELAR, that energy crystallizes into Echo Lights that can be channeled into dormant cocoons scattered across nine distinct emotional biomes.",
          "With Update 0.4.2, awakening a cocoon now triggers a cascading brushstroke wave across the surrounding terrain — unfurling autumn foliage, clearing distant fog banks, and opening wind currents for Kurtam's aerial gliding.",
        ],
        image: "/assets/elar-stillness.jpg",
        imageCaption:
          "Twilight over the Stillness basin in ELAR after restoring the surrounding Echo shrines.",
      },
      {
        heading: "Release Notes & Quality-of-Life Refinements",
        paragraphs: [
          "Alongside visual upgrades to ELAR's water reflections and foliage shaders, Update 0.4.2 refines companion pathfinding so Fareeda, Kurtam, Freddy, and Centric stay seamlessly within view as you explore elevated sanctuary ruins.",
        ],
      },
    ],
  },
  {
    slug: "1988-diriyah-retro-flashbacks-teaser",
    title: "1988 Diriyah & Retro Memory Flashbacks: Playable Nostalgia Teaser",
    date: "September 28, 2026",
    readTime: "Video Feature",
    category: "Video",
    ctaLabel: "WATCH NOW",
    isVideo: true,
    videoSrc: "/assets/car-level-loop.mp4",
    image: "/assets/car-level-poster.jpg",
    excerpt:
      "Take the wheel of a 1967 Chevrolet Impala through neon-lit 1988 Diriyah nights and watch how family keepsakes shift the world into playable 2D retro chapters.",
    lead: "Not every memory inside Lunora's mind belongs to her own lifetime. By touching heirloom canvases and cassette tapes inside the Apartment Hub, players are transported back to 1988 Diriyah — experiencing her parents' youth behind the wheel of a 1967 Chevrolet Impala.",
    highlights: [
      "Synth-drenched midnight drives through 1988 Diriyah aboard a classic 1967 Chevrolet Impala",
      "Seamless mid-level transitions from 3D driving into nostalgic 2D pixel-art memory chapters",
      "Uncovers the deeper family history between Lunora's father John Ford and her mother Lulwah",
    ],
    sections: [
      {
        heading: "Where 3D Dreamscapes Meet 2D Arcade Memory",
        paragraphs: [
          "Memory is rarely stored in a single medium. While Lunora's present-day subconscious unfolds as a painterly 3D world, her earliest childhood stories and her father's recollections of 1988 Diriyah manifest as playable retro sequences.",
          "As you cruise down glowing highway stretches, roadside billboards and radio frequencies ripple with fragments of distant conversations from the waking world.",
        ],
        quote:
          "Every mile marker in 1988 Diriyah brings Lunora one step closer to understanding what her family lost — and what still anchors her to waking life.",
      },
    ],
  },
  {
    slug: "beyond-the-mirror-fearclaw-nightmare-realm",
    title: "Beyond the Mirror: Designing FearClaw & the Nightmare Incursions",
    date: "September 18, 2026",
    readTime: "7 Min Read",
    category: "World & Lore",
    ctaLabel: "READ MORE",
    image: "/assets/fearclaw-boss.png",
    excerpt:
      "Step through the cracked apartment mirror into the storm of the first Nightmare realm, where suppressed trauma takes physical form as the towering boss FearClaw.",
    lead: "In Lunoris: Piece of Mind, the Apartment mirror is a threshold into the darkest corners of Lunora's trauma. Unlike the serene gardens of ELAR, the Nightmare realms are high-tension combat arenas governed by your shared Emotional Stability pulse.",
    highlights: [
      "Multi-phase boss encounter against FearClaw inside a shifting obsidian storm arena",
      "Fareeda's glowing Arabic calligraphy aura suppresses Fear screen-distortion during boss phases",
      "Freddy's blue-flame collar warns players moments before subterranean shadow strikes erupt",
    ],
    sections: [
      {
        heading: "Surviving the Storm With Your Companions",
        paragraphs: [
          "FearClaw thrives on disorientation, shrouding the arena in dense monochrome mist and lunging from blind angles. Overcoming the encounter requires relying on the bond with your four companions rather than brute force alone.",
          "Keeping Fareeda close stabilizes your field of vision with warm golden calligraphy, while Centric marks exposed weak points from high above the arena pillars.",
        ],
        image: "/assets/fearclaw-boss.png",
        imageCaption:
          "Lunora confronts FearClaw inside the first Nightmare realm beyond the apartment mirror.",
      },
    ],
  },
  {
    slug: "four-bedside-guardians-companion-synergy",
    title: "Luminous Guardians: How Lunora's Real-World Pets Shape the Dream",
    date: "September 4, 2026",
    readTime: "5 Min Read",
    category: "World & Lore",
    ctaLabel: "READ MORE",
    image: "/assets/fareeda-portrait.png",
    excerpt:
      "Explore how Fareeda, Kurtam, Freddy, and Centric transform from beloved household pets into simultaneous dream guardians with traversal and reconnaissance powers.",
    lead: "While Lunora remains adrift between waking life and the dreamscape, her four real-world pets remain part of her deepest sense of safety. Inside her subconscious, all four companions travel beside you simultaneously — never locked behind a single-pet equip slot.",
    highlights: [
      "Fareeda (Scottish Fold Munchkin Cat): Projects a serenity aura that clears Fear distortion",
      "Kurtam (Sugar Glider): Transforms into a bear-sized aerial mount for gliding across chasms",
      "Freddy (Miniature Dachshund) & Centric (Macaw): Ground ambush radar and high-altitude scouting",
    ],
    sections: [
      {
        heading: "Four Simultaneous Bonds, Zero Menu Swapping",
        paragraphs: [
          "We wanted Lunora's companions to feel like a living family rather than interchangeable equipment items. As you traverse the seven Dream Islands, Freddy trots ahead sniffing out buried Echo Shards, Centric circles overhead calling out hidden memory doors, Fareeda illuminates dark corridors, and Kurtam catches rising thermal currents to carry you across shattered bridges.",
        ],
        image: "/assets/kurtam-portrait.png",
        imageCaption:
          "Watercolor study of Kurtam, who transforms from a tiny pocket sugar glider into an aerial mount.",
      },
    ],
  },
  {
    slug: "voices-of-wahm-lane-cast-spotlight",
    title: "Echoes of Wahm Lane: Spotlight on the Voice Cast of Lunoris",
    date: "August 22, 2026",
    readTime: "5 Min Read",
    category: "World & Lore",
    ctaLabel: "READ MORE",
    image: "/assets/lunora-render.png",
    excerpt:
      "Meet the acclaimed voice actors bringing Lunora, Young Lunora, her father John Ford, Kai, Kane, and Centric to life across waking-world echoes and dream realms.",
    lead: "Every realm in Lunoris: Piece of Mind is threaded with voices — both the memories of the night on Wahm Lane and the quiet conversations reaching Lunora from the waking world.",
    highlights: [
      "Kira Buckland as 18-year-old protagonist Lunora & LilyPichu as Young Lunora in watercolor flashbacks",
      "Scott Dreier as Lunora's devoted father and painting partner, John Ford",
      "Ryan Drummond (Kai), David Humphrey (Kane), and Pete Capella (Centric)",
    ],
    sections: [
      {
        heading: "Voices Across Two Realities",
        paragraphs: [
          "As players journey deeper into the seven grief-stage chapters, audio echoes from the waking world bleed into the dreamscape sky. Hearing John Ford's voice while restoring a canvas in ELAR grounds the fantastical imagery in an intimate human story of family, forgiveness, and awakening.",
        ],
        image: "/assets/dad-portrait.png",
        imageCaption:
          "John Ford, Lunora's father and artistic mentor, whose voice guides her back toward waking life.",
      },
    ],
  },
];
