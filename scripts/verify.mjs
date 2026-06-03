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
  { path: "/which-is-worth-more/", h1Includes: "Worth More" },
  { path: "/gdp-per-capita-higher-or-lower/", h1Includes: "Per Capita" },
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

  const higher = page.getByTestId("btn-higher");
  const lower = page.getByTestId("btn-lower");
  check("Higher / Lower 按钮存在", (await higher.count()) > 0 && (await lower.count()) > 0);

  // 点击 Higher,在揭示窗口内确认右卡数值被揭示
  await higher.click();
  await page.waitForTimeout(300);
  const rightVal = (await page.getByTestId("right-value").first().textContent())?.trim() || "";
  check("点击后揭示右卡数值", /\$/.test(rightVal), `"${rightVal}"`);

  // 等待结算:要么连胜推进(streak 仍在),要么游戏结束面板出现
  await page.waitForTimeout(1300);
  const hasStreak = (await page.getByTestId("streak").count()) > 0;
  const hasOver = (await page.getByTestId("game-over").count()) > 0;
  check("结算后状态有效(继续或结束)", hasStreak || hasOver, `streak=${hasStreak} over=${hasOver}`);

  await browser.close();
  server.close();

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
