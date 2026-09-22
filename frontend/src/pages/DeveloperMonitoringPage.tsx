import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createCheckpoint,
  generateLearningMaterial,
  getCheckpoints,
} from "../learning/learningService";
import type { CapturedFrame, VisualCheckpoint } from "../learning/types";
import {
  captureDisplayFrame,
  frameFromDataUrl,
  frameFromFile,
} from "../learning/visualFingerprint";
import "./LearningPages.css";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

export default function DeveloperMonitoringPage() {
  const { gameId = "" } = useParams<{ gameId: string }>();
  const shortcutModifier = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    ? "Option"
    : "Alt";
  const desktopApi = window.achievementMakerDesktop;
  const [checkpoints, setCheckpoints] = useState<VisualCheckpoint[]>([]);
  const [frame, setFrame] = useState<CapturedFrame | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [developerNote, setDeveloperNote] = useState("");
  const [threshold, setThreshold] = useState(12);
  const [focus, setFocus] = useState(
    "critical thinking about the decisions made in this section",
  );
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(3);
  const [shortAnswerCount, setShortAnswerCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [generatingCheckpointId, setGeneratingCheckpointId] = useState<
    string | null
  >(null);
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    const data = await getCheckpoints(gameId);
    setCheckpoints(data);
  };

  useEffect(() => {
    let active = true;

    getCheckpoints(gameId)
      .then((data) => {
        if (active) setCheckpoints(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load checkpoints.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [gameId]);

  const captureScreen = useCallback(async () => {
    if (capturing) return;

    setCapturing(true);
    setError("");
    setMessage("");

    try {
      if (desktopApi) {
        const result = await desktopApi.captureScreen();
        if (result.error || !result.dataUrl) {
          throw new Error(result.error ?? "Screen capture failed.");
        }
        setFrame(await frameFromDataUrl(result.dataUrl));
      } else {
        setFrame(await captureDisplayFrame());
      }
      setMessage("Screenshot captured. Add a checkpoint name, then save it.");
    } catch (captureError) {
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Screen capture was cancelled.",
      );
    } finally {
      setCapturing(false);
    }
  }, [capturing, desktopApi]);

  useEffect(() => {
    if (!desktopApi) return;

    return desktopApi.onGlobalCapture((result) => {
      setError("");
      setMessage("");

      if (result.error || !result.dataUrl) {
        setError(result.error ?? "Screen capture failed.");
        return;
      }

      void frameFromDataUrl(result.dataUrl)
        .then((capturedFrame) => {
          setFrame(capturedFrame);
          setMessage(
            "Screenshot captured globally. Add a checkpoint name, then save it.",
          );
        })
        .catch((captureError: unknown) => {
          setError(
            captureError instanceof Error
              ? captureError.message
              : "Could not read the captured screen.",
          );
        });
    });
  }, [desktopApi]);

  useEffect(() => {
    if (desktopApi) return;

    const handleCaptureShortcut = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.code !== "KeyS" ||
        !event.altKey ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      void captureScreen();
    };

    window.addEventListener("keydown", handleCaptureShortcut);
    return () => window.removeEventListener("keydown", handleCaptureShortcut);
  }, [captureScreen, desktopApi]);

  const chooseScreenshot = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFrame(await frameFromFile(file));
      setError("");
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "Could not read that screenshot.",
      );
    }
  };

  const saveCheckpoint = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!frame || !title.trim()) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createCheckpoint({
        gameId,
        title: title.trim(),
        description: description.trim(),
        developerNote: developerNote.trim(),
        snapshotReference: frame.dataUrl,
        visualFingerprint: frame.fingerprint,
        matchThreshold: threshold,
      });
      setTitle("");
      setDescription("");
      setDeveloperNote("");
      setFrame(null);
      setMessage("Visual checkpoint saved.");
      await refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the checkpoint.",
      );
    } finally {
      setBusy(false);
    }
  };

  const generateQuiz = async (checkpointId: string) => {
    setGeneratingCheckpointId(checkpointId);
    setError("");
    setMessage("");

    try {
      await generateLearningMaterial({
        gameId,
        checkpointId,
        focus,
        multipleChoiceCount,
        shortAnswerCount,
      });

      setMessage(
        `Quiz generated successfully and linked to the checkpoint.`,
      );

      await refresh();
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Could not generate the quiz.",
      );
    } finally {
      setGeneratingCheckpointId(null);
    }
  };

  return (
    <main className="learning-page developer-checkpoint-page">
      {message && <p className="notice success">{message}</p>}
      {error && <p className="notice error">{error}</p>}

      <div className="developer-workspace-layout">
        {/* LEFT SIDEBAR */}
        <aside className="developer-sidebar">
          <div className="sidebar-header">
            <span className="eyebrow">Developer workspace</span>
            <h2>Gameplay Checkpoints</h2>
            <p>
              Create gameplay checkpoints and attach achievement challenges.
            </p>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Current game</span>

            <div className="sidebar-game selected">
              <div className="sidebar-game-icon">G</div>

              <div className="sidebar-game-info">
                <strong>Selected game</strong>
                <span>Current game workspace</span>
              </div>

              <span className="selected-indicator">✓</span>
            </div>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">Game navigation</span>

            <nav className="sidebar-navigation">
              <Link to="/games">
                <span className="sidebar-nav-icon">←</span>
                All games
              </Link>

              <Link
                className="active"
                to={`/games/${gameId}/monitoring`}
              >
                <span className="sidebar-nav-icon">◆</span>
                Checkpoints
              </Link>
            </nav>
          </div>

          <div className="sidebar-section sidebar-checkpoint-section">
            <div className="sidebar-section-title">
              <span className="sidebar-label">Checkpoints</span>

              <span className="sidebar-count">
                {checkpoints.length}
              </span>
            </div>

            <div className="sidebar-checkpoint-list">
              {checkpoints.length === 0 && (
                <p className="sidebar-empty">
                  No checkpoints yet.
                </p>
              )}

              {checkpoints.map((checkpoint, index) => (
                <div
                  className="sidebar-checkpoint-item"
                  key={checkpoint.id}
                >
                  {checkpoint.snapshotReference ? (
                    <img
                      src={checkpoint.snapshotReference}
                      alt=""
                    />
                  ) : (
                    <div className="sidebar-checkpoint-placeholder">
                      {index + 1}
                    </div>
                  )}

                  <div className="sidebar-checkpoint-info">
                    <strong>{checkpoint.title}</strong>

                    <span>
                      {checkpoint.unlocks.length}{" "}
                      {checkpoint.unlocks.length === 1
                        ? "player unlock"
                        : "player unlocks"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* STEP 1 — CREATE CHECKPOINT */}
        <form
          className="learning-panel workspace-panel"
          onSubmit={saveCheckpoint}
        >
          <div className="panel-heading">
            <span className="step-number">1</span>

            <div>
              <h2>Create gameplay checkpoint</h2>
              <p>
                Capture a meaningful point in the game and describe its
                achievement context.
              </p>
            </div>
          </div>

          <div className="capture-actions">
            <button
              type="button"
              onClick={captureScreen}
              disabled={capturing}
              aria-keyshortcuts="Alt+Shift+S"
              title={`Capture game screen (${shortcutModifier}+Shift+S)`}
            >
              {capturing
                ? desktopApi
                  ? "Capturing display..."
                  : "Opening screen picker..."
                : "Capture game screen"}
            </button>

            <label className="file-button">
              Upload screenshot
              <input
                type="file"
                accept="image/*"
                onChange={chooseScreenshot}
              />
            </label>
          </div>

          <p className="capture-shortcut-hint">
            {desktopApi ? (
              <>
                Desktop shortcut: <kbd>{shortcutModifier}</kbd> +{" "}
                <kbd>Shift</kbd> + <kbd>S</kbd> to capture the display
                under your pointer while playing.
              </>
            ) : (
              <>
                Press <kbd>{shortcutModifier}</kbd> + <kbd>Shift</kbd> +{" "}
                <kbd>S</kbd> on this page, or use the desktop app for
                global capture while playing.
              </>
            )}
          </p>

          {frame && (
            <figure className="capture-preview">
              <img
                src={frame.dataUrl}
                alt="Captured checkpoint"
              />

              <figcaption>
                Visual fingerprint <code>{frame.fingerprint}</code>
              </figcaption>
            </figure>
          )}

          <label>
            Checkpoint name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Found the crystal forge"
              required
            />
          </label>

          <label>
            What happened here?
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the area, decision, or collected material."
            />
          </label>

          <label>
            Developer achievement note
            <textarea
              value={developerNote}
              onChange={(event) => setDeveloperNote(event.target.value)}
              placeholder="What should players notice or reflect on?"
            />
          </label>

          <label>
            Visual tolerance: {threshold} bits
            <input
              type="range"
              min="0"
              max="24"
              value={threshold}
              onChange={(event) =>
                setThreshold(Number(event.target.value))
              }
            />

            <small>
              Higher values accept more visual variation. Twelve is a
              balanced demo default.
            </small>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={busy || !frame || !title.trim()}
          >
            {busy ? "Saving..." : "Save checkpoint"}
          </button>
        </form>

        {/* STEP 2 — GENERATE QUIZ */}
        <section className="learning-panel workspace-panel">
          <div className="panel-heading">
            <span className="step-number">2</span>

            <div>
              <h2>Generate achievement challenges</h2>
              <p>
                Choose the gameplay focus used to generate the challenge.
              </p>
            </div>
          </div>

          <label>
            Achievement focus
            <textarea
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="e.g. decision making, process optimisation, and resource flow"
            />
          </label>

          <div className="count-grid">
            <label>
              Multiple choice
              <input
                type="number"
                min="1"
                max="8"
                value={multipleChoiceCount}
                onChange={(event) =>
                  setMultipleChoiceCount(
                    Math.max(
                      1,
                      Math.min(8, Number(event.target.value) || 1),
                    ),
                  )
                }
              />
            </label>

            <label>
              Short answer
              <input
                type="number"
                min="0"
                max="4"
                value={shortAnswerCount}
                onChange={(event) =>
                  setShortAnswerCount(
                    Math.max(
                      0,
                      Math.min(4, Number(event.target.value) || 0),
                    ),
                  )
                }
              />
            </label>
          </div>

          <div className="checkpoint-list">
            {checkpoints.length === 0 && (
              <p className="empty-state">
                Save the first visual checkpoint to generate a quiz.
              </p>
            )}

            {checkpoints.map((checkpoint) => {
              const latestActivity =
                checkpoint.trigger?.activities?.[0];

              return (
                <article
                  className={`checkpoint-card ${
                    checkpoint.snapshotReference ? "" : "no-image"
                  }`}
                  key={checkpoint.id}
                >
                  {checkpoint.snapshotReference && (
                    <img
                      src={checkpoint.snapshotReference}
                      alt=""
                    />
                  )}

                  <div>
                    <span className="status-chip">
                      {checkpoint.unlocks.length}{" "}
                      {checkpoint.unlocks.length === 1
                        ? "player unlock"
                        : "player unlocks"}
                    </span>

                    <h3>{checkpoint.title}</h3>

                    <p>
                      {checkpoint.description ||
                        "No checkpoint description provided."}
                    </p>

                    <div className="checkpoint-actions">
                      <button
                        type="button"
                        disabled={
                          busy ||
                          generatingCheckpointId !== null ||
                          !focus.trim()
                        }
                        onClick={() =>
                          generateQuiz(checkpoint.id)
                        }
                      >
                        {generatingCheckpointId === checkpoint.id
                          ? "Generating..."
                          : "Generate quiz"}
                      </button>

                      {latestActivity && (
                        <Link
                          className="secondary-link"
                          to={`/games/${gameId}/activities?activityId=${latestActivity.id}`}
                        >
                          View quiz
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
