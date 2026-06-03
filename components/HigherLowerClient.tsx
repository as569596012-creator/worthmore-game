"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDeck,
  formatMoney,
  flagUrl,
  logoUrl,
  monogram,
  monogramColor,
  metricLabel,
  type DeckDef,
  type DeckItem,
} from "@/lib/decks";
import { SITE_NAME, SITE_URL, LOGODEV_TOKEN } from "@/lib/site";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = "playing" | "revealed" | "over";

// 只接收 slug:含数据的定义不必跨 RSC 边界,客户端自己从注册表取。
export default function HigherLowerClient({ slug }: { slug: string }) {
  const deck = getDeck(slug);
  const storageKey = `wm_best_${slug}`;

  const [queue, setQueue] = useState<DeckItem[]>([]);
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(() => {
    if (!deck) return;
    setQueue(shuffle(deck.items));
    setStep(0);
    setStreak(0);
    setPhase("playing");
    setLastCorrect(null);
    setCopied(false);
  }, [deck]);

  useEffect(() => {
    startGame();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [startGame]);

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(storageKey));
      if (Number.isFinite(b) && b > 0) setBest(b);
    } catch {
      // localStorage 不可用时忽略
    }
  }, [storageKey]);

  if (!deck) return null;

  const left = queue[step];
  const right = queue[step + 1];
  if (!left || !right) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Loading game…
      </div>
    );
  }

  const guess = (dir: "higher" | "lower") => {
    if (phase !== "playing") return;
    const correct = dir === "higher" ? right.value >= left.value : right.value < left.value;
    setLastCorrect(correct);
    setPhase("revealed");

    timer.current = setTimeout(
      () => {
        if (correct) {
          setStreak((s) => s + 1);
          let nextStep = step + 1;
          if (nextStep + 1 >= queue.length) {
            const keep = queue[nextStep];
            const rest = shuffle(deck.items.filter((it) => it.name !== keep.name));
            setQueue([keep, ...rest]);
            nextStep = 0;
          }
          setStep(nextStep);
          setPhase("playing");
          setLastCorrect(null);
        } else {
          setBest((prevBest) => {
            const newBest = Math.max(prevBest, streak);
            try {
              localStorage.setItem(storageKey, String(newBest));
            } catch {
              // 忽略
            }
            return newBest;
          });
          setPhase("over");
        }
      },
      correct ? 850 : 1050,
    );
  };

  const shareText = `I scored a streak of ${streak} on ${deck.name} 💰 — can you beat me? ${SITE_URL}`;

  const copyChallenge = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略
    }
  };

  const downloadCard = () => {
    const card = drawScoreCard(streak, best, deck.name);
    const a = document.createElement("a");
    a.href = card;
    a.download = `${SITE_NAME}-streak-${streak}.png`;
    a.click();
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {/* 计分条 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          Streak: <span data-testid="streak">{streak}</span>
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          Best: {Math.max(best, streak)}
        </div>
      </div>

      {phase === "over" ? (
        <GameOver
          streak={streak}
          best={Math.max(best, streak)}
          deckName={deck.name}
          onPlayAgain={startGame}
          onCopy={copyChallenge}
          onDownload={downloadCard}
          onShareX={shareToX}
          copied={copied}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {/* 左卡:已揭示 */}
          <Card item={left} deck={deck} valueLabel={deck.valueLabel} revealed value={formatMoney(left.value)} />

          {/* 右卡:待猜 / 揭示中 */}
          <div className="relative flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 text-center">
            <ItemVisual key={right.name} item={right} />
            <div className="text-lg font-bold text-gray-900">{right.name}</div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              {right.category} · {metricLabel(deck, right)} · {right.asOf}
            </div>

            {phase === "revealed" ? (
              <div className="mt-1">
                <div
                  data-testid="right-value"
                  className={`text-2xl font-extrabold ${lastCorrect ? "text-brand-600" : "text-red-600"}`}
                >
                  {formatMoney(right.value)}
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {lastCorrect ? "✅ Correct!" : "❌ Wrong!"}
                </div>
              </div>
            ) : (
              <div className="mt-1 flex flex-col gap-2">
                <div className="text-2xl font-extrabold text-gray-300">$ ? ? ?</div>
                <div className="flex gap-2">
                  <button
                    data-testid="btn-higher"
                    onClick={() => guess("higher")}
                    className="rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
                  >
                    ▲ Higher
                  </button>
                  <button
                    data-testid="btn-lower"
                    onClick={() => guess("lower")}
                    className="rounded-full bg-gray-800 px-5 py-2 text-sm font-bold text-white transition hover:bg-gray-900"
                  >
                    ▼ Lower
                  </button>
                </div>
                <div className="text-xs text-gray-400">than {left.name}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 卡片视觉:优先真实旗帜(flagcdn)→ 真实 logo(logo.dev,需 token)→ 字母牌兜底。
// 用 key={item.name} 渲染,确保切换标的时 errored 状态重置。
function ItemVisual({ item }: { item: DeckItem }) {
  const [errored, setErrored] = useState(false);
  const flag = flagUrl(item);
  const logo = logoUrl(item, LOGODEV_TOKEN);
  const src = flag ?? logo;

  if (src && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={item.name}
        loading="lazy"
        onError={() => setErrored(true)}
        className={
          flag
            ? "h-12 w-auto rounded shadow-sm ring-1 ring-black/10"
            : "h-16 w-16 rounded-xl bg-white object-contain p-1 ring-1 ring-black/5"
        }
      />
    );
  }

  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-extrabold text-white shadow-sm"
      style={{ backgroundColor: monogramColor(item.name) }}
    >
      {monogram(item.name)}
    </div>
  );
}

function Card({
  item,
  deck,
  valueLabel,
  revealed,
  value,
}: {
  item: DeckItem;
  deck: DeckDef;
  valueLabel: string;
  revealed: boolean;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center">
      <ItemVisual key={item.name} item={item} />
      <div className="text-lg font-bold text-gray-900">{item.name}</div>
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {item.category} · {metricLabel(deck, item)} · {item.asOf}
      </div>
      {revealed && (
        <div>
          <div data-testid="left-value" className="text-2xl font-extrabold text-gray-900">
            {value}
          </div>
          <div className="mt-1 text-xs text-gray-400">{valueLabel}</div>
        </div>
      )}
    </div>
  );
}

function GameOver({
  streak,
  best,
  deckName,
  onPlayAgain,
  onCopy,
  onDownload,
  onShareX,
  copied,
}: {
  streak: number;
  best: number;
  deckName: string;
  onPlayAgain: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onShareX: () => void;
  copied: boolean;
}) {
  return (
    <div data-testid="game-over" className="py-4 text-center">
      <div className="text-5xl">🏁</div>
      <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Game over</h2>
      <p className="mt-1 text-gray-600">
        You reached a streak of <span className="font-bold text-brand-700">{streak}</span> on{" "}
        {deckName}.
      </p>
      <p className="mt-1 text-sm text-gray-500">Best streak: {best}</p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          data-testid="play-again"
          onClick={onPlayAgain}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          ▶ Play again
        </button>
        <button
          onClick={onShareX}
          className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-300"
        >
          Share on X
        </button>
        <button
          onClick={onCopy}
          className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-300"
        >
          {copied ? "Copied!" : "Copy challenge"}
        </button>
        <button
          onClick={onDownload}
          className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-300"
        >
          Download card
        </button>
      </div>
    </div>
  );
}

// 用 Canvas 画一张可分享的成绩卡(1200x630,社交 OG 尺寸),返回 PNG dataURL。
function drawScoreCard(streak: number, best: number, deckName: string): string {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#047857");
  grad.addColorStop(1, "#065f46");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillText(deckName, W / 2, 120);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 220px system-ui, sans-serif";
  ctx.fillText(String(streak), W / 2, 360);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText("streak", W / 2, 430);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "32px system-ui, sans-serif";
  ctx.fillText(`Best: ${best}  ·  Can you beat it?`, W / 2, 500);

  ctx.fillStyle = "#a7f3d0";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), W / 2, 575);

  return canvas.toDataURL("image/png");
}
