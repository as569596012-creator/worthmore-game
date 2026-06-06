"use client";

import { useEffect, useMemo, useState } from "react";
import { WC_TEAMS, flagUrl, type WcTeam } from "@/lib/wcteams";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const GAME_URL = `${SITE_URL}/world-cup-bracket-predictor/`;
const PLAYED_KEY = "wcp_played_v1";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function roundName(teamsInRound: number): string {
  switch (teamsInRound) {
    case 16:
      return "Round of 16";
    case 8:
      return "Quarter-finals";
    case 4:
      return "Semi-finals";
    case 2:
      return "Final";
    default:
      return "Knockout";
  }
}

function TeamButton({
  team,
  onPick,
}: {
  team: WcTeam;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="wcp-pick"
      onClick={onPick}
      aria-label={`Pick ${team.name}`}
      className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0 sm:p-8"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl(team, 160)}
        alt={team.name}
        loading="eager"
        className="h-16 w-24 rounded object-contain shadow-sm ring-1 ring-black/10 sm:h-20 sm:w-32"
      />
      <span className="text-lg font-bold text-gray-900 group-hover:text-brand-700 sm:text-xl">
        {team.name}
      </span>
    </button>
  );
}

export default function WorldCupPickerClient() {
  const [round, setRound] = useState<WcTeam[] | null>(null);
  const [pairIndex, setPairIndex] = useState(0);
  const [winners, setWinners] = useState<WcTeam[]>([]);
  const [finalists, setFinalists] = useState<WcTeam[] | null>(null);
  const [champion, setChampion] = useState<WcTeam | null>(null);
  const [played, setPlayed] = useState(0);
  const [copied, setCopied] = useState(false);

  const newGame = () => {
    setRound(shuffle(WC_TEAMS));
    setPairIndex(0);
    setWinners([]);
    setFinalists(null);
    setChampion(null);
    setCopied(false);
  };

  useEffect(() => {
    newGame();
    try {
      const n = Number(localStorage.getItem(PLAYED_KEY));
      if (Number.isFinite(n) && n > 0) setPlayed(n);
    } catch {
      // 忽略
    }
  }, []);

  const pick = (team: WcTeam) => {
    if (!round || champion) return;
    const newWinners = [...winners, team];
    const totalPairs = round.length / 2;

    if (pairIndex + 1 < totalPairs) {
      setWinners(newWinners);
      setPairIndex(pairIndex + 1);
      return;
    }

    // 本轮最后一对已选完
    if (newWinners.length === 1) {
      setChampion(newWinners[0]);
      setPlayed((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem(PLAYED_KEY, String(next));
        } catch {
          // 忽略
        }
        return next;
      });
      return;
    }

    if (newWinners.length === 2) setFinalists(newWinners);
    setRound(newWinners);
    setWinners([]);
    setPairIndex(0);
  };

  const runnerUp = useMemo(() => {
    if (!champion || !finalists) return null;
    return finalists.find((t) => t.name !== champion.name) ?? null;
  }, [champion, finalists]);

  const shareText = useMemo(() => {
    if (!champion) return "";
    const lines = [
      "My World Cup 2026 prediction 🏆",
      `Champion: ${champion.name}`,
    ];
    if (runnerUp) lines.push(`Runner-up: ${runnerUp.name}`);
    lines.push(`Make your pick: ${GAME_URL}`);
    return lines.join("\n");
  }, [champion, runnerUp]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!round) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Loading game…
      </div>
    );
  }

  // 冠军结算
  if (champion) {
    return (
      <div
        data-testid="wcp-result"
        className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8"
      >
        <div className="text-sm font-bold uppercase tracking-wide text-brand-700">
          Your World Cup 2026 winner
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl(champion, 320)}
          alt={champion.name}
          className="mx-auto mt-4 h-28 w-44 rounded-lg object-contain shadow ring-1 ring-black/10"
        />
        <div className="mt-3 text-3xl">🏆</div>
        <h2 className="mt-1 text-2xl font-extrabold text-gray-900">{champion.name}</h2>
        {runnerUp && (
          <p className="mt-2 text-gray-600">
            Final: <span className="font-semibold">{champion.name}</span> beat{" "}
            <span className="font-semibold">{runnerUp.name}</span>
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            data-testid="wcp-restart"
            onClick={newGame}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Start over
          </button>
          <button
            onClick={copyResult}
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button
            onClick={shareToX}
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            Share on X
          </button>
        </div>

        <p className="mt-5 text-xs text-gray-400">
          {SITE_NAME} · your personal prediction · just for fun
        </p>
      </div>
    );
  }

  // 进行中
  const totalPairs = round.length / 2;
  const left = round[pairIndex * 2];
  const right = round[pairIndex * 2 + 1];
  const stage = roundName(round.length);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div
          data-testid="wcp-stage"
          className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700"
        >
          {stage}
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          Match {pairIndex + 1} of {totalPairs}
        </div>
      </div>

      <p className="mb-4 text-center text-base font-bold text-gray-900 sm:text-lg">
        Who goes through?
      </p>

      <div className="flex items-stretch gap-3">
        <TeamButton team={left} onPick={() => pick(left)} />
        <div className="flex items-center text-sm font-extrabold text-gray-400">vs</div>
        <TeamButton team={right} onPick={() => pick(right)} />
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Tap a flag to send that team through · {played} bracket{played === 1 ? "" : "s"} played
      </p>
    </div>
  );
}
