import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useDemoSession } from "../learning/demoSession";
import { getPlayerMaterials, scanGameplay } from "../learning/learningService";
import type { CapturedFrame, PlayerLearningMaterial } from "../learning/types";
import {
  frameFromFile,
  startDisplayCapture,
} from "../learning/visualFingerprint";
import type { DisplayCaptureSession } from "../learning/visualFingerprint";
import "./LearningPages.css";

type Answers = Record<string, Record<string, string>>;
type MonitoringState = "idle" | "starting" | "active";

interface UnlockAlert {
  achievements: string[];
  quizzes: string[];
}

const CAPTURE_INTERVAL_MS = 3_000;

export default function PlayerLearningPage() {
  const { gameId = "" } = useParams<{ gameId: string }>();
  const { playerId, players } = useDemoSession();
  const [materials, setMaterials] = useState<PlayerLearningMaterial[]>([]);
  const [lastFrame, setLastFrame] = useState<CapturedFrame | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [materialsLoadedFor, setMaterialsLoadedFor] = useState<string | null>(
    null,
  );
  const [monitoringState, setMonitoringState] =
    useState<MonitoringState>("idle");
  const [lastScannedAt, setLastScannedAt] = useState<Date | null>(null);
  const [unlockAlert, setUnlockAlert] = useState<UnlockAlert | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const captureSessionRef = useRef<DisplayCaptureSession | null>(null);
  const captureTimerRef = useRef<number | null>(null);
  const monitoringRef = useRef(false);
  const materialsRef = useRef<PlayerLearningMaterial[]>([]);
  const materialsContext = `${gameId}:${playerId}`;
  const materialsLoaded = materialsLoadedFor === materialsContext;
  const playerName =
    players.find((player) => player.id === playerId)?.name ?? playerId;

  const applyMaterials = useCallback((data: PlayerLearningMaterial[]) => {
    materialsRef.current = data;
    setMaterials(data);
  }, []);

  useEffect(() => {
    let active = true;

    getPlayerMaterials(gameId, playerId)
      .then((data) => {
        if (active) {
          applyMaterials(data);
          setMaterialsLoadedFor(materialsContext);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load achievement challenges.",
          );
          setMaterialsLoadedFor(materialsContext);
        }
      });

    return () => {
      active = false;
    };
  }, [applyMaterials, gameId, materialsContext, playerId]);

  const submitFrame = useCallback(async (
      frame: CapturedFrame,
      announceComparison = true,
    ) => {
    setBusy(true);
    setError("");
    setLastFrame(frame);

    try {
      const lockedCheckpointIds = new Set(
        materialsRef.current
          .filter((material) => !material.unlocked)
          .map((material) => material.checkpoint?.id)
          .filter((checkpointId): checkpointId is string =>
            Boolean(checkpointId),
          ),
      );
      const result = await scanGameplay({
        gameId,
        playerId,
        screenshotFingerprint: frame.fingerprint,
      });
      const refreshedMaterials = await getPlayerMaterials(gameId, playerId);
      applyMaterials(refreshedMaterials);
      setLastScannedAt(new Date());

      const newlyMatched = result.matched.filter((item) =>
        lockedCheckpointIds.has(item.checkpointId),
      );
      const newlyUnlockedQuizzes = refreshedMaterials.filter(
        (material) =>
          material.unlocked &&
          Boolean(material.checkpoint?.id) &&
          lockedCheckpointIds.has(material.checkpoint?.id ?? "") &&
          newlyMatched.some(
            (match) => match.checkpointId === material.checkpoint?.id,
          ),
      );

      if (newlyMatched.length > 0) {
        setUnlockAlert((current) => ({
          achievements: [
            ...new Set([
              ...(current?.achievements ?? []),
              ...newlyMatched.map((item) => item.title),
            ]),
          ],
          quizzes: [
            ...new Set([
              ...(current?.quizzes ?? []),
              ...newlyUnlockedQuizzes.map((material) => material.title),
            ]),
          ],
        }));
        setMessage(
          `${newlyMatched.map((item) => item.title).join(", ")} unlocked.`,
        );
      } else if (announceComparison && result.comparisons.length > 0) {
        const closest = [...result.comparisons].sort(
          (first, second) => first.distance - second.distance,
        )[0];
        setMessage(
          `No checkpoint matched yet. Closest: ${closest.title} (${closest.similarityScore}% similar).`,
        );
      } else if (announceComparison) {
        setMessage(
          "No developer checkpoints have been configured for this game.",
        );
      }

    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Could not check gameplay progress.",
      );
    } finally {
      setBusy(false);
    }
    }, [applyMaterials, gameId, playerId]);

  const stopMonitoring = useCallback((statusMessage?: string) => {
    monitoringRef.current = false;
    if (captureTimerRef.current !== null) {
      window.clearTimeout(captureTimerRef.current);
      captureTimerRef.current = null;
    }
    captureSessionRef.current?.stop();
    captureSessionRef.current = null;
    setMonitoringState("idle");
    setBusy(false);
    if (statusMessage) setMessage(statusMessage);
  }, []);

  const startMonitoring = async () => {
    if (monitoringRef.current || !materialsLoaded) return;

    setMonitoringState("starting");
    setError("");
    setMessage("");
    monitoringRef.current = true;

    try {
      const session = await startDisplayCapture(() => {
        stopMonitoring("Screen monitoring stopped because sharing ended.");
      });

      if (!monitoringRef.current) {
        session.stop();
        return;
      }

      captureSessionRef.current = session;
      setMonitoringState("active");
      setMessage(
        "Monitoring is active. Achievements will be checked automatically.",
      );

      const scanContinuously = async () => {
        if (!monitoringRef.current || !captureSessionRef.current) return;

        try {
          const frame = await captureSessionRef.current.captureFrame();
          await submitFrame(frame, false);
        } catch (captureError) {
          setError(
            captureError instanceof Error
              ? captureError.message
              : "Could not capture the game screen.",
          );
        }

        if (monitoringRef.current) {
          captureTimerRef.current = window.setTimeout(
            scanContinuously,
            CAPTURE_INTERVAL_MS,
          );
        }
      };

      await scanContinuously();
    } catch (captureError) {
      monitoringRef.current = false;
      setMonitoringState("idle");
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Screen capture was cancelled.",
      );
    }
  };

  useEffect(() => {
    return () => stopMonitoring();
  }, [gameId, playerId, stopMonitoring]);

  const chooseScreenshot = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await submitFrame(await frameFromFile(file), true);
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "Could not read that screenshot.",
      );
    }
  };

  const setAnswer = (materialId: string, questionId: string, value: string) => {
    setAnswers((current) => ({
      ...current,
      [materialId]: {
        ...current[materialId],
        [questionId]: value,
      },
    }));
  };

  const submitQuiz = (material: PlayerLearningMaterial) => {
    const multipleChoiceQuestions = material.questions.filter(
      (question) => question.type === "MULTIPLE_CHOICE",
    );
    const correct = multipleChoiceQuestions.filter((question) =>
      question.correctAnswers.includes(
        answers[material.id]?.[question.id] ?? "",
      ),
    ).length;
    const shortAnswerCount = material.questions.filter(
      (question) => question.type === "SHORT_ANSWER",
    ).length;

    setResults((current) => ({
      ...current,
      [material.id]: `${correct}/${multipleChoiceQuestions.length} multiple-choice answers correct${
        shortAnswerCount > 0
          ? `; ${shortAnswerCount} short answer${shortAnswerCount === 1 ? "" : "s"} recorded in this demo session`
          : ""
      }.`,
    }));
  };

  return (
    <main className="learning-page">
      <header className="learning-hero player-hero">
        <div>
          <span className="eyebrow">Player journey</span>
          <h1>{playerName}&apos;s achievement path</h1>
          <p>
            Start monitoring once. The platform will check the game screen
            every three seconds and unlock quizzes automatically when you
            reach a developer&apos;s achievement.
          </p>
        </div>
        <div className="monitoring-controls">
          <div className="capture-actions">
            {monitoringState === "active" ? (
              <button
                className="stop-monitoring-button"
                type="button"
                onClick={() => stopMonitoring("Screen monitoring stopped.")}
              >
                Stop monitoring
              </button>
            ) : (
              <button
                className="primary-button"
                type="button"
                disabled={monitoringState === "starting" || !materialsLoaded}
                onClick={startMonitoring}
              >
                {!materialsLoaded
                  ? "Loading achievements…"
                  : monitoringState === "starting"
                    ? "Starting monitoring…"
                    : "Start screen monitoring"}
              </button>
            )}
            <label className="file-button">
              Check uploaded screenshot
              <input type="file" accept="image/*" onChange={chooseScreenshot} />
            </label>
          </div>
          <div
            className={`monitoring-status ${monitoringState}`}
            role="status"
          >
            <span className="monitoring-dot" aria-hidden="true" />
            {monitoringState === "active"
              ? busy
                ? "Monitoring · checking now"
                : "Monitoring · next check within 3 seconds"
              : monitoringState === "starting"
                ? "Starting screen capture"
                : "Monitoring is off"}
          </div>
        </div>
      </header>

      {message && <p className="notice success">{message}</p>}
      {error && <p className="notice error">{error}</p>}
      {lastFrame && (
        <div className="last-scan">
          <img src={lastFrame.dataUrl} alt="Last checked game screen" />
          <span>
            Last screen checked locally
            {lastScannedAt
              ? ` at ${lastScannedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}`
              : ""}
          </span>
        </div>
      )}

      {unlockAlert && (
        <div
          className="unlock-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setUnlockAlert(null);
          }}
        >
          <section
            className="unlock-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unlock-dialog-title"
          >
            <span className="unlock-icon" aria-hidden="true">
              ✓
            </span>
            <p className="eyebrow">Achievement unlocked</p>
            <h2 id="unlock-dialog-title">
              {unlockAlert.achievements.join(", ")}
            </h2>
            <p>
              {unlockAlert.quizzes.length > 0
                ? `${unlockAlert.quizzes.join(", ")} ${unlockAlert.quizzes.length === 1 ? "is" : "are"} now unlocked and ready below.`
                : "You reached this achievement. Its quiz will appear here when it is published."}
            </p>
            <button
              className="primary-button"
              type="button"
              autoFocus
              onClick={() => setUnlockAlert(null)}
            >
              {unlockAlert.quizzes.length > 0 ? "Continue to quiz" : "Continue"}
            </button>
          </section>
        </div>
      )}

      <section className="material-list">
        {materials.length === 0 && (
          <div className="learning-panel empty-state">
            <h2>No quizzes published yet</h2>
            <p>
              Switch to the developer view to create a checkpoint and generate
              its achievement challenge.
            </p>
          </div>
        )}

        {materials.map((material, materialIndex) => (
          <article
            className={`material-card ${
              material.unlocked ? "unlocked" : "locked"
            }`}
            key={material.id}
          >
            <header>
              <span className="material-number">
                Section {materialIndex + 1}
              </span>
              <span className="status-chip">
                {material.unlocked ? "Unlocked" : "Locked"}
              </span>
              <h2>{material.title}</h2>
              <p>
                {material.unlocked
                  ? material.description
                  : `Reach “${material.checkpoint?.title ?? "the required checkpoint"}” in the game to continue.`}
              </p>
            </header>

            {material.unlocked ? (
              <div className="quiz-body">
                {material.learningObjective && (
                  <p className="learning-objective">
                    <strong>Achievement focus:</strong>{" "}
                    {material.learningObjective}
                  </p>
                )}
                {material.questions.map((question, questionIndex) => (
                  <fieldset key={question.id}>
                    <legend>
                      {questionIndex + 1}. {question.question}
                    </legend>
                    {question.type === "MULTIPLE_CHOICE" ? (
                      <div className="answer-options">
                        {question.options.map((option) => (
                          <label key={option}>
                            <input
                              type="radio"
                              name={`${material.id}-${question.id}`}
                              value={option}
                              checked={
                                answers[material.id]?.[question.id] === option
                              }
                              onChange={(event) =>
                                setAnswer(
                                  material.id,
                                  question.id,
                                  event.target.value,
                                )
                              }
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[material.id]?.[question.id] ?? ""}
                        onChange={(event) =>
                          setAnswer(
                            material.id,
                            question.id,
                            event.target.value,
                          )
                        }
                        placeholder="Write a short response…"
                      />
                    )}
                  </fieldset>
                ))}
                <button type="button" onClick={() => submitQuiz(material)}>
                  Submit quiz
                </button>
                {results[material.id] && (
                  <p className="quiz-result">{results[material.id]}</p>
                )}
              </div>
            ) : (
              <div className="locked-content" aria-label="Locked quiz">
                <span aria-hidden="true">🔒</span>
                <p>Quiz questions are hidden until gameplay is verified.</p>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
