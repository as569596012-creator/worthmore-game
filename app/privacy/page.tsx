import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, CONTACT_EMAIL, ADSENSE_PUBLISHER_ID, GA4_ID } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy`,
  description: `How ${SITE_NAME} handles your data. The games run in your browser; we do not collect personal information.`,
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <article className="prose-tool mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>

      <h2 className="mt-8 text-xl font-bold text-gray-900">The games run in your browser</h2>
      <p className="mt-3">
        Every game on {SITE_NAME} runs entirely in your web browser. Your best streak is stored
        locally on your device (localStorage) and is never sent to or stored on our servers.
      </p>

      <h2 className="mt-8 text-xl font-bold text-gray-900">Information we collect</h2>
      <p className="mt-3">
        We do not require accounts and do not ask for personal information. We may collect
        anonymous, aggregated usage statistics (such as page views and which games are popular) to
        improve the site.
      </p>

      <h2 className="mt-8 text-xl font-bold text-gray-900">Cookies and third parties</h2>
      <p className="mt-3">
        {ADSENSE_PUBLISHER_ID
          ? "We use Google AdSense to display ads. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising via Google Ads Settings."
          : "We may display ads in the future; if we do, third-party vendors such as Google may use cookies to serve ads based on your visits to this and other sites."}
        {GA4_ID ? " We also use a privacy-conscious analytics tool to understand aggregate traffic." : ""}
      </p>

      <h2 className="mt-8 text-xl font-bold text-gray-900">Your choices</h2>
      <p className="mt-3">
        You can disable cookies in your browser settings and use browser controls to limit ad
        personalization. Clearing your browser storage will reset your saved streaks.
      </p>

      <h2 className="mt-8 text-xl font-bold text-gray-900">Contact</h2>
      <p className="mt-3">
        Questions about this policy? Email{" "}
        <a className="font-semibold text-brand-700 underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </article>
  );
}
