
export interface QuizQuestion {
    question : string;
    options: string[];
    correctAnswers : string[];
}

export interface ShortAnswerQuestion {
    question: string;
    correctAnswers? : string[];
}

export type Question = QuizQuestion | ShortAnswerQuestion;

export function isQuizQuestion(q: Question): q is QuizQuestion {
    return 'options' in q && Array.isArray((q as QuizQuestion).options);
}

export interface Activity {
    id: string;
    unitId: string ;
    gameId: string;
    achievementId: string | null;
    createdBy: string;
    sourceLibraryItemId: string | null;
    title: string;
    description: string;
    type: 'quiz' | 'short_answer';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    config: {
        questions: Question[];
    }
}

export interface ExportTeachingActivity {
    id: string;
    gameId: string;
    title: string;
    description: string;
    type: 'quiz' | 'short_answer';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    questions: Question[];
}

export interface ClientActivityExportRequest {
    unitId: string;
    createdBy: string;
    achievementId? : string | null;
    sourceLibraryItemId? : string | null;
    activities: ExportTeachingActivity[];
}

export interface ClientTeachingActivityFile {
    unitId: string;
    activities: Activity[];
}
