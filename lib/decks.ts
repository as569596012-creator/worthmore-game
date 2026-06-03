// 题库(deck)注册表:首页列表、每个游戏页、sitemap、内链都从这里读取。
// 新增一个 Higher-or-Lower 游戏 = 在 DECKS 里加一条 + 加一个 app/<slug>/page.tsx 路由。
//
// 换皮原则:同一个 deck 里所有 value 必须是同一种单位、同一个量级池,才能交叉比较。
// 数据为人工整理的"静态快照",每条带 asOf 标注其时间,数值取 2-3 位有效数字(近似,仅供娱乐)。

export type Category =
  | "Country"
  | "US State"
  | "CN Province"
  | "Company"
  | "Sports Team";

export interface DeckItem {
  name: string;
  value: number; // 以该 deck 的单位计(本站均为美元)
  category: Category;
  asOf: string; // 数据时间,如 "2024" / "2026-05"
  flag?: string; // emoji 旗帜/图标,可选
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface DeckDef {
  slug: string;
  name: string;
  emoji: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  keywords: string[];
  howTo: string[];
  body: string;
  valueLabel: string; // 卡片上数值的说明,如 "total value (USD)"
  faq: FaqItem[];
  items: DeckItem[];
}

// 把美元金额格式化成易读字符串:$3.4 trillion / $880 billion / $250 million / $80,000
export function formatMoney(n: number): string {
  if (!isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(n / 1e12 >= 10 ? 1 : 2)} trillion`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(n / 1e9 >= 100 ? 0 : 1)} billion`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)} million`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

const CATEGORY_FLAG: Record<Category, string> = {
  Country: "🌍",
  "US State": "🇺🇸",
  "CN Province": "🇨🇳",
  Company: "🏢",
  "Sports Team": "🏆",
};

export function itemIcon(item: DeckItem): string {
  return item.flag || CATEGORY_FLAG[item.category];
}

// ─────────────────────────────────────────────────────────────────────────────
// 题库数据
// ─────────────────────────────────────────────────────────────────────────────

// Deck 1:Which is worth more?(美元总额混合池:国家GDP + 美国州GDP + 中国省GDP + 公司市值 + 球队估值)
const WORTH_MORE_ITEMS: DeckItem[] = [
  // ── Countries — nominal GDP, 2024 (approx, USD) ──
  { name: "United States", value: 29.2e12, category: "Country", asOf: "2024", flag: "🇺🇸" },
  { name: "China", value: 18.3e12, category: "Country", asOf: "2024", flag: "🇨🇳" },
  { name: "Germany", value: 4.7e12, category: "Country", asOf: "2024", flag: "🇩🇪" },
  { name: "Japan", value: 4.07e12, category: "Country", asOf: "2024", flag: "🇯🇵" },
  { name: "India", value: 3.9e12, category: "Country", asOf: "2024", flag: "🇮🇳" },
  { name: "United Kingdom", value: 3.6e12, category: "Country", asOf: "2024", flag: "🇬🇧" },
  { name: "France", value: 3.17e12, category: "Country", asOf: "2024", flag: "🇫🇷" },
  { name: "Italy", value: 2.38e12, category: "Country", asOf: "2024", flag: "🇮🇹" },
  { name: "Brazil", value: 2.33e12, category: "Country", asOf: "2024", flag: "🇧🇷" },
  { name: "Canada", value: 2.21e12, category: "Country", asOf: "2024", flag: "🇨🇦" },
  { name: "Russia", value: 2.18e12, category: "Country", asOf: "2024", flag: "🇷🇺" },
  { name: "Mexico", value: 1.85e12, category: "Country", asOf: "2024", flag: "🇲🇽" },
  { name: "South Korea", value: 1.87e12, category: "Country", asOf: "2024", flag: "🇰🇷" },
  { name: "Australia", value: 1.79e12, category: "Country", asOf: "2024", flag: "🇦🇺" },
  { name: "Spain", value: 1.73e12, category: "Country", asOf: "2024", flag: "🇪🇸" },
  { name: "Indonesia", value: 1.4e12, category: "Country", asOf: "2024", flag: "🇮🇩" },
  { name: "Turkey", value: 1.34e12, category: "Country", asOf: "2024", flag: "🇹🇷" },
  { name: "Netherlands", value: 1.22e12, category: "Country", asOf: "2024", flag: "🇳🇱" },
  { name: "Saudi Arabia", value: 1.1e12, category: "Country", asOf: "2024", flag: "🇸🇦" },
  { name: "Switzerland", value: 0.94e12, category: "Country", asOf: "2024", flag: "🇨🇭" },
  { name: "Poland", value: 0.86e12, category: "Country", asOf: "2024", flag: "🇵🇱" },
  { name: "Belgium", value: 0.66e12, category: "Country", asOf: "2024", flag: "🇧🇪" },
  { name: "Sweden", value: 0.62e12, category: "Country", asOf: "2024", flag: "🇸🇪" },
  { name: "Argentina", value: 0.6e12, category: "Country", asOf: "2024", flag: "🇦🇷" },
  { name: "Ireland", value: 0.56e12, category: "Country", asOf: "2024", flag: "🇮🇪" },
  { name: "Thailand", value: 0.55e12, category: "Country", asOf: "2024", flag: "🇹🇭" },
  { name: "Israel", value: 0.55e12, category: "Country", asOf: "2024", flag: "🇮🇱" },
  { name: "UAE", value: 0.55e12, category: "Country", asOf: "2024", flag: "🇦🇪" },
  { name: "Singapore", value: 0.53e12, category: "Country", asOf: "2024", flag: "🇸🇬" },
  { name: "Norway", value: 0.5e12, category: "Country", asOf: "2024", flag: "🇳🇴" },
  { name: "Vietnam", value: 0.47e12, category: "Country", asOf: "2024", flag: "🇻🇳" },
  { name: "Philippines", value: 0.47e12, category: "Country", asOf: "2024", flag: "🇵🇭" },
  { name: "Bangladesh", value: 0.45e12, category: "Country", asOf: "2024", flag: "🇧🇩" },
  { name: "Malaysia", value: 0.44e12, category: "Country", asOf: "2024", flag: "🇲🇾" },
  { name: "Denmark", value: 0.42e12, category: "Country", asOf: "2024", flag: "🇩🇰" },
  { name: "Hong Kong", value: 0.41e12, category: "Country", asOf: "2024", flag: "🇭🇰" },
  { name: "South Africa", value: 0.4e12, category: "Country", asOf: "2024", flag: "🇿🇦" },
  { name: "Egypt", value: 0.38e12, category: "Country", asOf: "2024", flag: "🇪🇬" },
  { name: "Pakistan", value: 0.37e12, category: "Country", asOf: "2024", flag: "🇵🇰" },
  { name: "Chile", value: 0.34e12, category: "Country", asOf: "2024", flag: "🇨🇱" },
  { name: "Czechia", value: 0.35e12, category: "Country", asOf: "2024", flag: "🇨🇿" },
  { name: "Finland", value: 0.3e12, category: "Country", asOf: "2024", flag: "🇫🇮" },
  { name: "Portugal", value: 0.29e12, category: "Country", asOf: "2024", flag: "🇵🇹" },
  { name: "Peru", value: 0.27e12, category: "Country", asOf: "2024", flag: "🇵🇪" },
  { name: "New Zealand", value: 0.25e12, category: "Country", asOf: "2024", flag: "🇳🇿" },
  { name: "Nigeria", value: 0.25e12, category: "Country", asOf: "2024", flag: "🇳🇬" },
  { name: "Greece", value: 0.24e12, category: "Country", asOf: "2024", flag: "🇬🇷" },
  { name: "Hungary", value: 0.22e12, category: "Country", asOf: "2024", flag: "🇭🇺" },
  { name: "Luxembourg", value: 0.092e12, category: "Country", asOf: "2024", flag: "🇱🇺" },
  { name: "Iceland", value: 0.033e12, category: "Country", asOf: "2024", flag: "🇮🇸" },

  // ── US states — GDP, 2024 (approx, USD) ──
  { name: "California (US state)", value: 3.9e12, category: "US State", asOf: "2024" },
  { name: "Texas (US state)", value: 2.6e12, category: "US State", asOf: "2024" },
  { name: "New York (US state)", value: 2.2e12, category: "US State", asOf: "2024" },
  { name: "Florida (US state)", value: 1.7e12, category: "US State", asOf: "2024" },
  { name: "Illinois (US state)", value: 1.1e12, category: "US State", asOf: "2024" },
  { name: "Pennsylvania (US state)", value: 0.96e12, category: "US State", asOf: "2024" },
  { name: "Ohio (US state)", value: 0.92e12, category: "US State", asOf: "2024" },
  { name: "Georgia (US state)", value: 0.84e12, category: "US State", asOf: "2024" },
  { name: "Washington (US state)", value: 0.83e12, category: "US State", asOf: "2024" },
  { name: "New Jersey (US state)", value: 0.82e12, category: "US State", asOf: "2024" },
  { name: "North Carolina (US state)", value: 0.79e12, category: "US State", asOf: "2024" },
  { name: "Massachusetts (US state)", value: 0.78e12, category: "US State", asOf: "2024" },
  { name: "Virginia (US state)", value: 0.72e12, category: "US State", asOf: "2024" },
  { name: "Michigan (US state)", value: 0.65e12, category: "US State", asOf: "2024" },
  { name: "Colorado (US state)", value: 0.53e12, category: "US State", asOf: "2024" },

  // ── Chinese provinces — GDP, 2024 (approx, converted to USD) ──
  { name: "Guangdong (province)", value: 1.98e12, category: "CN Province", asOf: "2024" },
  { name: "Jiangsu (province)", value: 1.93e12, category: "CN Province", asOf: "2024" },
  { name: "Shandong (province)", value: 1.39e12, category: "CN Province", asOf: "2024" },
  { name: "Zhejiang (province)", value: 1.27e12, category: "CN Province", asOf: "2024" },
  { name: "Sichuan (province)", value: 0.9e12, category: "CN Province", asOf: "2024" },
  { name: "Henan (province)", value: 0.88e12, category: "CN Province", asOf: "2024" },
  { name: "Hubei (province)", value: 0.84e12, category: "CN Province", asOf: "2024" },
  { name: "Fujian (province)", value: 0.81e12, category: "CN Province", asOf: "2024" },
  { name: "Shanghai (city)", value: 0.76e12, category: "CN Province", asOf: "2024" },
  { name: "Hunan (province)", value: 0.74e12, category: "CN Province", asOf: "2024" },

  // ── Companies — market cap, approx 2026-05 (USD) ──
  { name: "Nvidia", value: 3.4e12, category: "Company", asOf: "2026-05" },
  { name: "Apple", value: 3.3e12, category: "Company", asOf: "2026-05" },
  { name: "Microsoft", value: 3.3e12, category: "Company", asOf: "2026-05" },
  { name: "Alphabet (Google)", value: 2.3e12, category: "Company", asOf: "2026-05" },
  { name: "Amazon", value: 2.3e12, category: "Company", asOf: "2026-05" },
  { name: "Saudi Aramco", value: 1.8e12, category: "Company", asOf: "2026-05" },
  { name: "Meta (Facebook)", value: 1.5e12, category: "Company", asOf: "2026-05" },
  { name: "Tesla", value: 1.1e12, category: "Company", asOf: "2026-05" },
  { name: "Broadcom", value: 1.1e12, category: "Company", asOf: "2026-05" },
  { name: "TSMC", value: 1.0e12, category: "Company", asOf: "2026-05" },
  { name: "Berkshire Hathaway", value: 1.0e12, category: "Company", asOf: "2026-05" },
  { name: "Eli Lilly", value: 0.85e12, category: "Company", asOf: "2026-05" },
  { name: "Walmart", value: 0.75e12, category: "Company", asOf: "2026-05" },
  { name: "JPMorgan Chase", value: 0.68e12, category: "Company", asOf: "2026-05" },
  { name: "Visa", value: 0.62e12, category: "Company", asOf: "2026-05" },
  { name: "Tencent", value: 0.5e12, category: "Company", asOf: "2026-05" },
  { name: "ExxonMobil", value: 0.5e12, category: "Company", asOf: "2026-05" },
  { name: "Oracle", value: 0.5e12, category: "Company", asOf: "2026-05" },
  { name: "Mastercard", value: 0.45e12, category: "Company", asOf: "2026-05" },
  { name: "Costco", value: 0.42e12, category: "Company", asOf: "2026-05" },
  { name: "Netflix", value: 0.4e12, category: "Company", asOf: "2026-05" },
  { name: "Procter & Gamble", value: 0.39e12, category: "Company", asOf: "2026-05" },
  { name: "Johnson & Johnson", value: 0.38e12, category: "Company", asOf: "2026-05" },
  { name: "Samsung", value: 0.38e12, category: "Company", asOf: "2026-05" },
  { name: "Home Depot", value: 0.38e12, category: "Company", asOf: "2026-05" },
  { name: "Bank of America", value: 0.32e12, category: "Company", asOf: "2026-05" },
  { name: "Coca-Cola", value: 0.3e12, category: "Company", asOf: "2026-05" },
  { name: "Toyota", value: 0.3e12, category: "Company", asOf: "2026-05" },
  { name: "McDonald's", value: 0.21e12, category: "Company", asOf: "2026-05" },
  { name: "Nike", value: 0.11e12, category: "Company", asOf: "2026-05" },

  // ── Sports teams — valuation, approx 2025 (USD) ──
  { name: "Dallas Cowboys (NFL)", value: 11e9, category: "Sports Team", asOf: "2025" },
  { name: "Golden State Warriors (NBA)", value: 9.1e9, category: "Sports Team", asOf: "2025" },
  { name: "New York Knicks (NBA)", value: 8.3e9, category: "Sports Team", asOf: "2025" },
  { name: "Los Angeles Rams (NFL)", value: 8.0e9, category: "Sports Team", asOf: "2025" },
  { name: "New England Patriots (NFL)", value: 8.0e9, category: "Sports Team", asOf: "2025" },
  { name: "New York Yankees (MLB)", value: 7.9e9, category: "Sports Team", asOf: "2025" },
  { name: "Los Angeles Dodgers (MLB)", value: 7.7e9, category: "Sports Team", asOf: "2025" },
  { name: "Los Angeles Lakers (NBA)", value: 7.1e9, category: "Sports Team", asOf: "2025" },
  { name: "Real Madrid (soccer)", value: 6.6e9, category: "Sports Team", asOf: "2025" },
  { name: "Manchester United (soccer)", value: 6.6e9, category: "Sports Team", asOf: "2025" },
  { name: "Chicago Bulls (NBA)", value: 5.8e9, category: "Sports Team", asOf: "2025" },
  { name: "FC Barcelona (soccer)", value: 5.6e9, category: "Sports Team", asOf: "2025" },
  { name: "Bayern Munich (soccer)", value: 5.6e9, category: "Sports Team", asOf: "2025" },
  { name: "Liverpool (soccer)", value: 5.4e9, category: "Sports Team", asOf: "2025" },
  { name: "Manchester City (soccer)", value: 5.1e9, category: "Sports Team", asOf: "2025" },
];

// Deck 2:GDP per capita(人均 GDP,单独量级,不能和总额混)
const PER_CAPITA_ITEMS: DeckItem[] = [
  { name: "Luxembourg", value: 135000, category: "Country", asOf: "2024", flag: "🇱🇺" },
  { name: "Ireland", value: 106000, category: "Country", asOf: "2024", flag: "🇮🇪" },
  { name: "Switzerland", value: 99000, category: "Country", asOf: "2024", flag: "🇨🇭" },
  { name: "Singapore", value: 89000, category: "Country", asOf: "2024", flag: "🇸🇬" },
  { name: "Norway", value: 87000, category: "Country", asOf: "2024", flag: "🇳🇴" },
  { name: "United States", value: 86000, category: "Country", asOf: "2024", flag: "🇺🇸" },
  { name: "Iceland", value: 85000, category: "Country", asOf: "2024", flag: "🇮🇸" },
  { name: "Denmark", value: 71000, category: "Country", asOf: "2024", flag: "🇩🇰" },
  { name: "Netherlands", value: 68000, category: "Country", asOf: "2024", flag: "🇳🇱" },
  { name: "Australia", value: 66000, category: "Country", asOf: "2024", flag: "🇦🇺" },
  { name: "UAE", value: 49000, category: "Country", asOf: "2024", flag: "🇦🇪" },
  { name: "Germany", value: 55000, category: "Country", asOf: "2024", flag: "🇩🇪" },
  { name: "Canada", value: 54000, category: "Country", asOf: "2024", flag: "🇨🇦" },
  { name: "United Kingdom", value: 52000, category: "Country", asOf: "2024", flag: "🇬🇧" },
  { name: "France", value: 47000, category: "Country", asOf: "2024", flag: "🇫🇷" },
  { name: "Japan", value: 33000, category: "Country", asOf: "2024", flag: "🇯🇵" },
  { name: "South Korea", value: 36000, category: "Country", asOf: "2024", flag: "🇰🇷" },
  { name: "Italy", value: 40000, category: "Country", asOf: "2024", flag: "🇮🇹" },
  { name: "Spain", value: 36000, category: "Country", asOf: "2024", flag: "🇪🇸" },
  { name: "Saudi Arabia", value: 33000, category: "Country", asOf: "2024", flag: "🇸🇦" },
  { name: "Portugal", value: 28000, category: "Country", asOf: "2024", flag: "🇵🇹" },
  { name: "Greece", value: 23000, category: "Country", asOf: "2024", flag: "🇬🇷" },
  { name: "Poland", value: 23000, category: "Country", asOf: "2024", flag: "🇵🇱" },
  { name: "Chile", value: 17000, category: "Country", asOf: "2024", flag: "🇨🇱" },
  { name: "China", value: 13000, category: "Country", asOf: "2024", flag: "🇨🇳" },
  { name: "Mexico", value: 14000, category: "Country", asOf: "2024", flag: "🇲🇽" },
  { name: "Brazil", value: 11000, category: "Country", asOf: "2024", flag: "🇧🇷" },
  { name: "Turkey", value: 15000, category: "Country", asOf: "2024", flag: "🇹🇷" },
  { name: "South Africa", value: 6500, category: "Country", asOf: "2024", flag: "🇿🇦" },
  { name: "Indonesia", value: 5000, category: "Country", asOf: "2024", flag: "🇮🇩" },
  { name: "Vietnam", value: 4700, category: "Country", asOf: "2024", flag: "🇻🇳" },
  { name: "Philippines", value: 4100, category: "Country", asOf: "2024", flag: "🇵🇭" },
  { name: "India", value: 2700, category: "Country", asOf: "2024", flag: "🇮🇳" },
  { name: "Nigeria", value: 1600, category: "Country", asOf: "2024", flag: "🇳🇬" },
  { name: "Pakistan", value: 1500, category: "Country", asOf: "2024", flag: "🇵🇰" },
  { name: "Bangladesh", value: 2600, category: "Country", asOf: "2024", flag: "🇧🇩" },
];

export const DECKS: DeckDef[] = [
  {
    slug: "which-is-worth-more",
    name: "Which Is Worth More?",
    emoji: "💰",
    title: "Which Is Worth More? — Higher or Lower Money Game (Free)",
    metaDescription:
      "Free Higher or Lower money game. Guess which is worth more: countries by GDP, companies by market cap, US states, Chinese provinces and sports teams. Build your streak, no sign-up.",
    h1: "Which Is Worth More?",
    intro:
      "Two cards, one question: is the second one worth more or less? Compare countries, companies, US states, Chinese provinces and sports teams — all in US dollars. How long can your streak go?",
    keywords: [
      "higher or lower game",
      "which is worth more",
      "guess the gdp game",
      "company market cap game",
      "country vs company net worth",
      "money guessing game",
    ],
    howTo: [
      "Look at the value shown on the left card.",
      "Decide whether the right card is worth MORE (higher) or LESS (lower).",
      "Guess right to keep your streak going; one wrong guess ends the run.",
    ],
    body: "WorthMore is a Higher or Lower game played with real money values. Every card is something with a dollar figure attached: a country's annual GDP, a big company's market capitalization, a US state or Chinese province's economic output, or a famous sports team's valuation. Because everything is measured in the same unit — US dollars — you can compare wildly different things, like whether Real Madrid is worth more than the country of Iceland, or whether Nvidia is worth more than the GDP of Canada. Values are approximate snapshots from public sources (World Bank, IMF, company market caps, Forbes team valuations) and are labeled with the year they are from. The goal is simple: build the longest streak you can, then share it and challenge a friend to beat it.",
    valueLabel: "total value (USD)",
    faq: [
      {
        q: "Where do the numbers come from?",
        a: "Country and state/province figures are nominal GDP from public sources like the World Bank and IMF. Company figures are market capitalization, and sports teams use Forbes-style valuations. All values are approximate snapshots and are labeled with the year they are from.",
      },
      {
        q: "Why compare a company to a country?",
        a: "Because they are all measured in US dollars, you can cross-compare them. That is the fun part — a single big company can be worth more than the entire annual output of a small country.",
      },
      {
        q: "Are the values exact?",
        a: "No. Money values change constantly, so we use rounded, approximate snapshots for a consistent and fast game. They are accurate enough to play with but should not be used as a financial reference.",
      },
      {
        q: "Is it free? Do I need an account?",
        a: "Completely free, no sign-up. Your best streak is saved locally in your browser.",
      },
    ],
    items: WORTH_MORE_ITEMS,
  },
  {
    slug: "gdp-per-capita-higher-or-lower",
    name: "GDP Per Capita: Higher or Lower",
    emoji: "🧑‍🤝‍🧑",
    title: "GDP Per Capita Higher or Lower — Guess the Richer Country (Free)",
    metaDescription:
      "Free Higher or Lower game for GDP per capita. Guess which country has a higher income per person. Build your streak, no sign-up, instant play.",
    h1: "GDP Per Capita: Higher or Lower",
    intro:
      "Forget total size — this is about income per person. Guess which country has the higher GDP per capita and build the longest streak you can.",
    keywords: [
      "gdp per capita game",
      "richest countries per capita",
      "higher or lower countries",
      "income per person quiz",
      "guess the gdp per capita",
    ],
    howTo: [
      "Look at the GDP per capita shown on the left card.",
      "Decide whether the right country's GDP per capita is higher or lower.",
      "Keep guessing right to grow your streak; one miss ends the run.",
    ],
    body: "This is the per-person version of the money game. Instead of total GDP — where big countries always win — GDP per capita divides a country's output by its population, so small, wealthy nations like Luxembourg, Ireland and Switzerland rise to the top while large economies can sit surprisingly low. It is a great way to build intuition about which countries are 'rich' on a per-person basis versus simply large. Figures are approximate nominal GDP per capita for 2024 from public sources, rounded for a clean, fast game.",
    valueLabel: "GDP per capita (USD)",
    faq: [
      {
        q: "What is GDP per capita?",
        a: "It is a country's total economic output (GDP) divided by its population — a rough measure of average income or output per person.",
      },
      {
        q: "Why isn't the USA or China number one?",
        a: "Because per capita divides by population. Small, wealthy countries like Luxembourg top this list even though their total economies are far smaller than the USA or China.",
      },
      {
        q: "Are the figures exact?",
        a: "No. They are rounded approximate snapshots for 2024, intended for fun rather than as a financial reference.",
      },
    ],
    items: PER_CAPITA_ITEMS,
  },
];

export function getDeck(slug: string): DeckDef | undefined {
  return DECKS.find((d) => d.slug === slug);
}

export function relatedDecks(slug: string): DeckDef[] {
  return DECKS.filter((d) => d.slug !== slug);
}
