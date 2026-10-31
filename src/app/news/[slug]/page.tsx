import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNews, getNewsBySlug } from "@/lib/newsStore";
import { SingleNewsArticleView } from "@/components/sections/SingleNewsArticleView";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const articles = await getAllNews();
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
  const article = await getNewsBySlug(slug);
  if (!article) return {};

  const title = `${article.title} | Lunoris: Piece of Mind`;
  return {
    title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      siteName: "Lunoris: Piece of Mind",
      title,
      description: article.excerpt,
      images: [{ url: article.image, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.excerpt,
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
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getAllNews();
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
