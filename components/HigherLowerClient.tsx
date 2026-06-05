"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
type Side = "left" | "right";

export default function HigherLowerClient({ slug }: { slug: string }) {
  const deck = getDeck(slug);
  const storageKey = `wm_best_${slug}`;
  const router = useRouter();

  const [queue, setQueue] = useState<DeckItem[]>([]);
  const [step, setStep] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [pickedSide, setPickedSide] = useState<Side | null>(null);
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
    setPickedSide(null);
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

  // 预加载下一对卡片的图片(国旗/队徽),消除翻页时的弹入/卡顿
  useEffect(() => {
    if (typeof window === "undefined" || queue.length === 0) return;
    const urls: string[] = [];
    for (const idx of [step + 2, step + 3]) {
      const it = queue[idx];
      if (!it) continue;
      if (it.flagCode && it.domain) {
        const crest = logoUrl(it, LOGODEV_TOKEN);
        if (crest) urls.push(crest);
        urls.push(`https://flagcdn.com/w80/${it.flagCode}.png`);
      } else {
        const u = flagUrl(it) ?? logoUrl(it, LOGODEV_TOKEN);
        if (u) urls.push(u);
      }
    }
    urls.forEach((u) => {
      const img = new Image();
      img.src = u;
    });
  }, [step, queue]);

  // 退出保护：文档级 click 捕获（兼容 Next App Router 的 Link 导航）+ beforeunload + popstate
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

    // 捕获阶段拦截站内 <a> 跳转：Next 15 的 Link 用 React 合成事件 + 缓存的 pushState，
    // 在文档捕获阶段 preventDefault + stopPropagation 才能可靠拦下。
    const onDocClick = (e: MouseEvent) => {
      if (!shouldGuard()) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return; // 外链放行
      if (url.pathname === window.location.pathname) return; // 同页锚点放行
      e.preventDefault();
      e.stopPropagation();
      const dest = url.pathname + url.search;
      setExitPending(() => () => router.push(dest));
    };
    document.addEventListener("click", onDocClick, true);

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
      document.removeEventListener("click", onDocClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]); // streakRef/phaseRef 始终持有最新值

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

  // 点击卡片即猜测：点右卡=赌右边更大(higher)，点左卡=赌左边更大(lower)
  const pick = (side: Side) => {
    if (phase !== "playing") return;
    setPickedSide(side);
    // 等值时两边都算对(数据里有大量并列身价,避免"没猜错却输"的挫败感)
    const correct =
      left.value === right.value
        ? true
        : side === "right"
          ? right.value > left.value
          : left.value > right.value;
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
          setPickedSide(null);
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
      correct ? 550 : 850,
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

  const pickPrompt = deck.pickPrompt ?? "Tap the card you think is worth more";

  return (
    <>
      {exitPending && (
        <ExitConfirmModal
          streak={streak}
          onStay={() => setExitPending(null)}
          onLeave={() => {
            const go = exitPending;
            setExitPending(null);
            go();
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
          <>
            {/* 引导语 */}
            <div className="mb-3 text-center">
              <p className="text-base font-bold text-gray-900 sm:text-lg">
                👆 {pickPrompt}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Tap a card to lock in your guess
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {/* 左卡：已揭示数值，点击=赌左边更大 */}
              <Card
                side="left"
                item={left}
                deck={deck}
                valueLabel={deck.valueLabel}
                value={formatMoney(left.value)}
                revealedValue
                phase={phase}
                picked={pickedSide === "left"}
                correct={lastCorrect}
                onPick={() => pick("left")}
              />

              {/* 右卡：未揭示，点击=赌右边更大 */}
              <Card
                side="right"
                item={right}
                deck={deck}
                valueLabel={deck.valueLabel}
                value={formatMoney(right.value)}
                revealedValue={phase === "revealed"}
                phase={phase}
                picked={pickedSide === "right"}
                correct={lastCorrect}
                onPick={() => pick("right")}
              />
            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Comparing against <span className="font-medium">{left.name}</span>
            </p>
          </>
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
    <div
      data-testid="exit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
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
            data-testid="exit-stay"
            onClick={onStay}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Stay &amp; keep playing
          </button>
          <button
            data-testid="exit-leave"
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

  // 球员卡:俱乐部队徽为主图 + 右下角国籍国旗角标
  if (item.flagCode && item.domain) {
    const crest = logoUrl(item, LOGODEV_TOKEN);
    const natFlag = `https://flagcdn.com/w80/${item.flagCode}.png`;
    return (
      <div className="relative h-16 w-16">
        {crest && !errored ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={crest}
            alt={item.name}
            loading="lazy"
            onError={() => setErrored(true)}
            className="h-16 w-16 rounded-xl bg-white object-contain p-1 ring-1 ring-black/5"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-extrabold text-white shadow-sm"
            style={{ backgroundColor: monogramColor(item.name) }}
          >
            {monogram(item.name)}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={natFlag}
          alt=""
          loading="lazy"
          className="absolute -bottom-1 -right-1 h-5 w-auto rounded-sm bg-white shadow ring-1 ring-black/10"
        />
      </div>
    );
  }

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
            ? "h-12 w-16 rounded object-contain shadow-sm ring-1 ring-black/10"
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
// 可点击卡片（左右通用）
// ──────────────────────────────────────────────────────────────
function Card({
  side,
  item,
  deck,
  valueLabel,
  value,
  revealedValue,
  phase,
  picked,
  correct,
  onPick,
}: {
  side: Side;
  item: DeckItem;
  deck: DeckDef;
  valueLabel: string;
  value: string;
  revealedValue: boolean;
  phase: Phase;
  picked: boolean;
  correct: boolean | null;
  onPick: () => void;
}) {
  const clickable = phase === "playing";

  // 选中后的环框颜色：对=绿，错=红
  let ring = "ring-1 ring-gray-200";
  if (picked && phase !== "playing" && correct !== null) {
    ring = correct ? "ring-2 ring-brand-500" : "ring-2 ring-red-500";
  }

  return (
    <button
      type="button"
      data-testid={`card-${side}`}
      onClick={onPick}
      disabled={!clickable}
      aria-label={`Pick ${item.name}`}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center transition ${ring} ${
        clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0"
          : "cursor-default"
      }`}
    >
      <ItemVisual key={item.name} item={item} />
      <div className="text-lg font-bold text-gray-900">{item.name}</div>
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {item.subtitle
          ? `${item.subtitle} · ${metricLabel(deck, item)}`
          : `${item.category} · ${metricLabel(deck, item)} · ${item.asOf}`}
      </div>

      {revealedValue ? (
        <div>
          <div
            data-testid={`${side}-value`}
            className={`text-2xl font-extrabold ${
              side === "right" && correct !== null
                ? correct
                  ? "text-brand-600"
                  : "text-red-600"
                : "text-gray-900"
            }`}
          >
            {value}
          </div>
          {side === "left" ? (
            <div className="mt-1 text-xs text-gray-400">{valueLabel}</div>
          ) : (
            correct !== null && (
              <div className="mt-1 text-sm font-semibold">
                {correct ? "✅ Correct!" : "❌ Wrong!"}
              </div>
            )
          )}
        </div>
      ) : (
        <div className="mt-1">
          <div className="text-2xl font-extrabold text-gray-300">$ ? ? ?</div>
          <div className="mt-1 text-xs font-medium text-brand-600">
            Tap to pick
          </div>
        </div>
      )}
    </button>
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
