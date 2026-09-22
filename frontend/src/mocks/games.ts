import type { GameSummary } from "../types/game";

import sampleAdventureImage from "../assets/sample-adventure.png";
import samplePuzzleImage from "../assets/sample-puzzle.png";
import sampleHistoryExplorerImage from "../assets/sample-history-explorer.png";

export const mockGames: GameSummary[] = [
    {
        id: "1001",
        externalId: 1001,
        title: "Sample Adventure",
        description:
            "Explore different environments and progress through a story-driven adventure.",
        publisher: "Sample Publisher A",
        studioName: "Sample Studio A",
        integrationType: "drm_free",
        iconUrl: sampleAdventureImage,
    },
    {
        id: "1002",
        externalId: 1002,
        title: "Sample Puzzle Lab",
        description:
            "Solve logic-based puzzles and complete increasingly complex challenges.",
        publisher: "Sample Publisher B",
        studioName: null,
        integrationType: "sdk",
        iconUrl: samplePuzzleImage,
    },
    {
        id: "1003",
        externalId: 1003,
        title: "Sample History Explorer",
        description:
            "Explore historical environments and discover significant events, places, and artefacts.",
        publisher: "Sample Publisher C",
        studioName: "Sample Studio C",
        integrationType: "drm_free",
        iconUrl: sampleHistoryExplorerImage,
    },
];