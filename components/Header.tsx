import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { DECKS } from "@/lib/decks";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            $
          </span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="hidden gap-5 text-sm font-medium text-gray-600 md:flex">
          {DECKS.map((d) => (
            <Link key={d.slug} href={`/${d.slug}/`} className="hover:text-brand-700">
              {d.name.replace(": Higher or Lower", "").replace("?", "")}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
