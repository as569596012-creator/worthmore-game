// 把结构化数据(schema.org)注入到页面。用 dangerouslySetInnerHTML 是注入 JSON-LD 的标准做法。
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
