// 内容文章注册表（/guides/）。每篇文章 = 这里一条元数据 + 一个 app/guides/<slug>/page.tsx 正文。
// 游戏站的内容引流：用趣味知识/榜单文章吃信息型长尾词（"countries by gdp" 等），
// 文章结尾把读者导流到对应的猜大小游戏。新增文章：GUIDES 加一条 + 复制一个 page.tsx。

import { getDeck, type DeckDef } from "@/lib/decks";

export interface GuideDef {
  slug: string; // 路由 /guides/<slug>/
  title: string; // <title>（不含站名，站名由 layout 模板自动加）
  metaDescription: string;
  h1: string;
  intro: string; // H1 下方一句话
  description: string; // 列表页摘要
  date: string; // ISO 日期，用于 Article 结构化数据 + 页面显示
  keywords: string[];
  relatedSlugs: string[]; // 关联游戏 deck slug，用于底部"玩这个游戏"CTA 内链
}

export const GUIDES: GuideDef[] = [
  {
    slug: "most-valuable-world-cup-2026-players",
    title: "Most Valuable Players at the 2026 World Cup",
    metaDescription:
      "The most valuable footballers heading into the 2026 World Cup, ranked by transfer market value — Bellingham, Haaland, Mbappé, Yamal and more — plus a Higher or Lower game to test your guesses.",
    h1: "Most Valuable Players at the 2026 World Cup",
    intro:
      "Who is the most valuable footballer heading into the 2026 World Cup? Here are the top stars by estimated transfer market value — and a quick game to test how well you know them.",
    description:
      "The top World Cup 2026 stars ranked by estimated transfer market value, how club and age shape the numbers, and a game to test your knowledge.",
    date: "2026-06-05",
    keywords: [
      "most valuable world cup players",
      "world cup 2026 player values",
      "highest market value footballers",
      "most expensive players 2026",
      "transfermarkt world cup",
    ],
    relatedSlugs: [
      "world-cup-player-value-higher-or-lower",
      "world-cup-team-value-higher-or-lower",
    ],
  },
  {
    slug: "most-valuable-national-teams-2026",
    title: "Most Valuable National Teams at the 2026 World Cup",
    metaDescription:
      "National teams ranked by total squad market value heading into the 2026 World Cup — England, Spain, France, Brazil and more — plus a Higher or Lower game to test your guesses.",
    h1: "Most Valuable National Teams at the 2026 World Cup",
    intro:
      "Which country brings the most valuable squad to the 2026 World Cup? Here are the leading national teams by total squad market value — and a game to test your instincts.",
    description:
      "The leading 2026 World Cup national teams ranked by total squad market value, why squad depth matters more than population, and a game to test yourself.",
    date: "2026-06-05",
    keywords: [
      "most valuable national teams",
      "world cup 2026 squad value",
      "most expensive squads world cup",
      "national team market value ranking",
      "which world cup team is worth most",
    ],
    relatedSlugs: [
      "world-cup-team-value-higher-or-lower",
      "world-cup-player-value-higher-or-lower",
    ],
  },
  {
    slug: "countries-by-gdp-ranking",
    title: "Countries by GDP: The Full Ranking (Top Economies)",
    metaDescription:
      "The world's largest economies ranked by nominal GDP — see the top 25 countries, how the US and China compare, and test your guesses in a quick Higher or Lower game.",
    h1: "Countries by GDP: The Full Ranking",
    intro:
      "Which country has the biggest economy — and by how much? Here are the world's largest economies by nominal GDP, plus a game to test how well you really know them.",
    description:
      "The world's biggest economies ranked by nominal GDP, why nominal differs from per-capita, and a quick game to test your knowledge.",
    date: "2026-06-05",
    keywords: [
      "countries by gdp",
      "largest economies in the world",
      "gdp ranking by country",
      "biggest economies 2026",
      "us vs china gdp",
    ],
    relatedSlugs: ["which-is-worth-more", "gdp-per-capita-higher-or-lower"],
  },
];

export function getGuide(slug: string): GuideDef | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function relatedDecksForGuide(guide: GuideDef): DeckDef[] {
  return guide.relatedSlugs
    .map((slug) => getDeck(slug))
    .filter((d): d is DeckDef => Boolean(d));
}
