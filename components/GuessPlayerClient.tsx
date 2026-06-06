"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLAYERS, POSITION_LABEL, type GuessPlayer } from "@/lib/players";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const MAX_GUESSES = 8;
const GAME_URL = `${SITE_URL}/guess-the-footballer/`;
const STATS_KEY = "gp_stats_v1";

type Status = "playing" | "won" | "lost";
type CellState = "hit" | "miss";

interface Stats {
  played: number;
  wins: number;
  best: number; // 最少猜中次数(越小越好),0 表示还没赢过
}

function pickRandom(): GuessPlayer {
  return PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
}

function flagSrc(code: string): string {
  return `https://flagcdn.com/w40/${code}.png`;
}

// 年龄提示:箭头指向"答案相对你的猜测"的方向(↑=答案更老)
function ageHint(guessAge: number, answerAge: number): "↑" | "↓" | null {
  if (guessAge === answerAge) return null;
  return answerAge > guessAge ? "↑" : "↓";
}

function Cell({
  state,
  children,
}: {
  state: CellState;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-center text-[11px] font-semibold leading-tight ${
        state === "hit"
          ? "bg-brand-500 text-white"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </div>
  );
}

function GuessRow({ guess, answer }: { guess: GuessPlayer; answer: GuessPlayer }) {
  const natHit = guess.nationality === answer.nationality;
  const clubHit = guess.club === answer.club;
  const leagueHit = guess.league === answer.league;
  const posHit = guess.position === answer.position;
  const ageHit = guess.age === answer.age;
  const arrow = ageHint(guess.age, answer.age);

  return (
    <div data-testid="gp-guess-row" className="space-y-1">
      <div className="text-sm font-bold text-gray-900">{guess.name}</div>
      <div className="grid grid-cols-5 gap-1">
        <Cell state={natHit ? "hit" : "miss"}>
          <img
            src={flagSrc(guess.flagCode)}
            alt=""
            loading="lazy"
            className="h-3.5 w-auto rounded-[2px] ring-1 ring-black/10"
          />
          <span>{guess.nationality}</span>
        </Cell>
        <Cell state={clubHit ? "hit" : "miss"}>{guess.club}</Cell>
        <Cell state={leagueHit ? "hit" : "miss"}>{guess.league}</Cell>
        <Cell state={posHit ? "hit" : "miss"}>{POSITION_LABEL[guess.position]}</Cell>
        <Cell state={ageHit ? "hit" : "miss"}>
          <span>
            {guess.age}
            {arrow ? <span className="ml-0.5">{arrow}</span> : null}
          </span>
        </Cell>
      </div>
    </div>
  );
}

export default function GuessPlayerClient() {
  const [answer, setAnswer] = useState<GuessPlayer | null>(null);
  const [guesses, setGuesses] = useState<GuessPlayer[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("playing");
  const [stats, setStats] = useState<Stats>({ played: 0, wins: 0, best: 0 });
  const [copied, setCopied] = useState(false);
  const settled = useRef(false);

  const newGame = () => {
    setAnswer(pickRandom());
    setGuesses([]);
    setQuery("");
    setStatus("playing");
    setCopied(false);
    settled.current = false;
  };

  useEffect(() => {
    newGame();
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stats;
        if (s && typeof s.played === "number") setStats(s);
      }
    } catch {
      // 忽略
    }
  }, []);

  const guessedNames = useMemo(
    () => new Set(guesses.map((g) => g.name)),
    [guesses],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PLAYERS.filter(
      (pl) => pl.name.toLowerCase().includes(q) && !guessedNames.has(pl.name),
    ).slice(0, 8);
  }, [query, guessedNames]);

  const persistStats = (won: boolean, usedGuesses: number) => {
    setStats((prev) => {
      const next: Stats = {
        played: prev.played + 1,
        wins: prev.wins + (won ? 1 : 0),
        best:
          won && (prev.best === 0 || usedGuesses < prev.best)
            ? usedGuesses
            : prev.best,
      };
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {
        // 忽略
      }
      return next;
    });
  };

  const submitGuess = (player: GuessPlayer) => {
    if (status !== "playing" || !answer) return;
    const nextGuesses = [...guesses, player];
    setGuesses(nextGuesses);
    setQuery("");

    if (player.name === answer.name) {
      setStatus("won");
      if (!settled.current) {
        settled.current = true;
        persistStats(true, nextGuesses.length);
      }
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setStatus("lost");
      if (!settled.current) {
        settled.current = true;
        persistStats(false, nextGuesses.length);
      }
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) submitGuess(suggestions[0]);
  };

  const shareText = useMemo(() => {
    if (!answer || status === "playing") return "";
    const header = `Guess the Footballer ⚽ ${
      status === "won" ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`
    }`;
    const grid = guesses
      .map((g) => {
        const cells = [
          g.nationality === answer.nationality ? "🟩" : "⬜",
          g.club === answer.club ? "🟩" : "⬜",
          g.league === answer.league ? "🟩" : "⬜",
          g.position === answer.position ? "🟩" : "⬜",
          g.age === answer.age
            ? "🟩"
            : answer.age > g.age
              ? "⬆️"
              : "⬇️",
        ];
        return cells.join("");
      })
      .join("\n");
    return `${header}\n${grid}\nCan you beat it? ${GAME_URL}`;
  }, [answer, status, guesses]);

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

  if (!answer) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Loading game…
      </div>
    );
  }

  const guessesLeft = MAX_GUESSES - guesses.length;
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {/* 计分条 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          Guesses left: <span data-testid="gp-left">{Math.max(0, guessesLeft)}</span>
        </div>
        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          Played: {stats.played} · Win {winRate}%
        </div>
      </div>

      {/* 列头 */}
      <div className="mb-1 grid grid-cols-5 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <div>Nation</div>
        <div>Club</div>
        <div>League</div>
        <div>Position</div>
        <div>Age</div>
      </div>

      {/* 猜测行 */}
      <div className="space-y-2">
        {guesses.map((g, i) => (
          <GuessRow key={`${g.name}-${i}`} guess={g} answer={answer} />
        ))}
        {guesses.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            Type a player name below to make your first guess.
          </p>
        )}
      </div>

      {/* 输入 + 自动补全 */}
      {status === "playing" && (
        <form onSubmit={onSubmitForm} className="relative mt-4">
          <input
            data-testid="gp-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Guess a footballer…"
            autoComplete="off"
            aria-label="Guess a footballer"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
              {suggestions.map((pl) => (
                <li key={pl.name}>
                  <button
                    type="button"
                    data-testid="gp-suggest"
                    onClick={() => submitGuess(pl)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-brand-50"
                  >
                    <img
                      src={flagSrc(pl.flagCode)}
                      alt=""
                      loading="lazy"
                      className="h-3.5 w-auto rounded-[2px] ring-1 ring-black/10"
                    />
                    <span className="font-medium text-gray-900">{pl.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{pl.club}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}

      {/* 结算 */}
      {status !== "playing" && (
        <div data-testid="gp-result" className="mt-5 text-center">
          <div className="text-4xl">{status === "won" ? "🎉" : "😵"}</div>
          <h2 className="mt-2 text-xl font-extrabold text-gray-900">
            {status === "won" ? "Got it!" : "Out of guesses"}
          </h2>
          <p className="mt-1 text-gray-600">
            The player was{" "}
            <span className="font-bold text-brand-700">{answer.name}</span> —{" "}
            {answer.club}, {answer.nationality}, {POSITION_LABEL[answer.position]}, age{" "}
            {answer.age}.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              data-testid="gp-newgame"
              onClick={newGame}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              New game
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
        </div>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        {SITE_NAME} · {PLAYERS.length} players · attributes are approximate (2026)
      </p>
    </div>
  );
}
