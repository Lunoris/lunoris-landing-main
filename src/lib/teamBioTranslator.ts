import { unstable_cache } from "next/cache";
import { normalizeLocale, type Locale } from "@/i18n/types";

export const TEAM_BIO_I18N_TAG = "team-bio-i18n";

const MYMEMORY_LANG_MAP: Record<Locale, string> = {
  en: "en",
  ru: "ru",
  ar: "ar",
  de: "de",
  fr: "fr",
  es: "es",
  zh: "zh-CN",
  ja: "ja",
};

const MAX_CHUNK_BYTES = 420;
const MAX_MEMORY_CACHE_ENTRIES = 800;

const memoryBioCache = new Map<string, string>();
const inFlightTranslations = new Map<string, Promise<string>>();

function rememberInMemory(key: string, value: string): void {
  if (memoryBioCache.size >= MAX_MEMORY_CACHE_ENTRIES) {
    const oldestKey = memoryBioCache.keys().next().value;
    if (typeof oldestKey === "string") {
      memoryBioCache.delete(oldestKey);
    }
  }
  memoryBioCache.set(key, value);
}

function detectSourceLang(text: string): string {
  const kana = (text.match(/[\u3040-\u30FF]/g) || []).length;
  if (kana > 0) return "ja";

  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const hanzi = (text.match(/[\u4E00-\u9FFF]/g) || []).length;
  if (hanzi > 0 && hanzi >= latin * 0.25) return "zh-CN";

  const cyrillic = (text.match(/[А-Яа-яЁё]/g) || []).length;
  if (cyrillic > 0 && cyrillic >= latin * 0.3) return "ru";

  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabic > 0 && arabic >= latin * 0.3) return "ar";

  return "en";
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function splitParagraphIntoChunks(
  paragraph: string,
  maxBytes = MAX_CHUNK_BYTES
): string[] {
  const trimmed = paragraph.trim();
  if (!trimmed) return [];
  if (Buffer.byteLength(trimmed, "utf8") <= maxBytes) {
    return [trimmed];
  }

  const sentences = trimmed.split(/(?<=[.!?。！？])\s+/);
  const chunks: string[] = [];
  let current = "";

  const pushWordsFallback = (longSegment: string) => {
    const words = longSegment.split(/\s+/).filter(Boolean);
    let buf = "";
    for (const word of words) {
      const candidate = buf ? `${buf} ${word}` : word;
      if (Buffer.byteLength(candidate, "utf8") <= maxBytes) {
        buf = candidate;
      } else {
        if (buf) chunks.push(buf);
        buf = word;
      }
    }
    if (buf) chunks.push(buf);
  };

  for (const sentence of sentences) {
    if (!sentence) continue;
    if (Buffer.byteLength(sentence, "utf8") > maxBytes) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      pushWordsFallback(sentence);
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (Buffer.byteLength(candidate, "utf8") <= maxBytes) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = sentence;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

async function fetchChunkFromMyMemory(
  chunk: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const contactEmail = (process.env.LUNORIS_TRANSLATE_EMAIL || "").trim();
  const deParam = contactEmail
    ? `&de=${encodeURIComponent(contactEmail)}`
    : "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    chunk
  )}&langpair=${encodeURIComponent(`${sourceLang}|${targetLang}`)}${deParam}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(4500),
  });

  if (!res.ok) {
    throw new Error(`Translation HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    responseStatus?: number | string;
    quotaFinished?: boolean;
    responseData?: { translatedText?: unknown };
  };

  if (
    Number(data?.responseStatus) !== 200 ||
    data?.quotaFinished === true ||
    typeof data?.responseData?.translatedText !== "string"
  ) {
    throw new Error("Translation response unavailable");
  }

  const cleaned = decodeHtmlEntities(data.responseData.translatedText).trim();
  if (
    !cleaned ||
    /^(MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE PAIR|PLEASE SELECT)/i.test(
      cleaned
    )
  ) {
    throw new Error("Translation returned warning");
  }

  return cleaned;
}

async function translateBioUncached(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const joiner = targetLang === "zh-CN" || targetLang === "ja" ? "" : " ";
  const translatedParagraphs: string[] = [];

  for (const paragraph of paragraphs) {
    const chunks = splitParagraphIntoChunks(paragraph);
    const translatedChunks = await Promise.all(
      chunks.map((chunk) =>
        fetchChunkFromMyMemory(chunk, sourceLang, targetLang)
      )
    );
    translatedParagraphs.push(translatedChunks.join(joiner));
  }

  return translatedParagraphs.join("\n\n");
}

const translateBioDataCached = unstable_cache(
  translateBioUncached,
  ["lunoris-team-bio-translation-v1"],
  {
    tags: [TEAM_BIO_I18N_TAG],
    revalidate: 604800,
  }
);

export async function translateTeamBio(
  rawBio: string | null | undefined,
  rawLocale?: string | null
): Promise<string | null> {
  if (typeof rawBio !== "string") return null;
  const trimmed = rawBio.trim();
  if (!trimmed) return null;

  // Skip strings that contain no letters at all
  if (!/\p{L}/u.test(trimmed)) return trimmed;

  const locale = normalizeLocale(rawLocale);
  const targetLang = MYMEMORY_LANG_MAP[locale];
  const sourceLang = detectSourceLang(trimmed);

  if (sourceLang === targetLang) {
    return trimmed;
  }

  const cacheKey = `${sourceLang}->${targetLang}::${trimmed}`;
  const memHit = memoryBioCache.get(cacheKey);
  if (typeof memHit === "string") {
    return memHit;
  }

  const existingFlight = inFlightTranslations.get(cacheKey);
  if (existingFlight) {
    return existingFlight;
  }

  const promise = (async () => {
    try {
      const translated = await translateBioDataCached(
        trimmed,
        sourceLang,
        targetLang
      );
      if (translated) {
        rememberInMemory(cacheKey, translated);
        return translated;
      }
      return trimmed;
    } catch {
      // Graceful fallback to the raw API bio if translation endpoint is offline or rate-limited
      return trimmed;
    } finally {
      inFlightTranslations.delete(cacheKey);
    }
  })();

  inFlightTranslations.set(cacheKey, promise);
  return promise;
}

export async function buildTranslatedBiosMap(
  bios: (string | null | undefined)[],
  rawLocale?: string | null
): Promise<Map<string, string>> {
  const uniqueBios = Array.from(
    new Set(
      bios
        .map((b) => (typeof b === "string" ? b.trim() : ""))
        .filter(Boolean)
    )
  );

  const result = new Map<string, string>();
  if (uniqueBios.length === 0) return result;

  const entries = await Promise.all(
    uniqueBios.map(async (bio) => {
      const translated = await translateTeamBio(bio, rawLocale);
      return [bio, translated ?? bio] as const;
    })
  );

  for (const [original, translated] of entries) {
    result.set(original, translated);
  }

  return result;
}
