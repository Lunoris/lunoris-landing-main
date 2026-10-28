export interface NewsArticle {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: "Update" | "World & Lore" | "Video";
  ctaLabel: "READ MORE";
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

export const LUNORIS_NEWS: NewsArticle[] = [];
