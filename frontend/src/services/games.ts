import { apiRequest } from "./api";
import type { GameSummary } from "../types/game";

export async function getGames(): Promise<GameSummary[]> {
    return apiRequest<GameSummary[]>("/games");
}