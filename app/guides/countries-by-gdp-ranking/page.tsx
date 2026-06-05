import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/guides";

const SLUG = "countries-by-gdp-ranking";
const guide = getGuide(SLUG)!;

export const metadata: Metadata = buildMetadata({
  title: guide.title,
  description: guide.metaDescription,
  path: `/guides/${SLUG}/`,
  keywords: guide.keywords,
});

const RANKING: { rank: number; country: string; gdp: string }[] = [
  { rank: 1, country: "United States", gdp: "$29.2 trillion" },
  { rank: 2, country: "China", gdp: "$18.3 trillion" },
  { rank: 3, country: "Germany", gdp: "$4.7 trillion" },
  { rank: 4, country: "Japan", gdp: "$4.1 trillion" },
  { rank: 5, country: "India", gdp: "$3.9 trillion" },
  { rank: 6, country: "United Kingdom", gdp: "$3.6 trillion" },
  { rank: 7, country: "France", gdp: "$3.2 trillion" },
  { rank: 8, country: "Italy", gdp: "$2.4 trillion" },
  { rank: 9, country: "Brazil", gdp: "$2.3 trillion" },
  { rank: 10, country: "Canada", gdp: "$2.2 trillion" },
  { rank: 11, country: "Russia", gdp: "$2.2 trillion" },
  { rank: 12, country: "South Korea", gdp: "$1.9 trillion" },
  { rank: 13, country: "Mexico", gdp: "$1.9 trillion" },
  { rank: 14, country: "Australia", gdp: "$1.8 trillion" },
  { rank: 15, country: "Spain", gdp: "$1.7 trillion" },
];

export default function Page() {
  return (
    <GuideLayout slug={SLUG}>
      <p>
        <strong>Quick answer:</strong> the United States has the world&apos;s largest economy at
        about $29 trillion, followed by China at roughly $18 trillion. No other country comes close
        — third-place Germany is under $5 trillion. Below is the ranking of the biggest economies by
        nominal GDP (approximate, 2024 figures).
      </p>

      <h2 className="text-xl font-bold text-gray-900">Top 15 countries by GDP</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-4 py-2 font-semibold">Country</th>
              <th className="px-4 py-2 font-semibold">Nominal GDP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RANKING.map((row) => (
              <tr key={row.rank} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{row.rank}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{row.country}</td>
                <td className="px-4 py-2 text-gray-700">{row.gdp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        Figures are approximate nominal GDP for 2024, rounded, from public sources such as the IMF
        and World Bank. Rankings shift slightly year to year.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Nominal GDP vs GDP per capita</h2>
      <p>
        This list ranks <strong>total</strong> output (nominal GDP), which rewards large
        populations — that is why India and Brazil rank highly despite lower average incomes. A very
        different list appears when you divide GDP by population to get{" "}
        <strong>GDP per capita</strong>: small, wealthy nations like Luxembourg, Ireland and
        Switzerland jump to the top, while giants like China and India fall far down. Both are
        &quot;correct&quot; — they just answer different questions: total economic size versus income
        per person.
      </p>

      <h2 className="text-xl font-bold text-gray-900">The US vs China gap</h2>
      <p>
        The two largest economies are in a league of their own. Together the US and China account
        for roughly 40% of global GDP. The gap between them has narrowed over two decades but
        remains large in nominal terms — partly because GDP measured in US dollars is sensitive to
        exchange rates. Measured by purchasing power parity (PPP), which adjusts for local prices,
        China&apos;s economy is often ranked as the world&apos;s largest, which is why you&apos;ll
        sometimes see conflicting headlines.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Test your knowledge</h2>
      <p>
        Think you know how these stack up? The fun is in the surprises — is a single trillion-dollar
        company worth more than an entire mid-sized country? Find out in{" "}
        <Link href="/which-is-worth-more/" className="text-brand-700 underline">
          Which Is Worth More?
        </Link>
        , or switch to income per person in{" "}
        <Link href="/gdp-per-capita-higher-or-lower/" className="text-brand-700 underline">
          GDP Per Capita: Higher or Lower
        </Link>
        .
      </p>
    </GuideLayout>
  );
}
