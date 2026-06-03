import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, absoluteUrl, AUTHOR_NAME } from "@/lib/site";
import type { DeckDef } from "@/lib/decks";

interface PageMetaInput {
  title: string;
  description: string;
  path: string; // 以 / 开头
  keywords?: string[];
}

export function buildMetadata({ title, description, path, keywords }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

// 游戏页:Game(让搜索引擎/AI 识别为可玩的在线游戏)
export function gameJsonLd(deck: DeckDef) {
  return {
    "@context": "https://schema.org",
    "@type": "Game",
    name: deck.name,
    url: absoluteUrl(`/${deck.slug}/`),
    description: deck.metaDescription,
    genre: "Trivia, Puzzle",
    gamePlatform: "Web browser",
    applicationCategory: "GameApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: AUTHOR_NAME },
  };
}

export function howToJsonLd(deck: DeckDef) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to play ${deck.name}`,
    step: deck.howTo.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
  };
}

export function faqJsonLd(deck: DeckDef) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: deck.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
