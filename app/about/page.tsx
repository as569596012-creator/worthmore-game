import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, AUTHOR_NAME, AUTHOR_PROFILE_URL } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `About ${SITE_NAME}`,
  description: `Learn who builds ${SITE_NAME} and how these free Higher or Lower money games work.`,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <article className="prose-tool mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">About {SITE_NAME}</h1>
      <p className="mt-4">
        {SITE_NAME} is a collection of free, fast Higher or Lower games built around real money
        values. Compare countries by GDP, companies by market value, and sports teams by their
        valuation — all measured in US dollars so you can pit a football club against a small
        country and see which wins.
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">Why we built it</h2>
      <p className="mt-3">
        We love quick, addictive browser games you can play in seconds and share in one tap. No
        downloads, no sign-up, no waiting — just two cards and one question: higher or lower?
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">Where the data comes from</h2>
      <p className="mt-3">
        Figures are approximate snapshots from public sources: GDP from organisations like the
        World Bank and IMF, company market capitalisations, and Forbes-style sports team
        valuations. Each card is labelled with the year its value is from. Money values change
        constantly, so we round them for a consistent, fast game rather than as a financial
        reference.
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">Who runs this site</h2>
      <p className="mt-3">
        {SITE_NAME} is built and maintained by {AUTHOR_NAME}.
        {AUTHOR_PROFILE_URL ? (
          <>
            {" "}
            More about the author{" "}
            <a className="text-brand-700 underline" href={AUTHOR_PROFILE_URL} rel="noopener noreferrer">
              here
            </a>
            .
          </>
        ) : null}
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">How we make money</h2>
      <p className="mt-3">
        The games are free to play. To cover hosting and development, some pages display ads. This
        never changes the gameplay or what the games cost you.
      </p>
    </article>
  );
}
