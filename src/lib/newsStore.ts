import fs from "fs/promises";
import path from "path";
import { LUNORIS_NEWS, type NewsArticle } from "@/data/newsData";

const DATA_DIR = path.join(process.cwd(), "data");
const NEWS_FILE = path.join(DATA_DIR, "published-news.json");

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
  return enqueueWrite(async () => {
    const all = await ensureNewsStoreInitialized();
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

    await writeNewsAtomically(all);
    return { article, created };
  });
}

export async function deleteNewsBySlug(slug: string): Promise<boolean> {
  return enqueueWrite(async () => {
    const all = await ensureNewsStoreInitialized();
    const next = all.filter((item) => item.slug !== slug);
    if (next.length === all.length) {
      return false;
    }
    await writeNewsAtomically(next);
    return true;
  });
}
