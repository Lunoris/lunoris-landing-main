import type { NewsArticle } from "@/data/newsData";
import type { TeamLeader } from "@/data/teamData";
import type { Locale, SiteTranslations } from "./types";

export function localizeNewsCategory(
  category: NewsArticle["category"] | "All" | string,
  t: SiteTranslations
): string {
  const map = t.news.categories as Record<string, string>;
  return map[category] ?? category;
}

export function localizeNewsArticle(
  article: NewsArticle,
  locale: Locale,
  t: SiteTranslations
): NewsArticle {
  if (locale === "en") return article;
  const tr = t.news.articles[article.slug];
  if (!tr) return article;

  return {
    ...article,
    title: tr.title,
    date: tr.date,
    readTime: tr.readTime,
    excerpt: tr.excerpt,
    lead: tr.lead,
    highlights: tr.highlights,
    sections: article.sections.map((sec, idx) => {
      const trSec = tr.sections[idx];
      if (!trSec) return sec;
      return {
        ...sec,
        heading: trSec.heading,
        paragraphs: trSec.paragraphs,
        quote: trSec.quote ?? sec.quote,
        imageCaption: trSec.imageCaption ?? sec.imageCaption,
      };
    }),
  };
}

export function localizeDepartmentLabel(
  raw: string | null | undefined,
  t: SiteTranslations
): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = trimmed.toLowerCase();
  return t.team.departments[key] ?? trimmed;
}

export function localizeLeader(
  leader: TeamLeader,
  locale: Locale,
  t: SiteTranslations
): TeamLeader {
  if (locale === "en") return leader;

  return {
    ...leader,
    department: leader.department
      ? localizeDepartmentLabel(leader.department, t)
      : "",
  };
}
