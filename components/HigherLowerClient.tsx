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

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtTimerDisplay(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Phase = "playing" | "revealed" | "over";

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

  // 计时器
  const [elapsedSec, setElapsedSec] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 退出确认弹窗
  const [exitPending, setExitPending] = useState<(() => void) | null>(null);
  const streakRef = useRef(0);
  const phaseRef = useRef<Phase>("playing");
  const origPushState = useRef<typeof window.history.pushState | null>(null);

  // 同步 ref，供事件回调读取最新值（避免闭包捕获旧值）
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsedSec(0);
    intervalRef.current = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback((elapsed: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFinalElapsed(elapsed);
  }, []);

  const startGame = useCallback(() => {
    if (!deck) return;
    setQueue(shuffle(deck.items));
    setStep(0);
    setStreak(0);
    setPhase("playing");
    setLastCorrect(null);
    setCopied(false);
    setFinalElapsed(0);
    startTimer();
  }, [deck, startTimer]);

  useEffect(() => {
    startGame();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
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

  // 退出保护：beforeunload + pushState monkey-patch + popstate
  useEffect(() => {
    const shouldGuard = () =>
      phaseRef.current !== "over" && streakRef.current > 0;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldGuard()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // monkey-patch history.pushState 捕获 SPA 内路由跳转
    const orig = window.history.pushState.bind(window.history);
    origPushState.current = orig;
    window.history.pushState = (
      ...args: Parameters<typeof window.history.pushState>
    ) => {
      if (shouldGuard()) {
        setExitPending(() => () => orig(...args));
      } else {
        orig(...args);
      }
    };

    const handlePopState = () => {
      if (shouldGuard()) {
        // 推一个占位历史让 URL 看起来未变，再弹确认
        window.history.pushState(null, "", window.location.href);
        setExitPending(() => () => window.history.back());
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      if (origPushState.current) {
        window.history.pushState = origPushState.current;
      }
    };
  }, []); // 只挂一次；streakRef/phaseRef 始终持有最新值

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
    const correct =
      dir === "higher" ? right.value >= left.value : right.value < left.value;
    setLastCorrect(correct);
    setPhase("revealed");

    timer.current = setTimeout(
      () => {
        if (correct) {
          setStreak((s) => s + 1);
          let nextStep = step + 1;
          if (nextStep + 1 >= queue.length) {
            const keep = queue[nextStep];
            const rest = shuffle(
              deck.items.filter((it) => it.name !== keep.name),
            );
            setQueue([keep, ...rest]);
            nextStep = 0;
          }
          setStep(nextStep);
          setPhase("playing");
          setLastCorrect(null);
        } else {
          const elapsed = elapsedSec;
          stopTimer(elapsed);
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

  const shareText = `Streak: ${streak} in ${fmtTime(finalElapsed)} on ${deck.name} 💰 — can you beat it? ${SITE_URL}`;

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
    const card = drawScoreCard(streak, best, deck.name, finalElapsed);
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
    <>
      {exitPending && (
        <ExitConfirmModal
          streak={streak}
          onStay={() => setExitPending(null)}
          onLeave={() => {
            setExitPending(null);
            exitPending();
          }}
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {/* 计分条 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            Streak: <span data-testid="streak">{streak}</span>
          </div>
          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            Best: {Math.max(best, streak)}
          </div>
          {phase !== "over" && (
            <div className="rounded-full bg-gray-800 px-3 py-1 font-mono text-sm font-medium text-white">
              ⏱ {fmtTimerDisplay(elapsedSec)}
            </div>
          )}
        </div>

        {phase === "over" ? (
          <GameOver
            streak={streak}
            best={Math.max(best, streak)}
            deckName={deck.name}
            elapsedSec={finalElapsed}
            onPlayAgain={startGame}
            onCopy={copyChallenge}
            onDownload={downloadCard}
            onShareX={shareToX}
            copied={copied}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {/* 左卡：已揭示 */}
            <Card
              item={left}
              deck={deck}
              valueLabel={deck.valueLabel}
              revealed
              value={formatMoney(left.value)}
            />

            {/* 右卡：待猜 / 揭示中 */}
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
                  <div className="text-2xl font-extrabold text-gray-300">
                    $ ? ? ?
                  </div>
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
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// 退出确认弹窗
// ──────────────────────────────────────────────────────────────
function ExitConfirmModal({
  streak,
  onStay,
  onLeave,
}: {
  streak: number;
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mb-3 text-3xl">🚪</div>
        <h2 className="text-xl font-extrabold text-gray-900">Leave game?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your current streak of{" "}
          <span className="font-bold text-brand-700">{streak}</span> will be
          lost.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={onStay}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Stay &amp; keep playing
          </button>
          <button
            onClick={onLeave}
            className="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:text-red-600"
          >
            Leave anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 卡片图片：旗帜 → logo → 字母牌
// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// 已揭示卡片
// ──────────────────────────────────────────────────────────────
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
          <div
            data-testid="left-value"
            className="text-2xl font-extrabold text-gray-900"
          >
            {value}
          </div>
          <div className="mt-1 text-xs text-gray-400">{valueLabel}</div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 游戏结束面板
// ──────────────────────────────────────────────────────────────
function GameOver({
  streak,
  best,
  deckName,
  elapsedSec,
  onPlayAgain,
  onCopy,
  onDownload,
  onShareX,
  copied,
}: {
  streak: number;
  best: number;
  deckName: string;
  elapsedSec: number;
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
        You reached a streak of{" "}
        <span className="font-bold text-brand-700">{streak}</span> in{" "}
        <span className="font-bold text-gray-800">{fmtTime(elapsedSec)}</span>{" "}
        on {deckName}.
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

// ──────────────────────────────────────────────────────────────
// Canvas 成绩卡（1200×630，社交 OG 尺寸）
// ──────────────────────────────────────────────────────────────
function drawScoreCard(
  streak: number,
  best: number,
  deckName: string,
  elapsedSec: number,
): string {
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
  ctx.fillText(deckName, W / 2, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 200px system-ui, sans-serif";
  ctx.fillText(String(streak), W / 2, 330);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText("streak", W / 2, 390);

  ctx.fillStyle = "#a7f3d0";
  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillText(
    `\u23f1 ${fmtTime(elapsedSec)}  \u00b7  ${streak} answer${streak !== 1 ? "s" : ""}`,
    W / 2,
    455,
  );

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "32px system-ui, sans-serif";
  ctx.fillText(`Best: ${best}  \u00b7  Can you beat it?`, W / 2, 515);

  ctx.fillStyle = "#a7f3d0";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), W / 2, 580);

  return canvas.toDataURL("image/png");
}
