import { useState } from "react";
import type { ReactNode } from "react";

import { DemoSessionContext } from "./demoSession";
import type { DemoRole, DemoPlayer } from "./types";

const DEMO_PLAYERS: DemoPlayer[] = [
  {
    id: "demo-player-alex",
    name: "Alex Morgan",
  },
  {
    id: "demo-player-sam",
    name: "Sam Lee",
  },
];

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<DemoRole>("developer");
  const [playerId, setPlayerId] = useState(DEMO_PLAYERS[0].id);

  return (
    <DemoSessionContext.Provider
      value={{
        role,
        setRole,
        players: DEMO_PLAYERS,
        playerId,
        setPlayerId,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}
