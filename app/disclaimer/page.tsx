import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Disclaimer`,
  description: `Terms of use and disclaimer for ${SITE_NAME}. Values are approximate snapshots for entertainment only.`,
  path: "/disclaimer/",
});

export default function DisclaimerPage() {
  return (
    <article className="prose-tool mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Disclaimer</h1>
      <p className="mt-4">
        {SITE_NAME} is provided free of charge for entertainment. The numbers used in our games —
        GDP, market capitalisations, team valuations and similar figures — are
        <strong> approximate snapshots</strong> drawn from public sources and rounded for a fast,
        consistent game.
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">Not a financial reference</h2>
      <p className="mt-3">
        Money values change constantly. The figures here may be out of date and should never be
        used for investment, academic, or any decision-making purpose. Each value is labelled with
        the year it is from to make this clear.
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">No liability</h2>
      <p className="mt-3">
        We are not liable for any loss, cost, or damage arising from reliance on the figures or
        results shown in these games.
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">Football &amp; World Cup content</h2>
      <p className="mt-3">
        Our football games use approximate player and national-team market values
        (Transfermarkt-style estimates) converted to US dollars and rounded for entertainment.
        {" "}
        {SITE_NAME} is an independent project and is <strong>not affiliated with, endorsed by, or
        associated with FIFA, the FIFA World Cup, Transfermarkt, or any club, league or national
        association</strong>. &quot;World Cup&quot; and related names are referenced descriptively
        only.
      </p>
      <h2 className="mt-8 text-xl font-bold text-gray-900">Trademarks &amp; external links</h2>
      <p className="mt-3">
        Country, company, club, team and player names are the property of their respective owners
        and are used here for identification only. Some pages may contain ads or links to
        third-party sites; we are not responsible for their content or practices.
      </p>
    </article>
  );
}
