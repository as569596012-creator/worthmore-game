import type { Metadata } from "next";
import Link from "next/link";
import GuideLayout from "@/components/GuideLayout";
import { buildMetadata } from "@/lib/seo";
import { getGuide } from "@/lib/guides";

const SLUG = "most-valuable-world-cup-2026-players";
const guide = getGuide(SLUG)!;

export const metadata: Metadata = buildMetadata({
  title: guide.title,
  description: guide.metaDescription,
  path: `/guides/${SLUG}/`,
  keywords: guide.keywords,
});

const RANKING: { rank: number; player: string; team: string; value: string }[] = [
  { rank: 1, player: "Jude Bellingham", team: "Real Madrid · England", value: "~$200m" },
  { rank: 2, player: "Erling Haaland", team: "Manchester City · Norway", value: "~$200m" },
  { rank: 3, player: "Vinícius Júnior", team: "Real Madrid · Brazil", value: "~$190m" },
  { rank: 4, player: "Kylian Mbappé", team: "Real Madrid · France", value: "~$180m" },
  { rank: 5, player: "Lamine Yamal", team: "Barcelona · Spain", value: "~$180m" },
  { rank: 6, player: "Jamal Musiala", team: "Bayern Munich · Germany", value: "~$150m" },
  { rank: 7, player: "Florian Wirtz", team: "Liverpool · Germany", value: "~$150m" },
  { rank: 8, player: "Bukayo Saka", team: "Arsenal · England", value: "~$140m" },
  { rank: 9, player: "Pedri", team: "Barcelona · Spain", value: "~$140m" },
  { rank: 10, player: "Cole Palmer", team: "Chelsea · England", value: "~$130m" },
];

export default function Page() {
  return (
    <GuideLayout slug={SLUG}>
      <p>
        <strong>Quick answer:</strong> heading into the 2026 World Cup, the most valuable footballers
        are Jude Bellingham and Erling Haaland at around $200 million each, closely followed by
        Vinícius Júnior, Kylian Mbappé and teenager Lamine Yamal. Below is the top 10 by estimated
        transfer market value (approximate, mid-2026, in US dollars).
      </p>

      <h2 className="text-xl font-bold text-gray-900">Top 10 most valuable players</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 font-semibold">#</th>
              <th className="px-4 py-2 font-semibold">Player</th>
              <th className="px-4 py-2 font-semibold">Club · Country</th>
              <th className="px-4 py-2 font-semibold">Market value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RANKING.map((row) => (
              <tr key={row.rank} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{row.rank}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{row.player}</td>
                <td className="px-4 py-2 text-gray-700">{row.team}</td>
                <td className="px-4 py-2 text-gray-700">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        Figures are approximate transfer market values for mid-2026 from public sources, converted to
        US dollars and rounded. Market values change constantly with form, age and transfers. WorthMore
        is not affiliated with FIFA or Transfermarkt.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Why these players top the list</h2>
      <p>
        Transfer market value rewards a specific mix: peak age (roughly 21&ndash;27), elite output, a
        long contract and a top club. That is why young superstars like Bellingham, Yamal, Musiala and
        Wirtz sit so high &mdash; clubs are paying for many years of prime production, not just current
        form. Veterans such as Cristiano Ronaldo, Lionel Messi and Robert Lewandowski are still global
        icons but carry far lower market values because of their age and shorter remaining careers.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Position matters too</h2>
      <p>
        Attacking midfielders, wingers and forwards dominate the top of the list because goals and
        assists drive valuations. Defenders and goalkeepers &mdash; even world-class ones &mdash;
        rarely reach the same numbers, which is part of what makes a Higher or Lower guessing game fun:
        a brilliant goalkeeper can be worth far less than a young attacker you have barely heard of.
      </p>

      <h2 className="text-xl font-bold text-gray-900">Test your knowledge</h2>
      <p>
        Think you can tell who is worth more? Put it to the test in{" "}
        <Link
          href="/world-cup-player-value-higher-or-lower/"
          className="text-brand-700 underline"
        >
          World Cup Player Value: Higher or Lower
        </Link>
        , or switch to whole squads in{" "}
        <Link href="/world-cup-team-value-higher-or-lower/" className="text-brand-700 underline">
          National Team Value: Higher or Lower
        </Link>
        .
      </p>
    </GuideLayout>
  );
}
