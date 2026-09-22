import { Link, useParams } from "react-router-dom";
import GameAnalysisStatus from "../components/GameAnalysis/GameAnalysisStatus";

function GameAnalysisPage() {
  const { gameId } = useParams<{ gameId: string }>();

  if (!gameId) {
    return <main>Game not found.</main>;
  }

  return (
    <main>
      <GameAnalysisStatus gameId={gameId} />

      <Link to={`/games/${gameId}/monitoring`}>
        Continue to Gameplay Checkpoints
      </Link>
    </main>
  );
}

export default GameAnalysisPage;