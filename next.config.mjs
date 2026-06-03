/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯静态导出:产物在 out/,可直接丢到任何 CDN / Nginx / Cloudflare Pages
  output: "export",
  reactStrictMode: true,
  // 静态导出不能用 Next 的图片优化服务,关闭(本站基本不用位图,靠 emoji + canvas)
  images: {
    unoptimized: true,
  },
  // 让每个路由生成 /path/index.html,部署到静态服务器时 URL 更干净
  trailingSlash: true,
};

export default nextConfig;
