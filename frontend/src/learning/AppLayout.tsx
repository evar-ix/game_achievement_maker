import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useDemoSession } from "./demoSession";
import type { DemoRole } from "./types";

export function AppLayout() {
  const { role, setRole, players, playerId, setPlayerId } = useDemoSession();
  const location = useLocation();
  const navigate = useNavigate();
  const gameId = location.pathname.match(/^\/games\/([^/]+)/)?.[1];

  const handleRoleChange = (nextRole: DemoRole) => {
    setRole(nextRole);

    if (gameId) {
      navigate(
        nextRole === "developer"
          ? `/games/${gameId}/monitoring`
          : `/games/${gameId}/learn`,
      );
    }
  };

  return (
    <>
      <header className="demo-header">
        <Link className="demo-brand" to="/games">
          Game Achievement Maker
        </Link>
        <nav className="demo-nav" aria-label="Demo navigation">
          <Link to="/games">Games</Link>
          {gameId && role === "developer" && (
            <Link to={`/games/${gameId}/monitoring`}>Checkpoints</Link>
          )}
          {gameId && role === "player" && (
            <Link to={`/games/${gameId}/learn`}>My achievements</Link>
          )}
        </nav>
        <div className="demo-session-controls">
          <label>
            View as
            <select
              value={role}
              onChange={(event) =>
                handleRoleChange(event.target.value as DemoRole)
              }
            >
              <option value="developer">Developer</option>
              <option value="player">Player</option>
            </select>
          </label>
          {role === "player" && (
            <label>
              Demo player
              <select
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>
      <Outlet />
    </>
  );
}
