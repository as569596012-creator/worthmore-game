# WorthMore — Higher or Lower 金钱猜大小游戏站

一个用 **Next.js 静态导出** 做的「Higher or Lower（猜大小）」网页小游戏站。玩法：给你两张卡片（国家 / 公司 / 美国州 / 中国省 / 球队，全部折算美元），猜右边比左边「值钱(Higher)」还是「不值(Lower)」，连续猜对建立连胜，猜错即结束。主打**免费 + 即开即玩 + 成绩可分享**。

> 这是「一人公司」打法的第三个项目，也是第一个**病毒/社交流量**型项目（前两个 PicCrush / CalcBarn 是常青 SEO 工具站）。核心打法见 [学习.md](学习.md) 与 [Google-Trends专题学习.md](Google-Trends专题学习.md)。

## 核心架构：通用引擎 + 可插拔题库(deck)

- **引擎通用**：答两卡 → 比数值 → 连胜/结束 → 生成可分享成绩卡。
- **每个游戏 = 注册表里的一条 deck**（题面文案 + SEO + 一份 `items` 数据集）。
- **换皮 = 加一个 deck**：蹭热门 IP/话题时新增一条数据集即可，引擎不动。
- 关键原则：**同一个 deck 内所有数值必须同单位、同量级池**（总额池里不能混人均 GDP）。

## 技术栈

- Next.js (App Router) + TypeScript + TailwindCSS
- `output: 'export'` 纯静态导出（产物在 `out/`，零服务器成本）
- 游戏逻辑、连胜存档（localStorage）、Canvas 成绩卡全部在浏览器完成

## 本地开发

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 产物在 out/
npm run serve:out    # 本地预览静态产物 http://localhost:4321
npm run verify       # 无头浏览器验证路由 + 游戏交互(需先 build)
```

## 配置

复制环境变量模板并填写：

```bash
Copy-Item .env.example .env.local   # PowerShell
```

上线前最重要：把 `NEXT_PUBLIC_SITE_URL` 改成真实域名（影响 canonical / sitemap / 分享卡水印）。
`ADSENSE`/`GA4`/`PLAUSIBLE` 留空时不加载任何外部脚本，广告位显示占位框。

## 如何新增一个游戏（换皮 / 蹭热点）

只改一个文件 + 加一个路由：

1. 在 [lib/decks.ts](lib/decks.ts) 的 `DECKS` 数组加一条 `DeckDef`（slug / 文案 / FAQ / `valueLabel` / `items`）。
2. 新建 `app/<slug>/page.tsx`，照抄现有 4 行模板。
3. `npm run build && npm run verify` 验证，提交，Cloudflare 自动部署。

> 数据是**静态快照**，每条带 `asOf` 标注时间；建议每 6–12 个月手动刷新一次数值。

## 部署（同 PicCrush / CalcBarn 流程）

- Cloudflare Pages：连接 GitHub 仓库 → Build command `npm run build` → Output directory `out`。
- 仓库含 `.node-version=20`（Cloudflare 默认 Node 18，Next 15 需要 20+）。

## 目录结构

```
app/                       路由(首页 / 游戏页 / 信任页)
components/
  HigherLowerClient.tsx    游戏主逻辑(两卡比大小 + 连胜 + Canvas 成绩卡)
  DeckPageView.tsx         游戏页布局 + JSON-LD
  Header/Footer/AdSlot/Faq/JsonLd/SiteScripts
lib/
  decks.ts                 题库注册表(玩法数据 + 文案 + formatMoney)
  site.ts / seo.ts         站点配置与结构化数据
scripts/
  gen-sitemap.mjs          构建前生成 sitemap.xml / robots.txt
  verify.mjs               无头浏览器验证
```
