import { useEffect, useState } from "react";
import "./GameAnalysisStatus.css";
import {
  mockGetAnalysis,
  mockStartAnalysis,
  type AnalysisStatus,
} from "../../mocks/analysis";

type GameAnalysisStatusProps = {
  gameId: string;
};

export default function GameAnalysisStatus({
  gameId,
}: GameAnalysisStatusProps) {
  const [status, setStatus] = useState<AnalysisStatus>("required");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAnalysisStatus = async () => {
    try {
      setLoading(true);

      const data = await mockGetAnalysis(gameId);

      setStatus(data.status);
      setMessage("");
    } catch (error) {
      console.error("Error checking analysis status:", error);

      setStatus("failed");
      setMessage("Unable to retrieve the current analysis status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    mockGetAnalysis(gameId)
      .then((data) => {
        if (!active) return;
        setStatus(data.status);
        setMessage("");
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Error checking analysis status:", error);
        setStatus("failed");
        setMessage("Unable to retrieve the current analysis status.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gameId]);

  const handleStartAnalysis = async () => {
    try {
      setStatus("processing");
      setMessage("Starting game analysis...");

      const data = await mockStartAnalysis(gameId);

      setStatus(data.status);
      setMessage("The game analysis has been completed successfully.");
    } catch (error) {
      console.error("Error starting analysis:", error);

      setStatus("failed");
      setMessage("The game analysis could not be started.");
    }
  };

  const handleUseExistingAnalysis = () => {
    console.log(`Using existing analysis for game ${gameId}`);
  };

  const handleViewAnalysis = () => {
    console.log(`Viewing analysis for game ${gameId}`);

    // Later this could use React Router:
    // navigate(`/games/${gameId}/analysis`);
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="analysis-card">
        <h2>Game Analysis</h2>

        <div className="analysis-status processing">
          <h3>Checking Analysis</h3>
          <p>Checking whether analysis already exists for this game...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Interface
  // --------------------------------------------------

  return (
    <div className="analysis-card">
      <h2>Game Analysis</h2>

      <div className={`analysis-status ${status}`}>
        {status === "required" && (
          <>
            <span className="status-label">Analysis Required</span>

            <h3>This game has not been analysed yet</h3>

            <p>
              Start an analysis before generating achievement challenges for this
              game.
            </p>

            <div className="analysis-option-buttons">
              <button className="primary-button" onClick={handleStartAnalysis}>
                Start Automatic Analysis
              </button>

              <button
                className="primary-button manual-analysis-button"
                type="button"
              >
                Start Manual Analysis
              </button>
            </div>
          </>
        )}

        {status === "existing" && (
          <>
            <span className="status-label">Existing Analysis</span>

            <h3>Reusable analysis is available</h3>

            <p>
              This game has already been analysed. You can reuse the stored
              analysis instead of starting another analysis.
            </p>

            <button
              className="primary-button"
              onClick={handleUseExistingAnalysis}
            >
              Use Existing Analysis
            </button>
          </>
        )}

        {status === "processing" && (
          <>
            <span className="status-label">Processing</span>

            <h3>Analysis in progress</h3>

            <p>{message || "The game is currently being analysed."}</p>

            <button className="primary-button" disabled>
              Processing...
            </button>
          </>
        )}

        {status === "completed" && (
          <>
            <span className="status-label">Completed</span>

            <h3>Analysis completed successfully</h3>

            <p>
              {message ||
                "The game analysis is ready to generate achievement challenges."}
            </p>

            <button className="primary-button" onClick={handleViewAnalysis}>
              View Analysis
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <span className="status-label">Failed</span>

            <h3>Analysis failed</h3>

            <p>
              {message ||
                "The analysis could not be completed. Please try again."}
            </p>

            <div className="button-group">
              <button className="primary-button" onClick={handleStartAnalysis}>
                Retry Analysis
              </button>

              <button
                className="secondary-button"
                onClick={fetchAnalysisStatus}
              >
                Refresh Status
              </button>
            </div>
          </>
        )}

        {status === "limited" && (
          <>
            <span className="status-label">Limited Analysis</span>

            <h3>Partial analysis is available</h3>

            <p>
              {message ||
                "The system could only generate limited analysis for this game."}
            </p>

            <button className="primary-button" onClick={handleViewAnalysis}>
              Use Available Analysis
            </button>
          </>
        )}
      </div>

      <button className="refresh-button" onClick={fetchAnalysisStatus}>
        Refresh Analysis Status
      </button>
    </div>
  );
}
