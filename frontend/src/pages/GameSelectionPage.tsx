import "./GameSelectionPage.css";
import { useEffect, useState } from "react";
import GameCard from "../components/GameSelection/GameCard";
import { getGames } from "../services/games";
import type { GameSummary } from "../types/game";

function GameSelectionPage() {

  /* STATE */

  const [games, setGames] = useState<GameSummary[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* LOAD GAMES */

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getGames();
        setGames(data);
      } catch (error) {
        console.error("Failed to load games:", error);
        setError("Unable to load games. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);


  /* GAME SELECTION */

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId((currentGameId) =>
      currentGameId === gameId
        ? null
        : gameId
    );
  };


  /* PAGE */

  return (
    <main className="game-selection-page">

      {/* PAGE HEADER */}

      <header className="game-selection-header">
        <h1>Select a Game</h1>
        <p>
          Choose a game to design achievements or test them as a player.
        </p>
      </header>


      {/* LOADING / ERROR */}

      {loading && (
        <p className="game-selection-status">
          Loading games...
        </p>
      )}

      {error && (
        <p className="game-selection-error">
          {error}
        </p>
      )}


      {/* GAME GRID */}

      {!loading && !error && (
        <section className="game-list">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              selected={selectedGameId === game.id}
              onSelect={handleGameSelect}
            />
          ))}
        </section>
      )}

    </main>
  );
}

export default GameSelectionPage;
