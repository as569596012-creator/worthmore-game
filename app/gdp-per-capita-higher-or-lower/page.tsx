import type { Metadata } from "next";
import DeckPageView from "@/components/DeckPageView";
import { buildMetadata } from "@/lib/seo";
import { getDeck } from "@/lib/decks";

const SLUG = "gdp-per-capita-higher-or-lower";
const deck = getDeck(SLUG)!;

export const metadata: Metadata = buildMetadata({
  title: deck.title,
  description: deck.metaDescription,
  path: `/${SLUG}/`,
  keywords: deck.keywords,
});

export default function Page() {
  return <DeckPageView slug={SLUG} />;
}
