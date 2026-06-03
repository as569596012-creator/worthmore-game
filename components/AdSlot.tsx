"use client";

import { useEffect } from "react";
import { ADSENSE_PUBLISHER_ID } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// 一个可复用的广告位。
// - 没有配置 ADSENSE_PUBLISHER_ID 时:显示占位框(本地开发/审核期),不加载任何脚本。
// - 配置后:渲染真正的 AdSense ins 单元。
export default function AdSlot({
  slot,
  className = "",
  label = "Advertisement",
}: {
  slot?: string;
  className?: string;
  label?: string;
}) {
  const enabled = ADSENSE_PUBLISHER_ID.length > 0 && !!slot;

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 广告脚本未就绪时忽略
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <div
        className={`flex min-h-[90px] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 ${className}`}
        aria-hidden="true"
      >
        Ad slot (configure ADSENSE_PUBLISHER_ID to enable)
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-1 text-center text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
