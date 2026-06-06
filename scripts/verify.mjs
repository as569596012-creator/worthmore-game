// 本机无头浏览器验证:启动静态服务器托管 out/,用 Playwright 检查
// 1) 各路由渲染 + JSON-LD 合法;2) SEO 文件;3) 游戏交互(揭示/连胜/游戏结束)。
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const ROOT = join(process.cwd(), "out");
const PORT = 4321;
const BASE = `http://localhost:${PORT}`;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

async function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  let full = join(ROOT, p);
  try {
    const s = await stat(full);
    if (s.isDirectory()) full = join(full, "index.html");
    return full;
  } catch {
    try {
      await stat(full + ".html");
      return full + ".html";
    } catch {
      try {
        const idx = join(full, "index.html");
        await stat(idx);
        return idx;
      } catch {
        return null;
      }
    }
  }
}

function startServer() {
  const server = createServer(async (req, res) => {
    const file = await resolveFile(req.url || "/");
    if (!file) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    try {
      const data = await readFile(file);
      res.setHeader("Content-Type", MIME[extname(file)] || "application/octet-stream");
      res.end(data);
    } catch {
      res.statusCode = 500;
      res.end("Server error");
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const ROUTES = [
  { path: "/", h1Includes: "Higher or Lower" },
  { path: "/guess-the-footballer/", h1Includes: "Guess the Footballer" },
  { path: "/world-cup-player-value-higher-or-lower/", h1Includes: "Player Value" },
  { path: "/world-cup-team-value-higher-or-lower/", h1Includes: "National Team Value" },
  { path: "/which-is-worth-more/", h1Includes: "Worth More" },
  { path: "/gdp-per-capita-higher-or-lower/", h1Includes: "Per Capita" },
  { path: "/guides/most-valuable-world-cup-2026-players/", h1Includes: "Most Valuable Players" },
  { path: "/guides/most-valuable-national-teams-2026/", h1Includes: "Most Valuable National Teams" },
  { path: "/about/", h1Includes: "About" },
  { path: "/contact/", h1Includes: "Contact" },
  { path: "/privacy/", h1Includes: "Privacy" },
  { path: "/disclaimer/", h1Includes: "Disclaimer" },
];

let failures = 0;
function check(name, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  if (!ok) failures++;
  console.log(`  [${mark}] ${name}${detail ? " — " + detail : ""}`);
}

async function main() {
  const server = await startServer();
  console.log(`Static server on ${BASE}\n`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  console.log("1) 路由渲染 + JSON-LD:");
  for (const route of ROUTES) {
    const resp = await page.goto(BASE + route.path, { waitUntil: "networkidle" });
    const status = resp?.status() ?? 0;
    const h1 = (await page.locator("h1").first().textContent())?.trim() || "";
    const ldNodes = await page.locator('script[type="application/ld+json"]').allTextContents();
    let ldValid = true;
    for (const txt of ldNodes) {
      try {
        JSON.parse(txt);
      } catch {
        ldValid = false;
      }
    }
    const ok = status === 200 && h1.includes(route.h1Includes) && ldValid;
    check(route.path, ok, `status=${status} h1="${h1.slice(0, 36)}" jsonld=${ldNodes.length}${ldValid ? "" : " INVALID"}`);
  }

  console.log("\n2) SEO 文件:");
  for (const f of ["/robots.txt", "/sitemap.xml", "/llms.txt"]) {
    const resp = await page.goto(BASE + f, { waitUntil: "load" });
    const body = await page.evaluate(() => document.body?.innerText || "");
    check(f, (resp?.status() ?? 0) === 200 && body.length > 10, `len=${body.length}`);
  }

  console.log("\n3) 游戏交互(which-is-worth-more):");
  await page.goto(BASE + "/which-is-worth-more/", { waitUntil: "networkidle" });

  const leftVal = (await page.getByTestId("left-value").first().textContent())?.trim() || "";
  check("左卡显示美元数值", /\$/.test(leftVal), `"${leftVal}"`);

  const cardLeft = page.getByTestId("card-left");
  const cardRight = page.getByTestId("card-right");
  check("左右卡片可点击", (await cardLeft.count()) > 0 && (await cardRight.count()) > 0);

  // 点击右卡,在揭示窗口内确认右卡数值被揭示
  await cardRight.click();
  await page.waitForTimeout(300);
  const rightVal = (await page.getByTestId("right-value").first().textContent())?.trim() || "";
  check("点击卡片后揭示右卡数值", /\$/.test(rightVal), `"${rightVal}"`);

  // 等待结算:要么连胜推进(streak 仍在),要么游戏结束面板出现
  await page.waitForTimeout(1300);
  const hasStreak = (await page.getByTestId("streak").count()) > 0;
  const hasOver = (await page.getByTestId("game-over").count()) > 0;
  check("结算后状态有效(继续或结束)", hasStreak || hasOver, `streak=${hasStreak} over=${hasOver}`);

  console.log("\n4) 退出确认拦截:");
  // 重新加载,反复点右卡直到答对一题(streak>0),再点 Header 主页链接应被拦截
  await page.goto(BASE + "/which-is-worth-more/", { waitUntil: "networkidle" });
  let streakNow = 0;
  for (let i = 0; i < 8 && streakNow === 0; i++) {
    await page.getByTestId("card-right").click();
    await page.waitForTimeout(1100);
    if ((await page.getByTestId("game-over").count()) > 0) {
      await page.getByTestId("play-again").click();
      await page.waitForTimeout(200);
      continue;
    }
    streakNow = Number((await page.getByTestId("streak").first().textContent()) || "0");
  }
  check("成功取得连胜(streak>0)用于触发拦截", streakNow > 0, `streak=${streakNow}`);

  // 点 Header 里的首页 logo 链接
  await page.locator('header a[href="/"]').first().click();
  await page.waitForTimeout(300);
  const modalShown = (await page.getByTestId("exit-modal").count()) > 0;
  const stillOnGame = page.url().includes("/which-is-worth-more");
  check("点击导航弹出退出确认且未跳转", modalShown && stillOnGame, `modal=${modalShown} url="${page.url().replace(BASE, "")}"`);

  // 点 "Leave anyway" 应放行跳转回首页
  if (modalShown) {
    await page.getByTestId("exit-leave").click();
    await page.waitForTimeout(500);
    check("Leave anyway 后跳转生效", !page.url().includes("/which-is-worth-more"), `url="${page.url().replace(BASE, "")}"`);
  }

  console.log("\n5) 猜球员游戏(guess-the-footballer):");
  await page.goto(BASE + "/guess-the-footballer/", { waitUntil: "networkidle" });
  const gpInput = page.getByTestId("gp-input");
  check("输入框存在", (await gpInput.count()) > 0);
  // 输入触发自动补全,点第一个候选提交一次猜测,确认出现猜测行
  await gpInput.fill("a");
  await page.waitForTimeout(300);
  const suggestCount = await page.getByTestId("gp-suggest").count();
  check("自动补全有候选", suggestCount > 0, `suggestions=${suggestCount}`);
  if (suggestCount > 0) {
    await page.getByTestId("gp-suggest").first().click();
    await page.waitForTimeout(300);
    const rows = await page.getByTestId("gp-guess-row").count();
    check("提交后出现猜测行(含线索)", rows > 0, `rows=${rows}`);
  }

  await browser.close();
  server.close();

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
