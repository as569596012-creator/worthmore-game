import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import SiteScripts from "@/components/SiteScripts";
import { websiteJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Higher or Lower Money Game`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={websiteJsonLd()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SiteScripts />
      </body>
    </html>
  );
}
