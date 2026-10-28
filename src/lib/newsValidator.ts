import type { NewsArticle } from "@/data/newsData";
import { validateMediaUrlOrPath } from "@/lib/mediaUpload";

const ALLOWED_CATEGORIES = ["Update", "World & Lore", "Video"] as const;

function cleanText(
  value: unknown,
  fieldName: string,
  minLen: number,
  maxLen: number
): string {
  if (typeof value !== "string") {
    throw new Error(`Field "${fieldName}" must be a string.`);
  }
  const cleaned = value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();

  if (cleaned.length < minLen) {
    throw new Error(
      `Field "${fieldName}" must be at least ${minLen} characters long.`
    );
  }
  if (cleaned.length > maxLen) {
    throw new Error(
      `Field "${fieldName}" exceeds maximum length of ${maxLen} characters.`
    );
  }
  return cleaned;
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);

  return base.length >= 3 ? base : `lunoris-chronicle-${Date.now()}`;
}

export function validateSlug(rawSlug: string): string {
  const cleaned = rawSlug.trim().toLowerCase();
  if (
    cleaned.length < 1 ||
    cleaned.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned)
  ) {
    throw new Error(
      'Invalid "slug". Only lowercase letters, numbers, and single hyphens are allowed (1-120 chars).'
    );
  }
  return cleaned;
}

function formatCurrentEnglishDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function estimateReadTime(
  lead: string,
  sections: NewsArticle["sections"],
  isVideo?: boolean
): string {
  if (isVideo) return "Video Feature";
  const words = [
    lead,
    ...sections.flatMap((s) => [s.heading, ...s.paragraphs, s.quote || ""]),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(2, Math.min(25, Math.ceil(words / 180)));
  return `${minutes} Min Read`;
}

export function validateAndBuildNewsArticle(
  input: Record<string, unknown>,
  existingArticle?: NewsArticle
): NewsArticle {
  const title =
    input.title !== undefined
      ? cleanText(input.title, "title", 4, 220)
      : existingArticle?.title;

  if (!title) {
    throw new Error('Field "title" is required.');
  }

  const slug =
    typeof input.slug === "string" && input.slug.trim().length > 0
      ? validateSlug(input.slug)
      : existingArticle?.slug || slugifyTitle(title);

  const rawCategory =
    input.category !== undefined ? input.category : existingArticle?.category;
  if (
    typeof rawCategory !== "string" ||
    !ALLOWED_CATEGORIES.includes(
      rawCategory as (typeof ALLOWED_CATEGORIES)[number]
    )
  ) {
    throw new Error(
      `Field "category" must be one of: ${ALLOWED_CATEGORIES.join(", ")}.`
    );
  }
  const category = rawCategory as NewsArticle["category"];

  const excerpt =
    input.excerpt !== undefined
      ? cleanText(input.excerpt, "excerpt", 10, 600)
      : existingArticle?.excerpt;
  if (!excerpt) {
    throw new Error('Field "excerpt" is required.');
  }

  const lead =
    input.lead !== undefined && typeof input.lead === "string" && input.lead.trim().length > 0
      ? cleanText(input.lead, "lead", 1, 1500)
      : existingArticle?.lead || excerpt;

  const rawImage =
    input.image !== undefined ? input.image : existingArticle?.image;
  if (typeof rawImage !== "string" || !rawImage.trim()) {
    throw new Error(
      'Field "image" is required (provide an uploaded file or a media URL/path).'
    );
  }
  const image = validateMediaUrlOrPath(rawImage, "image");

  let videoSrc: string | undefined = existingArticle?.videoSrc;
  if (input.videoSrc !== undefined) {
    if (input.videoSrc === null || input.videoSrc === "") {
      videoSrc = undefined;
    } else if (typeof input.videoSrc === "string") {
      videoSrc = validateMediaUrlOrPath(input.videoSrc, "videoSrc");
    } else {
      throw new Error('Field "videoSrc" must be a string URL/path.');
    }
  }

  const isVideo =
    typeof input.isVideo === "boolean"
      ? input.isVideo
      : Boolean(videoSrc) || category === "Video";

  // Highlights
  let highlights: string[] = existingArticle?.highlights || [];
  if (input.highlights !== undefined) {
    if (!Array.isArray(input.highlights) || input.highlights.length > 12) {
      throw new Error(
        'Field "highlights" must be an array of up to 12 strings.'
      );
    }
    highlights = input.highlights.map((item, idx) =>
      cleanText(item, `highlights[${idx}]`, 1, 320)
    );
  }

  // Sections
  let sections: NewsArticle["sections"] = existingArticle?.sections || [];
  if (input.sections !== undefined) {
    if (
      !Array.isArray(input.sections) ||
      input.sections.length === 0 ||
      input.sections.length > 20
    ) {
      throw new Error(
        'Field "sections" must be a non-empty array of up to 20 content blocks.'
      );
    }

    sections = input.sections.map((rawSec, sIdx) => {
      if (!rawSec || typeof rawSec !== "object") {
        throw new Error(`Section at index ${sIdx} must be an object.`);
      }
      const sec = rawSec as Record<string, unknown>;
      const heading = cleanText(
        sec.heading,
        `sections[${sIdx}].heading`,
        1,
        200
      );

      if (
        !Array.isArray(sec.paragraphs) ||
        sec.paragraphs.length === 0 ||
        sec.paragraphs.length > 20
      ) {
        throw new Error(
          `Field "sections[${sIdx}].paragraphs" must be a non-empty array of strings.`
        );
      }

      const paragraphs = sec.paragraphs.map((p, pIdx) =>
        cleanText(p, `sections[${sIdx}].paragraphs[${pIdx}]`, 1, 4000)
      );

      const builtSection: NewsArticle["sections"][number] = {
        heading,
        paragraphs,
      };

      if (typeof sec.quote === "string" && sec.quote.trim()) {
        builtSection.quote = cleanText(
          sec.quote,
          `sections[${sIdx}].quote`,
          1,
          600
        );
      }

      if (typeof sec.image === "string" && sec.image.trim()) {
        builtSection.image = validateMediaUrlOrPath(
          sec.image,
          `sections[${sIdx}].image`
        );
      }

      if (typeof sec.imageCaption === "string" && sec.imageCaption.trim()) {
        builtSection.imageCaption = cleanText(
          sec.imageCaption,
          `sections[${sIdx}].imageCaption`,
          1,
          400
        );
      }

      return builtSection;
    });
  } else if (sections.length === 0) {
    throw new Error('Field "sections" is required when creating an article.');
  }

  const date =
    typeof input.date === "string" && input.date.trim()
      ? cleanText(input.date, "date", 3, 60)
      : existingArticle?.date || formatCurrentEnglishDate();

  const readTime =
    typeof input.readTime === "string" && input.readTime.trim()
      ? cleanText(input.readTime, "readTime", 2, 40)
      : existingArticle?.readTime || estimateReadTime(lead, sections, isVideo);

  const article: NewsArticle = {
    slug,
    title,
    date,
    readTime,
    category,
    ctaLabel: "READ MORE",
    isVideo,
    ...(videoSrc ? { videoSrc } : {}),
    image,
    excerpt,
    lead,
    highlights,
    sections,
  };

  return article;
}
