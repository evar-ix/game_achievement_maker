import { createContext, useContext } from "react";

import type { DemoRole, DemoPlayer } from "./types";

export interface DemoSessionValue {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  players: DemoPlayer[];
  playerId: string;
  setPlayerId: (playerId: string) => void;
}

export const DemoSessionContext = createContext<DemoSessionValue | undefined>(
  undefined,
);

export function useDemoSession() {
  const session = useContext(DemoSessionContext);

  if (!session) {
    throw new Error("useDemoSession must be used inside DemoSessionProvider.");
  }

  return session;
}
