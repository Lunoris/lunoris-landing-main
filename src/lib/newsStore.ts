import fs from "fs/promises";
import path from "path";
import { cache } from "react";
import { del, list, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";
import { LUNORIS_NEWS, type NewsArticle } from "@/data/newsData";
import { NewsValidationError } from "@/lib/newsValidator";

const DATA_DIR = path.join(process.cwd(), "data");
const NEWS_FILE = path.join(DATA_DIR, "published-news.json");

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_PREFIX = "news/store/articles-";
const KEEP_VERSIONS = 10;
export const NEWS_TAG = "news";

/** All stored versions, newest first (the pathname carries the write time). */
async function listBlobVersions() {
  const { blobs } = await list({ prefix: BLOB_PREFIX });
  return blobs.sort((x, y) => (x.pathname < y.pathname ? 1 : -1));
}

/** The newest stored article list, or null before the first save. Throws when Blob is unreachable. */
async function readBlobStore(): Promise<NewsArticle[] | null> {
  const [latest] = await listBlobVersions();
  if (!latest) return null;
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`News store read failed (${res.status}).`);
  const parsed = await res.json();
  if (!Array.isArray(parsed)) throw new Error("News store is not an article list.");
  return parsed as NewsArticle[];
}

// Page views read through Next's shared data cache; every save expires it. Errors are not cached.
const readBlobCached = unstable_cache(readBlobStore, ["news-store"], {
  tags: [NEWS_TAG],
});

async function updateBlobStore<T>(
  change: (all: NewsArticle[]) => { next: NewsArticle[] | null; result: T }
): Promise<T> {
  const { next, result } = change((await readBlobStore()) ?? [...LUNORIS_NEWS]);
  if (next) {
    await put(`${BLOB_PREFIX}${Date.now()}.json`, JSON.stringify(next, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    revalidateTag(NEWS_TAG, { expire: 0 });
    const stale = (await listBlobVersions()).slice(KEEP_VERSIONS);
    if (stale.length) await del(stale.map((b) => b.url)).catch(() => undefined);
  }
  return result;
}

// Simple in-process async mutex so concurrent requests never interleave writes
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function ensureNewsStoreInitialized(): Promise<NewsArticle[]> {
  if (USE_BLOB) {
    try {
      return (await readBlobCached()) ?? [...LUNORIS_NEWS];
    } catch {
      return [...LUNORIS_NEWS];
    }
  }
  try {
    const raw = await fs.readFile(NEWS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as NewsArticle[];
    }
  } catch {
    // File does not exist yet or is invalid JSON; initialize with LUNORIS_NEWS
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempFile = `${NEWS_FILE}.seed-${process.pid}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(LUNORIS_NEWS, null, 2), "utf8");
    await fs.rename(tempFile, NEWS_FILE);
  } catch {
    // read-only filesystem: nothing to persist to
  }
  return [...LUNORIS_NEWS];
}

async function writeNewsAtomically(articles: NewsArticle[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${NEWS_FILE}.${Date.now()}-${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(articles, null, 2), "utf8");
  await fs.rename(tempFile, NEWS_FILE);
}

export async function getAllNews(): Promise<NewsArticle[]> {
  return ensureNewsStoreInitialized();
}

export async function getNewsBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  const all = await ensureNewsStoreInitialized();
  return all.find((item) => item.slug === slug);
}

/** Per-request React.cache wrappers for Server Components (deduplicates generateMetadata + Page reads). */
export const getCachedAllNews = cache(getAllNews);
export const getCachedNewsBySlug = cache(async (slug: string) => {
  const all = await getCachedAllNews();
  return all.find((item) => item.slug === slug);
});

export async function upsertNewsArticle(
  article: NewsArticle,
  options: { allowOverwrite?: boolean; targetSlug?: string } = {
    allowOverwrite: true,
  }
): Promise<{ article: NewsArticle; created: boolean }> {
  const change = (all: NewsArticle[]) => {
    const lookupSlug = options.targetSlug || article.slug;
    const existingIndex = all.findIndex((item) => item.slug === lookupSlug);

    if (lookupSlug !== article.slug) {
      const collisionIndex = all.findIndex(
        (item, idx) => item.slug === article.slug && idx !== existingIndex
      );
      if (collisionIndex !== -1) {
        throw new NewsValidationError(
          `Cannot rename slug to "${article.slug}": another article with that slug already exists.`,
          409
        );
      }
    }

    if (existingIndex !== -1 && options.allowOverwrite === false) {
      throw new NewsValidationError(
        `An article with slug "${article.slug}" already exists. Use PATCH /api/news/${article.slug} or set "upsert": true.`,
        409
      );
    }

    let created = true;
    if (existingIndex !== -1) {
      all[existingIndex] = article;
      created = false;
    } else {
      all.unshift(article);
    }

    return { next: all, result: { article, created } };
  };
  if (USE_BLOB) return enqueueWrite(() => updateBlobStore(change));
  return enqueueWrite(async () => {
    const { next, result } = change(await ensureNewsStoreInitialized());
    await writeNewsAtomically(next);
    revalidateTag(NEWS_TAG, { expire: 0 });
    return result;
  });
}

export async function deleteNewsBySlug(slug: string): Promise<boolean> {
  const change = (all: NewsArticle[]) => {
    const next = all.filter((item) => item.slug !== slug);
    return next.length === all.length
      ? { next: null, result: false }
      : { next, result: true };
  };
  if (USE_BLOB) return enqueueWrite(() => updateBlobStore(change));
  return enqueueWrite(async () => {
    const { next, result } = change(await ensureNewsStoreInitialized());
    if (next) {
      await writeNewsAtomically(next);
      revalidateTag(NEWS_TAG, { expire: 0 });
    }
    return result;
  });
}
