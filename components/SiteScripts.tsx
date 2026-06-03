import Script from "next/script";
import { ADSENSE_PUBLISHER_ID, GA4_ID, PLAUSIBLE_DOMAIN } from "@/lib/site";

// 根据 .env 是否配置,按需注入第三方脚本。全部留空时不加载任何外部脚本(本地开发干净、首屏更快)。
export default function SiteScripts() {
  return (
    <>
      {ADSENSE_PUBLISHER_ID && (
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
        />
      )}

      {PLAUSIBLE_DOMAIN && (
        <Script
          id="plausible"
          defer
          strategy="afterInteractive"
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        />
      )}

      {GA4_ID && (
        <>
          <Script
            id="ga4-src"
            async
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
