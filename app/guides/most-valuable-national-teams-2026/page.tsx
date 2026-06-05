import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/guides";

const SLUG = "most-valuable-national-teams-2026";
const guide = getGuide(SLUG)!;

export const metadata: Metadata = buildMetadata({
  title: guide.title,
  description: guide.metaDescription,
  path: `/guides/${SLUG}/`,
  keywords: guide.keywords,
});

const RANKING: { rank: number; team: string; value: string }[] = [
  { rank: 1, team: "England", value: "~$1.5bn" },
  { rank: 2, team: "Spain", value: "~$1.45bn" },
  { rank: 3, team: "France", value: "~$1.4bn" },
  { rank: 4, team: "Brazil", value: "~$1.1bn" },
  { rank: 5, team: "Portugal", value: "~$1.05bn" },
  { rank: 6, team: "Germany", value: "~$1.0bn" },
  { rank: 7, team: "Netherlands", value: "~$950m" },
  { rank: 8, team: "Argentina", value: "~$750m" },
  { rank: 9, team: "Italy", value: "~$700m" },
  { rank: 10, team: "Belgium", value: "~$500m" },
];

export default function Page() {
  return (
    <GuideLayout slug={SLUG}>
      <p>
        <strong>Quick answer:</strong> by total squad market value, England, Spain and France lead the
        way into the 2026 World Cup, each with squads worth well over a billion US dollars. Below is the
        top 10 national teams by combined squad value (approximate, mid-2026, in US dollars).
      </p>

      <h2 className="text-xl font-bold text-gray-900">Top 10 national teams by squad value</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-4 py-2 font-semibold">National team</th>
              <th className="px-4 py-2 font-semibold">Total squad value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RANKING.map((row) => (
              <tr key={row.rank} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{row.rank}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{row.team}</td>
                <td className="px-4 py-2 text-gray-700">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        Figures are approximate combined squad market values for mid-2026 from public sources, converted
        to US dollars and rounded. They feature the leading national teams, many of them at the 2026
        World Cup. WorthMore is not affiliated with FIFA or Transfermarkt.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Squad depth beats population</h2>
      <p>
        A national team&apos;s value comes from its individual players, not the size of the country.
        That is why England and Spain &mdash; stacked with in-form young stars across every position
        &mdash; top the list, while some larger nations sit far lower. A country with two or three
        $100m players can outrank a rival with a deeper but less star-heavy squad.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Value isn&apos;t destiny</h2>
      <p>
        Market value measures transfer worth, not tournament results. France, Spain and Brazil are
        usually among the favourites, but World Cups are decided over a few knockout games where form,
        injuries and a single moment matter more than a squad&apos;s price tag &mdash; which is exactly
        why upsets are so memorable.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Test your knowledge</h2>
      <p>
        Can you rank the squads by value? Try{" "}
        <Link href="/world-cup-team-value-higher-or-lower/" className="text-brand-700 underline">
          National Team Value: Higher or Lower
        </Link>
        , or go player-by-player in{" "}
        <Link
          href="/world-cup-player-value-higher-or-lower/"
          className="text-brand-700 underline"
        >
          World Cup Player Value: Higher or Lower
        </Link>
        .
      </p>
    </GuideLayout>
  );
}
