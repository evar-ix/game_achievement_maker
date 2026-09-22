export type AnalysisStatus =
| "required" | "existing" | "processing" | "completed" | "failed" | "limited";

export interface MockAnalysisResponse {
    gameId: string;
    status: AnalysisStatus;
}

export async function mockGetAnalysis(
    gameId: string
): Promise<MockAnalysisResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        gameId,
        status: "required",
    };
}

export async function mockStartAnalysis(
    gameId: string
) : Promise<MockAnalysisResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
        gameId,
        status: "completed",
    };
}