import fs from "fs/promises";
import path from "path";
import { del, list, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";
import { LUNORIS_NEWS, type NewsArticle } from "@/data/newsData";

const DATA_DIR = path.join(process.cwd(), "data");
const NEWS_FILE = path.join(DATA_DIR, "published-news.json");

// On Vercel the disk does not persist, so articles live in Vercel Blob. Every save writes a new
// immutable version (news/store/articles-<ms>-<suffix>.json) and readers take the newest one from list():
// overwriting one file is not safe there, because a direct origin read can briefly return nothing or an old copy.
// Without a Blob token (plain local dev) they stay in data/published-news.json.
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_PREFIX = "news/store/articles-";
const KEEP_VERSIONS = 10; // older versions are pruned; these double as a short undo history
const NEWS_TAG = "news";

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
const readBlobCached = unstable_cache(readBlobStore, ["news-store"], { tags: [NEWS_TAG] });

// ponytail: two saves landing in the same instant on different instances keep only the later one;
// news is written by a handful of editors, add a lock (e.g. ifMatch on a pointer blob) if that changes.
async function updateBlobStore<T>(change: (all: NewsArticle[]) => { next: NewsArticle[] | null; result: T }): Promise<T> {
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
      return [...LUNORIS_NEWS]; // Blob unreachable: show the built-in articles rather than an error page
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

  // Seed the store from the built-in articles. Where the disk is read-only (Vercel), serve them from memory.
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

export async function upsertNewsArticle(
  article: NewsArticle,
  options: { allowOverwrite?: boolean; targetSlug?: string } = {
    allowOverwrite: true,
  }
): Promise<{ article: NewsArticle; created: boolean }> {
  const change = (all: NewsArticle[]) => {
    const lookupSlug = options.targetSlug || article.slug;
    const existingIndex = all.findIndex((item) => item.slug === lookupSlug);

    // If renaming slug via PATCH (lookupSlug !== article.slug), ensure no other article already owns the new slug
    if (lookupSlug !== article.slug) {
      const collisionIndex = all.findIndex(
        (item, idx) => item.slug === article.slug && idx !== existingIndex
      );
      if (collisionIndex !== -1) {
        throw new Error(
          `Cannot rename slug to "${article.slug}": another article with that slug already exists.`
        );
      }
    }

    if (existingIndex !== -1 && options.allowOverwrite === false) {
      throw new Error(
        `An article with slug "${article.slug}" already exists. Use PATCH /api/news/${article.slug} or set "upsert": true.`
      );
    }

    let created = true;
    if (existingIndex !== -1) {
      // Update in-place to preserve exact list order (even when slug is renamed)
      all[existingIndex] = article;
      created = false;
    } else {
      // Prepend newest article at index 0 so it appears first in Latest News
      all.unshift(article);
    }

    return { next: all, result: { article, created } };
  };
  if (USE_BLOB) return enqueueWrite(() => updateBlobStore(change));
  return enqueueWrite(async () => {
    const { next, result } = change(await ensureNewsStoreInitialized());
    await writeNewsAtomically(next);
    return result;
  });
}

export async function deleteNewsBySlug(slug: string): Promise<boolean> {
  const change = (all: NewsArticle[]) => {
    const next = all.filter((item) => item.slug !== slug);
    return next.length === all.length ? { next: null, result: false } : { next, result: true };
  };
  if (USE_BLOB) return enqueueWrite(() => updateBlobStore(change));
  return enqueueWrite(async () => {
    const { next, result } = change(await ensureNewsStoreInitialized());
    if (next) await writeNewsAtomically(next);
    return result;
  });
}
