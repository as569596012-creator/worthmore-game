// 站点级配置。构建时从环境变量读取(NEXT_PUBLIC_ 前缀才能在浏览器端可用),
// 没有配置时用下面的默认值,保证本地开发与首次构建都能跑通。

function env(key: string, fallback: string): string {
  const v = process.env[key];
  return v && v.trim().length > 0 ? v.trim() : fallback;
}

// 站点正式域名(上线前在 .env / Cloudflare 环境变量里设成真实域名,例如 https://worthmore.app)
export const SITE_URL = env("NEXT_PUBLIC_SITE_URL", "https://worthmore.app").replace(/\/$/, "");

export const SITE_NAME = env("NEXT_PUBLIC_SITE_NAME", "WorthMore");

export const SITE_TAGLINE = env(
  "NEXT_PUBLIC_SITE_TAGLINE",
  "Higher or Lower, money edition. Guess which country, company or team is worth more — build the longest streak.",
);

export const SITE_DESCRIPTION = env(
  "NEXT_PUBLIC_SITE_DESCRIPTION",
  "Free Higher or Lower money game. Guess which is worth more — countries by GDP, companies by market cap, sports teams by value. No sign-up, instant play, share your streak.",
);

// E-E-A-T:真实署名,审广告与排名都看重
export const AUTHOR_NAME = env("NEXT_PUBLIC_AUTHOR_NAME", "The WorthMore Team");
export const AUTHOR_PROFILE_URL = env("NEXT_PUBLIC_AUTHOR_PROFILE_URL", "");

export const CONTACT_EMAIL = env("NEXT_PUBLIC_CONTACT_EMAIL", "hello@example.com");

// 变现 / 分析(留空则不会注入对应脚本)
export const ADSENSE_PUBLISHER_ID = env("NEXT_PUBLIC_ADSENSE_PUBLISHER_ID", ""); // ca-pub-xxxxxxxx
export const GA4_ID = env("NEXT_PUBLIC_GA4_ID", ""); // G-XXXXXXX
export const PLAUSIBLE_DOMAIN = env("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", "");

export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
