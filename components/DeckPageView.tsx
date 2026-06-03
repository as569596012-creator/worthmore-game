import Link from "next/link";
import { getDeck, relatedDecks } from "@/lib/decks";
import HigherLowerClient from "@/components/HigherLowerClient";
import Faq from "@/components/Faq";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { gameJsonLd, howToJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export default function DeckPageView({ slug }: { slug: string }) {
  const deck = getDeck(slug);
  if (!deck) return null;
  const related = relatedDecks(slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={[
          gameJsonLd(deck),
          howToJsonLd(deck),
          faqJsonLd(deck),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: deck.name, path: `/${deck.slug}/` },
          ]),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{deck.name}</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        {deck.h1}
      </h1>
      <p className="mt-3 text-lg text-gray-600">{deck.intro}</p>

      <div className="mt-6">
        <HigherLowerClient slug={deck.slug} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">How to play</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-600">
          {deck.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="mt-8">
        <AdSlot />
      </div>

      <section className="prose-tool mt-8">
        <h2 className="text-xl font-bold text-gray-900">About this game</h2>
        <p className="mt-3">{deck.body}</p>
      </section>

      <Faq items={deck.faq} />

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">More games</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/${r.slug}/`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm transition hover:border-brand-300 hover:shadow-sm"
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="font-semibold text-gray-900">{r.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
