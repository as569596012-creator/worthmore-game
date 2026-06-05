import Link from "next/link";
import { getGuide, relatedDecksForGuide } from "@/lib/guides";
import JsonLd from "@/components/JsonLd";
import AdSlot from "@/components/AdSlot";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { AUTHOR_NAME } from "@/lib/site";

export default function GuideLayout({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const guide = getGuide(slug);
  if (!guide) return null;
  const decks = relatedDecksForGuide(guide);
  const dateText = new Date(guide.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={[
          articleJsonLd(guide),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides/" },
            { name: guide.h1, path: `/guides/${guide.slug}/` },
          ]),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/guides/" className="hover:text-brand-700">
          Guides
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{guide.h1}</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        {guide.h1}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        By {AUTHOR_NAME} · Updated {dateText}
      </p>
      <p className="mt-4 text-lg text-gray-600">{guide.intro}</p>

      <div className="prose-tool mt-8 space-y-4">{children}</div>

      {decks.length > 0 && (
        <section className="mt-10 rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-xl font-bold text-gray-900">Now test yourself — play the game</h2>
          <p className="mt-1 text-sm text-gray-600">
            Free, no sign-up. Two cards, one question: which is worth more? Build your streak.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {decks.map((d) => (
              <Link
                key={d.slug}
                href={`/${d.slug}/`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
              >
                <span className="text-2xl">{d.emoji}</span>
                <span>
                  <span className="block font-semibold text-gray-900">{d.name}</span>
                  <span className="block text-sm text-gray-600">Play now →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <AdSlot />
      </div>

      <p className="mt-8 text-sm">
        <Link href="/guides/" className="font-semibold text-brand-700 hover:underline">
          ← All guides
        </Link>
      </p>
    </article>
  );
}
