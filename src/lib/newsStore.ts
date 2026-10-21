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
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as NewsArticle[];
    }
  } catch {
    // File does not exist yet or is empty; seed with LUNORIS_NEWS
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${NEWS_FILE}.seed-${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(LUNORIS_NEWS, null, 2), "utf8");
  await fs.rename(tempFile, NEWS_FILE);
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
  options: { allowOverwrite?: boolean } = { allowOverwrite: true }
): Promise<{ article: NewsArticle; created: boolean }> {
  return enqueueWrite(async () => {
    const all = await ensureNewsStoreInitialized();
    const existingIndex = all.findIndex((item) => item.slug === article.slug);

    if (existingIndex !== -1 && options.allowOverwrite === false) {
      throw new Error(
        `An article with slug "${article.slug}" already exists. Use PATCH /api/news/${article.slug} or set "upsert": true.`
      );
    }

    let created = true;
    if (existingIndex !== -1) {
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
