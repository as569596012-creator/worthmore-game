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
  | "Sports Team"
  | "Football Player"
  | "National Team";

export interface DeckItem {
  name: string;
  value: number; // 以该 deck 的单位计(本站均为美元)
  category: Category;
  asOf: string; // 数据时间,如 "2024" / "2026-05"
  code?: string; // flagcdn 代码:国家用 ISO alpha-2(jp/de),美国州用 us-ca
  domain?: string; // logo.dev 用的域名(公司/球队/俱乐部),如 apple.com
  flagCode?: string; // 球员国籍国旗(flagcdn 码),与俱乐部队徽 domain 同时显示
  subtitle?: string; // 卡片副标题(覆盖默认的 category·metric·asOf),如 "Real Madrid · France"
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
  valueLabel: string; // 卡片上数值的说明,如 "value in US dollars"
  metric?: string; // deck 级指标覆盖(如人均 GDP);留空则按类别推断(见 metricLabel)
  pickPrompt?: string; // 两卡上方的引导语;留空用默认 "Tap the card you think is worth more"
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

// flagcdn:真实旗帜图(国家 + 美国州)。免费、挂在 Cloudflare。
export function flagUrl(item: DeckItem): string | null {
  return item.code ? `https://flagcdn.com/w160/${item.code}.png` : null;
}

// logo.dev:真实公司/球队 logo。需要 publishable token(没填则返回 null,走字母牌)。
export function logoUrl(item: DeckItem, token: string): string | null {
  if (!item.domain || !token) return null;
  return `https://img.logo.dev/${item.domain}?token=${token}&size=160&format=png`;
}

// 字母牌:从名字取首字母(去掉括号后缀),作为无图时的兜底视觉。
export function monogram(name: string): string {
  const base = name.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

// 字母牌背景色:名字哈希到一个柔和色相,保证同名同色、整体协调。
export function monogramColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 45%)`;
}

// 每个类别数值到底是"什么钱":GDP 是年度产出(流量),市值/估值是存量。
// 标清楚避免把"年度 GDP"误解成"国家总财富"。
const CATEGORY_METRIC: Record<Category, string> = {
  Country: "annual GDP",
  "US State": "annual GDP",
  "CN Province": "annual GDP",
  Company: "market cap",
  "Sports Team": "team value",
  "Football Player": "market value",
  "National Team": "squad market value",
};

// deck 有 metric 则全局用它(如人均 GDP);否则按 item 类别推断。
export function metricLabel(deck: DeckDef, item: DeckItem): string {
  return deck.metric || CATEGORY_METRIC[item.category];
}

// ─────────────────────────────────────────────────────────────────────────────
// 题库数据
// ─────────────────────────────────────────────────────────────────────────────

// Deck 1:Which is worth more?(美元总额混合池:国家GDP + 美国州GDP + 中国省GDP + 公司市值 + 球队估值)
const WORTH_MORE_ITEMS: DeckItem[] = [
  // ── Countries — nominal GDP, 2024 (approx, USD) ──
  { name: "United States", value: 29.2e12, category: "Country", asOf: "2024", code: "us" },
  { name: "China", value: 18.3e12, category: "Country", asOf: "2024", code: "cn" },
  { name: "Germany", value: 4.7e12, category: "Country", asOf: "2024", code: "de" },
  { name: "Japan", value: 4.07e12, category: "Country", asOf: "2024", code: "jp" },
  { name: "India", value: 3.9e12, category: "Country", asOf: "2024", code: "in" },
  { name: "United Kingdom", value: 3.6e12, category: "Country", asOf: "2024", code: "gb" },
  { name: "France", value: 3.17e12, category: "Country", asOf: "2024", code: "fr" },
  { name: "Italy", value: 2.38e12, category: "Country", asOf: "2024", code: "it" },
  { name: "Brazil", value: 2.33e12, category: "Country", asOf: "2024", code: "br" },
  { name: "Canada", value: 2.21e12, category: "Country", asOf: "2024", code: "ca" },
  { name: "Russia", value: 2.18e12, category: "Country", asOf: "2024", code: "ru" },
  { name: "Mexico", value: 1.85e12, category: "Country", asOf: "2024", code: "mx" },
  { name: "South Korea", value: 1.87e12, category: "Country", asOf: "2024", code: "kr" },
  { name: "Australia", value: 1.79e12, category: "Country", asOf: "2024", code: "au" },
  { name: "Spain", value: 1.73e12, category: "Country", asOf: "2024", code: "es" },
  { name: "Indonesia", value: 1.4e12, category: "Country", asOf: "2024", code: "id" },
  { name: "Turkey", value: 1.34e12, category: "Country", asOf: "2024", code: "tr" },
  { name: "Netherlands", value: 1.22e12, category: "Country", asOf: "2024", code: "nl" },
  { name: "Saudi Arabia", value: 1.1e12, category: "Country", asOf: "2024", code: "sa" },
  { name: "Switzerland", value: 0.94e12, category: "Country", asOf: "2024", code: "ch" },
  { name: "Poland", value: 0.86e12, category: "Country", asOf: "2024", code: "pl" },
  { name: "Belgium", value: 0.66e12, category: "Country", asOf: "2024", code: "be" },
  { name: "Sweden", value: 0.62e12, category: "Country", asOf: "2024", code: "se" },
  { name: "Argentina", value: 0.6e12, category: "Country", asOf: "2024", code: "ar" },
  { name: "Ireland", value: 0.56e12, category: "Country", asOf: "2024", code: "ie" },
  { name: "Thailand", value: 0.55e12, category: "Country", asOf: "2024", code: "th" },
  { name: "Israel", value: 0.55e12, category: "Country", asOf: "2024", code: "il" },
  { name: "UAE", value: 0.55e12, category: "Country", asOf: "2024", code: "ae" },
  { name: "Singapore", value: 0.53e12, category: "Country", asOf: "2024", code: "sg" },
  { name: "Norway", value: 0.5e12, category: "Country", asOf: "2024", code: "no" },
  { name: "Vietnam", value: 0.47e12, category: "Country", asOf: "2024", code: "vn" },
  { name: "Philippines", value: 0.47e12, category: "Country", asOf: "2024", code: "ph" },
  { name: "Bangladesh", value: 0.45e12, category: "Country", asOf: "2024", code: "bd" },
  { name: "Malaysia", value: 0.44e12, category: "Country", asOf: "2024", code: "my" },
  { name: "Denmark", value: 0.42e12, category: "Country", asOf: "2024", code: "dk" },
  { name: "Hong Kong", value: 0.41e12, category: "Country", asOf: "2024", code: "hk" },
  { name: "South Africa", value: 0.4e12, category: "Country", asOf: "2024", code: "za" },
  { name: "Egypt", value: 0.38e12, category: "Country", asOf: "2024", code: "eg" },
  { name: "Pakistan", value: 0.37e12, category: "Country", asOf: "2024", code: "pk" },
  { name: "Chile", value: 0.34e12, category: "Country", asOf: "2024", code: "cl" },
  { name: "Czechia", value: 0.35e12, category: "Country", asOf: "2024", code: "cz" },
  { name: "Finland", value: 0.3e12, category: "Country", asOf: "2024", code: "fi" },
  { name: "Portugal", value: 0.29e12, category: "Country", asOf: "2024", code: "pt" },
  { name: "Peru", value: 0.27e12, category: "Country", asOf: "2024", code: "pe" },
  { name: "New Zealand", value: 0.25e12, category: "Country", asOf: "2024", code: "nz" },
  { name: "Nigeria", value: 0.25e12, category: "Country", asOf: "2024", code: "ng" },
  { name: "Greece", value: 0.24e12, category: "Country", asOf: "2024", code: "gr" },
  { name: "Hungary", value: 0.22e12, category: "Country", asOf: "2024", code: "hu" },
  { name: "Luxembourg", value: 0.092e12, category: "Country", asOf: "2024", code: "lu" },
  { name: "Iceland", value: 0.033e12, category: "Country", asOf: "2024", code: "is" },

  // ── US states — GDP, 2024 (approx, USD).flagcdn 支持州旗 us-xx ──
  { name: "California (US state)", value: 3.9e12, category: "US State", asOf: "2024", code: "us-ca" },
  { name: "Texas (US state)", value: 2.6e12, category: "US State", asOf: "2024", code: "us-tx" },
  { name: "New York (US state)", value: 2.2e12, category: "US State", asOf: "2024", code: "us-ny" },
  { name: "Florida (US state)", value: 1.7e12, category: "US State", asOf: "2024", code: "us-fl" },
  { name: "Illinois (US state)", value: 1.1e12, category: "US State", asOf: "2024", code: "us-il" },
  { name: "Pennsylvania (US state)", value: 0.96e12, category: "US State", asOf: "2024", code: "us-pa" },
  { name: "Ohio (US state)", value: 0.92e12, category: "US State", asOf: "2024", code: "us-oh" },
  { name: "Georgia (US state)", value: 0.84e12, category: "US State", asOf: "2024", code: "us-ga" },
  { name: "Washington (US state)", value: 0.83e12, category: "US State", asOf: "2024", code: "us-wa" },
  { name: "New Jersey (US state)", value: 0.82e12, category: "US State", asOf: "2024", code: "us-nj" },
  { name: "North Carolina (US state)", value: 0.79e12, category: "US State", asOf: "2024", code: "us-nc" },
  { name: "Massachusetts (US state)", value: 0.78e12, category: "US State", asOf: "2024", code: "us-ma" },
  { name: "Virginia (US state)", value: 0.72e12, category: "US State", asOf: "2024", code: "us-va" },
  { name: "Michigan (US state)", value: 0.65e12, category: "US State", asOf: "2024", code: "us-mi" },
  { name: "Colorado (US state)", value: 0.53e12, category: "US State", asOf: "2024", code: "us-co" },

  // ── Chinese provinces — GDP, 2024 (approx, converted to USD).省份无官方旗帜,走字母牌 ──
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

  // ── Companies — market cap, approx 2026-05 (USD).domain 供 logo.dev ──
  { name: "Nvidia", value: 3.4e12, category: "Company", asOf: "2026-05", domain: "nvidia.com" },
  { name: "Apple", value: 3.3e12, category: "Company", asOf: "2026-05", domain: "apple.com" },
  { name: "Microsoft", value: 3.3e12, category: "Company", asOf: "2026-05", domain: "microsoft.com" },
  { name: "Alphabet (Google)", value: 2.3e12, category: "Company", asOf: "2026-05", domain: "google.com" },
  { name: "Amazon", value: 2.3e12, category: "Company", asOf: "2026-05", domain: "amazon.com" },
  { name: "Saudi Aramco", value: 1.8e12, category: "Company", asOf: "2026-05", domain: "aramco.com" },
  { name: "Meta (Facebook)", value: 1.5e12, category: "Company", asOf: "2026-05", domain: "meta.com" },
  { name: "Tesla", value: 1.1e12, category: "Company", asOf: "2026-05", domain: "tesla.com" },
  { name: "Broadcom", value: 1.1e12, category: "Company", asOf: "2026-05", domain: "broadcom.com" },
  { name: "TSMC", value: 1.0e12, category: "Company", asOf: "2026-05", domain: "tsmc.com" },
  { name: "Berkshire Hathaway", value: 1.0e12, category: "Company", asOf: "2026-05", domain: "berkshirehathaway.com" },
  { name: "Eli Lilly", value: 0.85e12, category: "Company", asOf: "2026-05", domain: "lilly.com" },
  { name: "Walmart", value: 0.75e12, category: "Company", asOf: "2026-05", domain: "walmart.com" },
  { name: "JPMorgan Chase", value: 0.68e12, category: "Company", asOf: "2026-05", domain: "jpmorganchase.com" },
  { name: "Visa", value: 0.62e12, category: "Company", asOf: "2026-05", domain: "visa.com" },
  { name: "Tencent", value: 0.5e12, category: "Company", asOf: "2026-05", domain: "tencent.com" },
  { name: "ExxonMobil", value: 0.5e12, category: "Company", asOf: "2026-05", domain: "exxonmobil.com" },
  { name: "Oracle", value: 0.5e12, category: "Company", asOf: "2026-05", domain: "oracle.com" },
  { name: "Mastercard", value: 0.45e12, category: "Company", asOf: "2026-05", domain: "mastercard.com" },
  { name: "Costco", value: 0.42e12, category: "Company", asOf: "2026-05", domain: "costco.com" },
  { name: "Netflix", value: 0.4e12, category: "Company", asOf: "2026-05", domain: "netflix.com" },
  { name: "Procter & Gamble", value: 0.39e12, category: "Company", asOf: "2026-05", domain: "pg.com" },
  { name: "Johnson & Johnson", value: 0.38e12, category: "Company", asOf: "2026-05", domain: "jnj.com" },
  { name: "Samsung", value: 0.38e12, category: "Company", asOf: "2026-05", domain: "samsung.com" },
  { name: "Home Depot", value: 0.38e12, category: "Company", asOf: "2026-05", domain: "homedepot.com" },
  { name: "Bank of America", value: 0.32e12, category: "Company", asOf: "2026-05", domain: "bankofamerica.com" },
  { name: "Coca-Cola", value: 0.3e12, category: "Company", asOf: "2026-05", domain: "coca-cola.com" },
  { name: "Toyota", value: 0.3e12, category: "Company", asOf: "2026-05", domain: "toyota.com" },
  { name: "McDonald's", value: 0.21e12, category: "Company", asOf: "2026-05", domain: "mcdonalds.com" },
  { name: "Nike", value: 0.11e12, category: "Company", asOf: "2026-05", domain: "nike.com" },

  // ── Sports teams — valuation, approx 2025 (USD).有干净官网域名的填 domain,其余走字母牌 ──
  { name: "Dallas Cowboys (NFL)", value: 11e9, category: "Sports Team", asOf: "2025", domain: "dallascowboys.com" },
  { name: "Golden State Warriors (NBA)", value: 9.1e9, category: "Sports Team", asOf: "2025" },
  { name: "New York Knicks (NBA)", value: 8.3e9, category: "Sports Team", asOf: "2025" },
  { name: "Los Angeles Rams (NFL)", value: 8.0e9, category: "Sports Team", asOf: "2025", domain: "therams.com" },
  { name: "New England Patriots (NFL)", value: 8.0e9, category: "Sports Team", asOf: "2025", domain: "patriots.com" },
  { name: "New York Yankees (MLB)", value: 7.9e9, category: "Sports Team", asOf: "2025" },
  { name: "Los Angeles Dodgers (MLB)", value: 7.7e9, category: "Sports Team", asOf: "2025" },
  { name: "Los Angeles Lakers (NBA)", value: 7.1e9, category: "Sports Team", asOf: "2025" },
  { name: "Real Madrid (soccer)", value: 6.6e9, category: "Sports Team", asOf: "2025", domain: "realmadrid.com" },
  { name: "Manchester United (soccer)", value: 6.6e9, category: "Sports Team", asOf: "2025", domain: "manutd.com" },
  { name: "Chicago Bulls (NBA)", value: 5.8e9, category: "Sports Team", asOf: "2025" },
  { name: "FC Barcelona (soccer)", value: 5.6e9, category: "Sports Team", asOf: "2025", domain: "fcbarcelona.com" },
  { name: "Bayern Munich (soccer)", value: 5.6e9, category: "Sports Team", asOf: "2025", domain: "fcbayern.com" },
  { name: "Liverpool (soccer)", value: 5.4e9, category: "Sports Team", asOf: "2025", domain: "liverpoolfc.com" },
  { name: "Manchester City (soccer)", value: 5.1e9, category: "Sports Team", asOf: "2025", domain: "mancity.com" },
];

// Deck 2:GDP per capita(人均 GDP,单独量级,不能和总额混)
const PER_CAPITA_ITEMS: DeckItem[] = [
  { name: "Luxembourg", value: 135000, category: "Country", asOf: "2024", code: "lu" },
  { name: "Ireland", value: 106000, category: "Country", asOf: "2024", code: "ie" },
  { name: "Switzerland", value: 99000, category: "Country", asOf: "2024", code: "ch" },
  { name: "Singapore", value: 89000, category: "Country", asOf: "2024", code: "sg" },
  { name: "Norway", value: 87000, category: "Country", asOf: "2024", code: "no" },
  { name: "United States", value: 86000, category: "Country", asOf: "2024", code: "us" },
  { name: "Iceland", value: 85000, category: "Country", asOf: "2024", code: "is" },
  { name: "Denmark", value: 71000, category: "Country", asOf: "2024", code: "dk" },
  { name: "Netherlands", value: 68000, category: "Country", asOf: "2024", code: "nl" },
  { name: "Australia", value: 66000, category: "Country", asOf: "2024", code: "au" },
  { name: "UAE", value: 49000, category: "Country", asOf: "2024", code: "ae" },
  { name: "Germany", value: 55000, category: "Country", asOf: "2024", code: "de" },
  { name: "Canada", value: 54000, category: "Country", asOf: "2024", code: "ca" },
  { name: "United Kingdom", value: 52000, category: "Country", asOf: "2024", code: "gb" },
  { name: "France", value: 47000, category: "Country", asOf: "2024", code: "fr" },
  { name: "Japan", value: 33000, category: "Country", asOf: "2024", code: "jp" },
  { name: "South Korea", value: 36000, category: "Country", asOf: "2024", code: "kr" },
  { name: "Italy", value: 40000, category: "Country", asOf: "2024", code: "it" },
  { name: "Spain", value: 36000, category: "Country", asOf: "2024", code: "es" },
  { name: "Saudi Arabia", value: 33000, category: "Country", asOf: "2024", code: "sa" },
  { name: "Portugal", value: 28000, category: "Country", asOf: "2024", code: "pt" },
  { name: "Greece", value: 23000, category: "Country", asOf: "2024", code: "gr" },
  { name: "Poland", value: 23000, category: "Country", asOf: "2024", code: "pl" },
  { name: "Chile", value: 17000, category: "Country", asOf: "2024", code: "cl" },
  { name: "China", value: 13000, category: "Country", asOf: "2024", code: "cn" },
  { name: "Mexico", value: 14000, category: "Country", asOf: "2024", code: "mx" },
  { name: "Brazil", value: 11000, category: "Country", asOf: "2024", code: "br" },
  { name: "Turkey", value: 15000, category: "Country", asOf: "2024", code: "tr" },
  { name: "South Africa", value: 6500, category: "Country", asOf: "2024", code: "za" },
  { name: "Indonesia", value: 5000, category: "Country", asOf: "2024", code: "id" },
  { name: "Vietnam", value: 4700, category: "Country", asOf: "2024", code: "vn" },
  { name: "Philippines", value: 4100, category: "Country", asOf: "2024", code: "ph" },
  { name: "India", value: 2700, category: "Country", asOf: "2024", code: "in" },
  { name: "Nigeria", value: 1600, category: "Country", asOf: "2024", code: "ng" },
  { name: "Pakistan", value: 1500, category: "Country", asOf: "2024", code: "pk" },
  { name: "Bangladesh", value: 2600, category: "Country", asOf: "2024", code: "bd" },
];

// Deck 3:World Cup player market value(单个球员身价池,USD 估值,~2026-06 快照)
// 单位统一为美元、量级统一(~$8M–$200M),便于 Higher/Lower 比较。
// domain=俱乐部域名(队徽),flagCode=国籍国旗;两者在卡片上同时显示。
const wcp = (
  name: string,
  value: number,
  club: string,
  country: string,
  domain: string,
  flagCode: string,
): DeckItem => ({
  name,
  value,
  category: "Football Player",
  asOf: "2026-06",
  domain,
  flagCode,
  subtitle: `${club} · ${country}`,
});

const WC_PLAYER_ITEMS: DeckItem[] = [
  wcp("Jude Bellingham", 200e6, "Real Madrid", "England", "realmadrid.com", "gb-eng"),
  wcp("Erling Haaland", 200e6, "Manchester City", "Norway", "mancity.com", "no"),
  wcp("Vinícius Júnior", 190e6, "Real Madrid", "Brazil", "realmadrid.com", "br"),
  wcp("Kylian Mbappé", 180e6, "Real Madrid", "France", "realmadrid.com", "fr"),
  wcp("Lamine Yamal", 180e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Jamal Musiala", 150e6, "Bayern Munich", "Germany", "fcbayern.com", "de"),
  wcp("Florian Wirtz", 150e6, "Liverpool", "Germany", "liverpoolfc.com", "de"),
  wcp("Bukayo Saka", 140e6, "Arsenal", "England", "arsenal.com", "gb-eng"),
  wcp("Pedri", 140e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Cole Palmer", 130e6, "Chelsea", "England", "chelseafc.com", "gb-eng"),
  wcp("Phil Foden", 130e6, "Manchester City", "England", "mancity.com", "gb-eng"),
  wcp("Rodri", 130e6, "Manchester City", "Spain", "mancity.com", "es"),
  wcp("Federico Valverde", 130e6, "Real Madrid", "Uruguay", "realmadrid.com", "uy"),
  wcp("Victor Osimhen", 120e6, "Galatasaray", "Nigeria", "galatasaray.org", "ng"),
  wcp("Khvicha Kvaratskhelia", 120e6, "Paris Saint-Germain", "Georgia", "psg.fr", "ge"),
  wcp("Declan Rice", 120e6, "Arsenal", "England", "arsenal.com", "gb-eng"),
  wcp("Alexander Isak", 120e6, "Liverpool", "Sweden", "liverpoolfc.com", "se"),
  wcp("Martin Ødegaard", 110e6, "Arsenal", "Norway", "arsenal.com", "no"),
  wcp("Bruno Guimarães", 110e6, "Newcastle United", "Brazil", "nufc.co.uk", "br"),
  wcp("Julián Álvarez", 110e6, "Atlético Madrid", "Argentina", "atleticodemadrid.com", "ar"),
  wcp("Gavi", 110e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Rafael Leão", 110e6, "AC Milan", "Portugal", "acmilan.com", "pt"),
  wcp("Rodrygo", 100e6, "Real Madrid", "Brazil", "realmadrid.com", "br"),
  wcp("Aurélien Tchouaméni", 100e6, "Real Madrid", "France", "realmadrid.com", "fr"),
  wcp("Eduardo Camavinga", 100e6, "Real Madrid", "France", "realmadrid.com", "fr"),
  wcp("Vitinha", 90e6, "Paris Saint-Germain", "Portugal", "psg.fr", "pt"),
  wcp("Désiré Doué", 90e6, "Paris Saint-Germain", "France", "psg.fr", "fr"),
  wcp("Bradley Barcola", 88e6, "Paris Saint-Germain", "France", "psg.fr", "fr"),
  wcp("Moisés Caicedo", 90e6, "Chelsea", "Ecuador", "chelseafc.com", "ec"),
  wcp("Joško Gvardiol", 90e6, "Manchester City", "Croatia", "mancity.com", "hr"),
  wcp("Raphinha", 90e6, "Barcelona", "Brazil", "fcbarcelona.com", "br"),
  wcp("Pau Cubarsí", 90e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Lautaro Martínez", 90e6, "Inter", "Argentina", "inter.it", "ar"),
  wcp("Harry Kane", 90e6, "Bayern Munich", "England", "fcbayern.com", "gb-eng"),
  wcp("Michael Olise", 90e6, "Bayern Munich", "France", "fcbayern.com", "fr"),
  wcp("João Neves", 85e6, "Paris Saint-Germain", "Portugal", "psg.fr", "pt"),
  wcp("Nuno Mendes", 80e6, "Paris Saint-Germain", "Portugal", "psg.fr", "pt"),
  wcp("Ousmane Dembélé", 80e6, "Paris Saint-Germain", "France", "psg.fr", "fr"),
  wcp("Enzo Fernández", 80e6, "Chelsea", "Argentina", "chelseafc.com", "ar"),
  wcp("Nicolò Barella", 80e6, "Inter", "Italy", "inter.it", "it"),
  wcp("Xavi Simons", 80e6, "Tottenham Hotspur", "Netherlands", "tottenhamhotspur.com", "nl"),
  wcp("William Saliba", 80e6, "Arsenal", "France", "arsenal.com", "fr"),
  wcp("Cody Gakpo", 75e6, "Liverpool", "Netherlands", "liverpoolfc.com", "nl"),
  wcp("Ryan Gravenberch", 75e6, "Liverpool", "Netherlands", "liverpoolfc.com", "nl"),
  wcp("Dominik Szoboszlai", 75e6, "Liverpool", "Hungary", "liverpoolfc.com", "hu"),
  wcp("Dani Olmo", 75e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Jules Koundé", 75e6, "Barcelona", "France", "fcbarcelona.com", "fr"),
  wcp("Gabriel Magalhães", 75e6, "Arsenal", "Brazil", "arsenal.com", "br"),
  wcp("Alessandro Bastoni", 75e6, "Inter", "Italy", "inter.it", "it"),
  wcp("Kenan Yıldız", 75e6, "Juventus", "Turkey", "juventus.com", "tr"),
  wcp("Kai Havertz", 75e6, "Arsenal", "Germany", "arsenal.com", "de"),
  wcp("Viktor Gyökeres", 75e6, "Arsenal", "Sweden", "arsenal.com", "se"),
  wcp("Marcus Thuram", 70e6, "Inter", "France", "inter.it", "fr"),
  wcp("Jérémy Doku", 70e6, "Manchester City", "Belgium", "mancity.com", "be"),
  wcp("Alexis Mac Allister", 70e6, "Liverpool", "Argentina", "liverpoolfc.com", "ar"),
  wcp("Savinho", 70e6, "Manchester City", "Brazil", "mancity.com", "br"),
  wcp("Arda Güler", 70e6, "Real Madrid", "Turkey", "realmadrid.com", "tr"),
  wcp("Trent Alexander-Arnold", 70e6, "Real Madrid", "England", "realmadrid.com", "gb-eng"),
  wcp("Micky van de Ven", 65e6, "Tottenham Hotspur", "Netherlands", "tottenhamhotspur.com", "nl"),
  wcp("Achraf Hakimi", 65e6, "Paris Saint-Germain", "Morocco", "psg.fr", "ma"),
  wcp("Eberechi Eze", 65e6, "Arsenal", "England", "arsenal.com", "gb-eng"),
  wcp("Serhou Guirassy", 65e6, "Borussia Dortmund", "Guinea", "bvb.de", "gn"),
  wcp("Dušan Vlahović", 65e6, "Juventus", "Serbia", "juventus.com", "rs"),
  wcp("Khéphren Thuram", 65e6, "Juventus", "France", "juventus.com", "fr"),
  wcp("Martín Zubimendi", 65e6, "Arsenal", "Spain", "arsenal.com", "es"),
  wcp("Brahim Díaz", 60e6, "Real Madrid", "Morocco", "realmadrid.com", "ma"),
  wcp("Endrick", 60e6, "Real Madrid", "Brazil", "realmadrid.com", "br"),
  wcp("Fermín López", 60e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Frenkie de Jong", 60e6, "Barcelona", "Netherlands", "fcbarcelona.com", "nl"),
  wcp("Fabián Ruiz", 60e6, "Paris Saint-Germain", "Spain", "psg.fr", "es"),
  wcp("Rúben Dias", 60e6, "Manchester City", "Portugal", "mancity.com", "pt"),
  wcp("Dayot Upamecano", 60e6, "Bayern Munich", "France", "fcbayern.com", "fr"),
  wcp("Alphonso Davies", 60e6, "Bayern Munich", "Canada", "fcbayern.com", "ca"),
  wcp("Takefusa Kubo", 60e6, "Real Sociedad", "Japan", "realsociedad.eus", "jp"),
  wcp("Estêvão", 60e6, "Chelsea", "Brazil", "chelseafc.com", "br"),
  wcp("Federico Dimarco", 60e6, "Inter", "Italy", "inter.it", "it"),
  wcp("Gabriel Martinelli", 55e6, "Arsenal", "Brazil", "arsenal.com", "br"),
  wcp("Cristian Romero", 55e6, "Tottenham Hotspur", "Argentina", "tottenhamhotspur.com", "ar"),
  wcp("Ibrahima Konaté", 55e6, "Liverpool", "France", "liverpoolfc.com", "fr"),
  wcp("Levi Colwill", 55e6, "Chelsea", "England", "chelseafc.com", "gb-eng"),
  wcp("Anthony Gordon", 55e6, "Newcastle United", "England", "nufc.co.uk", "gb-eng"),
  wcp("Mohammed Kudus", 55e6, "Tottenham Hotspur", "Ghana", "tottenhamhotspur.com", "gh"),
  wcp("Ademola Lookman", 55e6, "Atalanta", "Nigeria", "atalanta.it", "ng"),
  wcp("Nicolas Jackson", 55e6, "Chelsea", "Senegal", "chelseafc.com", "sn"),
  wcp("João Pedro", 55e6, "Chelsea", "Brazil", "chelseafc.com", "br"),
  wcp("Kaoru Mitoma", 50e6, "Brighton", "Japan", "brightonandhovealbion.com", "jp"),
  wcp("Joshua Kimmich", 50e6, "Bayern Munich", "Germany", "fcbayern.com", "de"),
  wcp("Bruno Fernandes", 50e6, "Manchester United", "Portugal", "manutd.com", "pt"),
  wcp("Pedro Neto", 50e6, "Chelsea", "Portugal", "chelseafc.com", "pt"),
  wcp("Gonçalo Ramos", 50e6, "Paris Saint-Germain", "Portugal", "psg.fr", "pt"),
  wcp("Éder Militão", 50e6, "Real Madrid", "Brazil", "realmadrid.com", "br"),
  wcp("Jonathan David", 50e6, "Juventus", "Canada", "juventus.com", "ca"),
  wcp("Randal Kolo Muani", 50e6, "Juventus", "France", "juventus.com", "fr"),
  wcp("Amadou Onana", 50e6, "Aston Villa", "Belgium", "avfc.co.uk", "be"),
  wcp("Ollie Watkins", 50e6, "Aston Villa", "England", "avfc.co.uk", "gb-eng"),
  wcp("Morgan Rogers", 50e6, "Aston Villa", "England", "avfc.co.uk", "gb-eng"),
  wcp("Mikel Oyarzabal", 45e6, "Real Sociedad", "Spain", "realsociedad.eus", "es"),
  wcp("Mikel Merino", 45e6, "Arsenal", "Spain", "arsenal.com", "es"),
  wcp("Marc Guéhi", 45e6, "Crystal Palace", "England", "cpfc.co.uk", "gb-eng"),
  wcp("Pape Matar Sarr", 45e6, "Tottenham Hotspur", "Senegal", "tottenhamhotspur.com", "sn"),
  wcp("Victor Boniface", 45e6, "Bayer Leverkusen", "Nigeria", "bayer04.de", "ng"),
  wcp("Manu Koné", 45e6, "AS Roma", "France", "asroma.com", "fr"),
  wcp("Christopher Nkunku", 45e6, "AC Milan", "France", "acmilan.com", "fr"),
  wcp("Franco Mastantuono", 45e6, "Real Madrid", "Argentina", "realmadrid.com", "ar"),
  wcp("Christian Pulisic", 45e6, "AC Milan", "United States", "acmilan.com", "us"),
  wcp("Gregor Kobel", 45e6, "Borussia Dortmund", "Switzerland", "bvb.de", "ch"),
  wcp("Ferran Torres", 45e6, "Barcelona", "Spain", "fcbarcelona.com", "es"),
  wcp("Karim Adeyemi", 45e6, "Borussia Dortmund", "Germany", "bvb.de", "de"),
  wcp("Hakan Çalhanoğlu", 40e6, "Inter", "Turkey", "inter.it", "tr"),
  wcp("Santiago Giménez", 40e6, "AC Milan", "Mexico", "acmilan.com", "mx"),
  wcp("Mike Maignan", 40e6, "AC Milan", "France", "acmilan.com", "fr"),
  wcp("Gianluigi Donnarumma", 40e6, "Manchester City", "Italy", "mancity.com", "it"),
  wcp("Denzel Dumfries", 38e6, "Inter", "Netherlands", "inter.it", "nl"),
  wcp("Folarin Balogun", 38e6, "AS Monaco", "United States", "asmonaco.com", "us"),
  wcp("Youri Tielemans", 38e6, "Aston Villa", "Belgium", "avfc.co.uk", "be"),
  wcp("Jarrod Bowen", 38e6, "West Ham", "England", "whufc.com", "gb-eng"),
  wcp("Scott McTominay", 45e6, "Napoli", "Scotland", "sscnapoli.it", "gb-sct"),
  wcp("Theo Hernández", 35e6, "Al-Hilal", "France", "alhilal.com", "fr"),
  wcp("Leroy Sané", 35e6, "Galatasaray", "Germany", "galatasaray.org", "de"),
  wcp("Tyler Adams", 30e6, "Bournemouth", "United States", "afcb.co.uk", "us"),
  wcp("Antonee Robinson", 30e6, "Fulham", "United States", "fulhamfc.com", "us"),
  wcp("Edson Álvarez", 28e6, "West Ham", "Mexico", "whufc.com", "mx"),
  wcp("Weston McKennie", 25e6, "Juventus", "United States", "juventus.com", "us"),
  wcp("Kevin De Bruyne", 25e6, "Napoli", "Belgium", "sscnapoli.it", "be"),
  wcp("Romelu Lukaku", 22e6, "Napoli", "Belgium", "sscnapoli.it", "be"),
  wcp("Antonio Rüdiger", 22e6, "Real Madrid", "Germany", "realmadrid.com", "de"),
  wcp("Thibaut Courtois", 22e6, "Real Madrid", "Belgium", "realmadrid.com", "be"),
  wcp("Lionel Messi", 20e6, "Inter Miami", "Argentina", "intermiamicf.com", "ar"),
  wcp("Neymar", 18e6, "Santos", "Brazil", "santosfc.com.br", "br"),
  wcp("Emiliano Martínez", 18e6, "Aston Villa", "Argentina", "avfc.co.uk", "ar"),
  wcp("Alisson", 20e6, "Liverpool", "Brazil", "liverpoolfc.com", "br"),
  wcp("Robert Lewandowski", 15e6, "Barcelona", "Poland", "fcbarcelona.com", "pl"),
  wcp("Heung-min Son", 15e6, "Los Angeles FC", "South Korea", "lafc.com", "kr"),
  wcp("Cristiano Ronaldo", 15e6, "Al-Nassr", "Portugal", "alnassr.sa", "pt"),
  wcp("Álvaro Morata", 12e6, "Como", "Spain", "comofootball.com", "es"),
  wcp("Sadio Mané", 14e6, "Al-Nassr", "Senegal", "alnassr.sa", "sn"),
  wcp("Wataru Endo", 12e6, "Liverpool", "Japan", "liverpoolfc.com", "jp"),
  wcp("Luka Modrić", 8e6, "AC Milan", "Croatia", "acmilan.com", "hr"),
  wcp("Virgil van Dijk", 30e6, "Liverpool", "Netherlands", "liverpoolfc.com", "nl"),
  wcp("Mohamed Salah", 40e6, "Liverpool", "Egypt", "liverpoolfc.com", "eg"),
  wcp("Nico Williams", 75e6, "Athletic Club", "Spain", "athletic-club.eus", "es"),
  wcp("Warren Zaïre-Emery", 70e6, "Paris Saint-Germain", "France", "psg.fr", "fr"),
  wcp("Jeremie Frimpong", 50e6, "Liverpool", "Netherlands", "liverpoolfc.com", "nl"),
  wcp("Nico Schlotterbeck", 55e6, "Borussia Dortmund", "Germany", "bvb.de", "de"),
  wcp("Diogo Costa", 45e6, "Porto", "Portugal", "fcporto.pt", "pt"),
  wcp("Adam Wharton", 45e6, "Crystal Palace", "England", "cpfc.co.uk", "gb-eng"),
];

// Deck 4:World Cup national team squad value(国家队总身价池,USD 估值)
const wct = (name: string, value: number, code: string): DeckItem => ({
  name,
  value,
  category: "National Team",
  asOf: "2026-06",
  code,
});

const WC_TEAM_ITEMS: DeckItem[] = [
  wct("England", 1.5e9, "gb-eng"),
  wct("Spain", 1.45e9, "es"),
  wct("France", 1.4e9, "fr"),
  wct("Brazil", 1.1e9, "br"),
  wct("Portugal", 1.05e9, "pt"),
  wct("Germany", 1.0e9, "de"),
  wct("Netherlands", 950e6, "nl"),
  wct("Argentina", 750e6, "ar"),
  wct("Italy", 700e6, "it"),
  wct("Belgium", 500e6, "be"),
  wct("Norway", 420e6, "no"),
  wct("Uruguay", 380e6, "uy"),
  wct("Colombia", 380e6, "co"),
  wct("Morocco", 380e6, "ma"),
  wct("Croatia", 320e6, "hr"),
  wct("Japan", 320e6, "jp"),
  wct("United States", 320e6, "us"),
  wct("Austria", 320e6, "at"),
  wct("Ecuador", 320e6, "ec"),
  wct("Switzerland", 290e6, "ch"),
  wct("Denmark", 300e6, "dk"),
  wct("Serbia", 300e6, "rs"),
  wct("Senegal", 300e6, "sn"),
  wct("Nigeria", 300e6, "ng"),
  wct("Turkey", 300e6, "tr"),
  wct("Sweden", 300e6, "se"),
  wct("Ukraine", 280e6, "ua"),
  wct("Mexico", 250e6, "mx"),
  wct("Ivory Coast", 250e6, "ci"),
  wct("Algeria", 230e6, "dz"),
  wct("Ghana", 220e6, "gh"),
  wct("Canada", 220e6, "ca"),
  wct("Poland", 220e6, "pl"),
  wct("South Korea", 200e6, "kr"),
  wct("Greece", 200e6, "gr"),
  wct("Czechia", 200e6, "cz"),
  wct("Egypt", 200e6, "eg"),
  wct("Cameroon", 200e6, "cm"),
  wct("Scotland", 150e6, "gb-sct"),
  wct("Hungary", 150e6, "hu"),
  wct("Paraguay", 130e6, "py"),
  wct("Wales", 120e6, "gb-wls"),
  wct("Iran", 90e6, "ir"),
  wct("Peru", 80e6, "pe"),
  wct("Australia", 70e6, "au"),
  wct("Saudi Arabia", 60e6, "sa"),
  wct("Qatar", 40e6, "qa"),
  wct("New Zealand", 30e6, "nz"),
];

export const DECKS: DeckDef[] = [
  {
    slug: "world-cup-player-value-higher-or-lower",
    name: "World Cup Player Value: Higher or Lower",
    emoji: "⚽",
    title: "World Cup 2026 Player Value — Higher or Lower Football Game (Free)",
    metaDescription:
      "Free Higher or Lower football game for the 2026 World Cup. Guess which player has the higher market value — Mbappé, Bellingham, Haaland, Vinícius and 150+ stars. Build your streak, no sign-up.",
    h1: "World Cup Player Value: Higher or Lower",
    intro:
      "Two footballers, one question: who is worth more? Guess which player has the higher transfer market value across 150+ World Cup 2026 stars — and build the longest streak you can.",
    keywords: [
      "world cup player value game",
      "higher or lower football",
      "guess the player market value",
      "football transfer value game",
      "world cup 2026 game",
      "most valuable footballers",
    ],
    howTo: [
      "Look at the market value shown on the left player card.",
      "Tap whichever player you think has the higher market value.",
      "Guess right to keep your streak going; one wrong guess ends the run.",
    ],
    pickPrompt: "Tap the player you think is worth more",
    body: "World Cup Player Value is a Higher or Lower game built around the stars of the 2026 World Cup. Every card is a footballer with an estimated transfer market value in US dollars — from generational talents like Jude Bellingham, Kylian Mbappé, Erling Haaland, Lamine Yamal and Vinícius Júnior down to veterans and rising prospects. Each card shows the player's club crest and national flag, so you can guess based on form, age, club and country. Values are approximate snapshots from public sources (Transfermarkt-style market values, converted to USD) and are labelled with the month they are from; market values move constantly with form, age and transfers. The goal is simple: build the longest streak you can, then share it and challenge a friend before kickoff. WorthMore is an independent game and is not affiliated with FIFA, the World Cup or Transfermarkt.",
    valueLabel: "estimated market value (USD)",
    metric: "market value",
    faq: [
      {
        q: "Where do the player values come from?",
        a: "They are approximate transfer market values from public sources (Transfermarkt-style estimates), converted to US dollars and rounded for a fast game. Each card is labelled with the month it is from. Market values change constantly.",
      },
      {
        q: "Which players are included?",
        a: "Over 150 of the most valuable players expected at the 2026 World Cup, spanning Europe's top leagues plus stars from the Americas, Asia, Africa and the Middle East.",
      },
      {
        q: "Are the values official?",
        a: "No. They are rounded approximate estimates for entertainment only, not an official valuation, and should not be used as a transfer or financial reference.",
      },
      {
        q: "Is it free? Do I need an account?",
        a: "Completely free, no sign-up. Your best streak is saved locally in your browser.",
      },
    ],
    items: WC_PLAYER_ITEMS,
  },
  {
    slug: "world-cup-team-value-higher-or-lower",
    name: "National Team Value: Higher or Lower",
    emoji: "🏆",
    title: "World Cup 2026 National Team Value — Higher or Lower Game (Free)",
    metaDescription:
      "Free Higher or Lower game for the 2026 World Cup. Guess which national team has the more valuable squad — England, France, Brazil, Argentina and 40+ more. Build your streak, no sign-up.",
    h1: "National Team Value: Higher or Lower",
    intro:
      "Two national teams, one question: whose squad is worth more? Guess which country has the higher total squad market value across the leading World Cup 2026 nations.",
    keywords: [
      "national team value game",
      "most valuable national teams",
      "world cup 2026 squad value",
      "higher or lower countries football",
      "guess the squad value",
    ],
    howTo: [
      "Look at the total squad value shown on the left card.",
      "Tap whichever national team you think has the higher total squad value.",
      "Keep guessing right to grow your streak; one miss ends the run.",
    ],
    pickPrompt: "Tap the national team worth more",
    body: "This is the team version of the game. Instead of single players, each card is a national team with the combined market value of its squad in US dollars — so deep, star-studded squads like England, Spain, France and Brazil sit at the top, while smaller footballing nations rank lower. It is a fun way to feel the talent gaps heading into the 2026 World Cup. Figures are approximate snapshots from public sources, converted to USD and rounded; they feature the leading national teams, many of which are at the 2026 World Cup. WorthMore is an independent game and is not affiliated with FIFA, the World Cup or Transfermarkt.",
    valueLabel: "total squad value (USD)",
    metric: "squad market value",
    faq: [
      {
        q: "How is a national team's value calculated?",
        a: "It is the approximate combined transfer market value of the players in the squad, from public sources, converted to US dollars and rounded. Deeper squads with more in-form stars are worth more.",
      },
      {
        q: "Why is a small country sometimes worth a lot?",
        a: "Because squad value depends on individual players, not population. A nation with two or three €100m+ stars can outrank a larger country with a less valuable squad.",
      },
      {
        q: "Are these official World Cup figures?",
        a: "No. They are rounded approximate estimates for entertainment only and are not affiliated with FIFA or any official body.",
      },
    ],
    items: WC_TEAM_ITEMS,
  },
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
      "Tap whichever card you think is worth more.",
      "Guess right to keep your streak going; one wrong guess ends the run.",
    ],
    pickPrompt: "Tap the card you think is worth more",
    body: "WorthMore is a Higher or Lower game played with real money values. Every card is something with a dollar figure attached: a country's annual GDP, a big company's market capitalization, a US state or Chinese province's economic output, or a famous sports team's valuation. Because everything is measured in the same unit — US dollars — you can compare wildly different things, like whether Real Madrid is worth more than the country of Iceland, or whether Nvidia is worth more than the GDP of Canada. Values are approximate snapshots from public sources (World Bank, IMF, company market caps, Forbes team valuations) and are labeled with the year they are from. The goal is simple: build the longest streak you can, then share it and challenge a friend to beat it.",
    valueLabel: "value in US dollars",
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
      "Tap the country you think has the higher GDP per capita.",
      "Keep guessing right to grow your streak; one miss ends the run.",
    ],
    pickPrompt: "Tap the country with the higher GDP per capita",
    body: "This is the per-person version of the money game. Instead of total GDP — where big countries always win — GDP per capita divides a country's output by its population, so small, wealthy nations like Luxembourg, Ireland and Switzerland rise to the top while large economies can sit surprisingly low. It is a great way to build intuition about which countries are 'rich' on a per-person basis versus simply large. Figures are approximate nominal GDP per capita for 2024 from public sources, rounded for a clean, fast game.",
    valueLabel: "GDP per capita (USD)",
    metric: "GDP per capita",
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
