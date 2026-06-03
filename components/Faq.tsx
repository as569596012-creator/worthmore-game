import type { FaqItem } from "@/lib/decks";

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-gray-900">Frequently asked questions</h2>
      <div className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {items.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-gray-900 marker:hidden">
              <span className="flex items-center justify-between">
                {item.q}
                <span className="ml-2 text-brand-600 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
