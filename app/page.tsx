"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  RotateCcw,
  Share2,
  Swords,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { questions } from "@/data/questions";
import { getVoterId } from "@/lib/voter-id";
import {
  calculatePercentage,
  rowsToVoteTotals,
  type VoteRow,
  type VoteTotals,
} from "@/lib/votes";

type Answers = Record<string, string>;

export default function Home() {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const [voteTotals, setVoteTotals] = useState<VoteTotals>({});
  const [votesLoading, setVotesLoading] = useState(true);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const question = questions[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    async function loadVotes() {
      try {
        setVotesLoading(true);
        setVoteError(null);

        const response = await fetch("/api/votes", {
          cache: "no-store",
        });

        const result = (await response.json()) as {
          votes?: VoteRow[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            result.error ?? "Unable to load votes.",
          );
        }

        setVoteTotals(rowsToVoteTotals(result.votes ?? []));
      } catch (error) {
        console.error(error);

        setVoteError(
          "Live results are temporarily unavailable.",
        );
      } finally {
        setVotesLoading(false);
      }
    }

    void loadVotes();
  }, []);

  const minorityPicks = useMemo(() => {
    return Object.entries(answers).filter(
      ([questionId, choiceId]) => {
        const relevantQuestion = questions.find(
          (item) => item.id === questionId,
        );

        if (!relevantQuestion) {
          return false;
        }

        const percentage = calculatePercentage(
          voteTotals[questionId],
          choiceId,
          relevantQuestion.choices.length,
        );

        return percentage < 40;
      },
    ).length;
  }, [answers, voteTotals]);

  async function selectChoice(choiceId: string) {
    if (selectedChoice || voteSubmitting) {
      return;
    }

    setSelectedChoice(choiceId);
    setVoteSubmitting(true);
    setVoteError(null);

    setAnswers((current) => ({
      ...current,
      [question.id]: choiceId,
    }));

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: getVoterId(),
          questionId: question.id,
          choiceId,
        }),
      });

      const result = (await response.json()) as {
        questionId?: string;
        accepted?: boolean;
        votes?: VoteRow[];
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to record vote.",
        );
      }

      if (!result.questionId || !result.votes) {
        throw new Error(
          "The vote response was incomplete.",
        );
      }

      const returnedQuestionId = result.questionId;

      const updatedQuestionTotals = rowsToVoteTotals(
        result.votes,
      );

      setVoteTotals((current) => ({
        ...current,
        [returnedQuestionId]:
          updatedQuestionTotals[returnedQuestionId] ?? {},
      }));
    } catch (error) {
      console.error(error);

      setVoteError(
        error instanceof Error
          ? error.message
          : "Your vote could not be recorded.",
      );
    } finally {
      setVoteSubmitting(false);
    }
  }

  function goNext() {
    if (!selectedChoice || voteSubmitting) {
      return;
    }

    if (questionIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedChoice(null);
    setVoteError(null);
  }

  function restart() {
    setStarted(false);
    setQuestionIndex(0);
    setAnswers({});
    setSelectedChoice(null);
    setFinished(false);
    setVoteError(null);
    setVoteSubmitting(false);
  }

  async function shareResult() {
    const shareText = `I made ${minorityPicks} bold picks in Clash of the Titans. Think you know football better?`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Clash of the Titans",
          text: shareText,
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        `${shareText} ${window.location.href}`,
      );

      window.alert("Result copied to your clipboard.");
    } catch {
      // The user may cancel the native share dialog.
    }
  }

  if (!started) {
    return (
      <main className="app-shell">
        <section className="hero-screen">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="live-pill">
              <span className="live-dot" />
              World Cup final four
            </div>

            <Swords
              className="hero-icon"
              aria-hidden="true"
            />

            <p className="kicker">
              The internet decides
            </p>

            <h1>
              Clash of
              <span>the Titans</span>
            </h1>

            <p className="hero-copy">
              Make your picks. See what everyone thinks.
              Prove you know football.
            </p>

            <div
              className="team-row"
              aria-label="Remaining teams"
            >
              <span>🇫🇷</span>
              <span>🇪🇸</span>
              <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
              <span>🇦🇷</span>
            </div>

            <button
              className="primary-button"
              onClick={() => setStarted(true)}
            >
              Enter the clash
              <ArrowRight size={20} />
            </button>

            <p className="micro-copy">
              Six questions · no sign-up · less than one
              minute
            </p>
          </motion.div>
        </section>
      </main>
    );
  }

  if (finished) {
    const score = Math.min(
      99,
      72 + minorityPicks * 6,
    );

    return (
      <main className="app-shell">
        <section className="result-screen">
          <motion.div
            className="result-card"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="result-icon">
              <Trophy size={34} />
            </div>

            <p className="kicker">
              Your football instinct
            </p>

            <h1>{score}</h1>

            <p className="score-label">
              Titan score
            </p>

            <div className="result-summary">
              <strong>{minorityPicks}</strong>

              <span>
                of your picks went against the crowd.
                Brave or completely delusional?
              </span>
            </div>

            <button
              className="primary-button"
              onClick={shareResult}
            >
              Share your result
              <Share2 size={19} />
            </button>

            <button
              className="secondary-button"
              onClick={restart}
            >
              <RotateCcw size={17} />
              Play again
            </button>
          </motion.div>
        </section>
      </main>
    );
  }

  const questionVoteTotals =
    voteTotals[question.id];

  return (
    <main className="app-shell">
      <section className="game-screen">
        <header className="game-header">
          <div className="brand-small">
            <Swords size={18} />
            <span>Clash</span>
          </div>

          <span>
            {questionIndex + 1}/{questions.length}
          </span>
        </header>

        <div className="progress-track">
          <motion.div
            className="progress-fill"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            className="question-stage"
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -35 }}
            transition={{ duration: 0.24 }}
          >
            <div className="question-heading">
              <p>{question.eyebrow}</p>
              <h2>{question.prompt}</h2>
            </div>

            <div
              className={`choice-grid ${
                question.choices.length > 2
                  ? "choice-grid-four"
                  : ""
              }`}
            >
              {question.choices.map((choice) => {
                const isSelected =
                  selectedChoice === choice.id;

                const isDimmed =
                  Boolean(selectedChoice) &&
                  !isSelected;

                const percentage =
                  calculatePercentage(
                    questionVoteTotals,
                    choice.id,
                    question.choices.length,
                  );

                return (
                  <motion.button
                    key={choice.id}
                    className={`choice-card ${
                      isSelected
                        ? "choice-selected"
                        : ""
                    } ${
                      isDimmed
                        ? "choice-dimmed"
                        : ""
                    }`}
                    style={
                      {
                        "--choice-accent":
                          choice.accent,
                      } as React.CSSProperties
                    }
                    whileTap={{ scale: 0.97 }}
                    disabled={
                      Boolean(selectedChoice) ||
                      voteSubmitting
                    }
                    onClick={() =>
                      selectChoice(choice.id)
                    }
                  >
                    <span className="choice-emoji">
                      {choice.emoji}
                    </span>

                    <strong>{choice.label}</strong>

                    {selectedChoice && (
                      <motion.span
                        className="choice-percentage"
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                      >
                        {percentage}%
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {selectedChoice ? (
              <motion.div
                className="answer-footer"
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <p>
                  {voteSubmitting
                    ? "Recording your vote..."
                    : calculatePercentage(
                          questionVoteTotals,
                          selectedChoice,
                          question.choices.length,
                        ) >= 50
                      ? "The crowd agrees with you."
                      : "You went against the crowd."}
                </p>

                {voteError && (
                  <p
                    className="vote-error"
                    role="alert"
                  >
                    {voteError}
                  </p>
                )}

                <button
                  className="next-button"
                  onClick={goNext}
                  disabled={voteSubmitting}
                >
                  {voteSubmitting
                    ? "Saving..."
                    : questionIndex ===
                        questions.length - 1
                      ? "See my result"
                      : "Next clash"}

                  {!voteSubmitting && (
                    <ArrowRight size={19} />
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="status-area">
                <p className="tap-instruction">
                  {votesLoading
                    ? "Loading the crowd..."
                    : "Tap your pick"}
                </p>

                {voteError && (
                  <p
                    className="vote-error"
                    role="alert"
                  >
                    {voteError}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="ad-placeholder">
          <span>
            Future sponsor or advert space
          </span>
        </div>
      </section>
    </main>
  );
}