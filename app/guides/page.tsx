import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Guides & Rankings",
  description:
    "Money and economics rankings explained — countries by GDP, companies by market cap and more — plus the Higher or Lower games to test what you know.",
  path: "/guides/",
});

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {SITE_NAME} Guides
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Quick, fact-checked rankings behind the game — then test how well you really know the
          numbers.
        </p>
      </header>

      <section className="mt-10 space-y-4">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}/`}
            className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-brand-700">
              {guide.h1}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{guide.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
              Read guide →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
