import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedAllNews, getCachedNewsBySlug } from "@/lib/newsStore";
import { SingleNewsArticleView } from "@/components/sections/SingleNewsArticleView";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getCachedAllNews();
  return articles.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedNewsBySlug(slug);
  if (!article) return {};

  const title = `${article.title} | Lunoris: Piece of Mind`;
  const description = article.excerpt;
  return {
    title,
    description,
    openGraph: {
      type: "article",
      siteName: "Lunoris: Piece of Mind",
      title,
      description,
      images: [{ url: article.image, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.image],
    },
  };
}

export default async function SingleNewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getCachedNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getCachedAllNews();
  const relatedArticles = allArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <SingleNewsArticleView
      article={article}
      relatedArticles={relatedArticles}
    />
  );
}
