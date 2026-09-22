import { useState } from 'react';
import type { Activity, QuizQuestion } from '../types';

export function useEditableActivities(initialActivities: Activity[]) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  function updateQuestionText(activityId: string, questionIndex: number, newText: string) {
    setActivities(prev =>
      prev.map(activity => {
        if (activity.id !== activityId) return activity;
        const questions = [...activity.config.questions];
        questions[questionIndex] = { ...questions[questionIndex], question: newText };
        return { ...activity, config: { ...activity.config, questions } };
      })
    );
  }

  function updateQuizOption(activityId: string, questionIndex: number, optionIndex: number, newText: string) {
    setActivities(prev =>
      prev.map(activity => {
        if (activity.id !== activityId) return activity;
        const questions = [...activity.config.questions];
        const q = questions[questionIndex] as QuizQuestion;
        const oldText = q.options[optionIndex];
        const options = [...q.options];
        options[optionIndex] = newText;
        const correctAnswers = q.correctAnswers.map(ans => (ans === oldText ? newText : ans));
        questions[questionIndex] = { ...q, options, correctAnswers };
        return { ...activity, config: { ...activity.config, questions } };
      })
    );
  }

  function toggleCorrectAnswer(activityId: string, questionIndex: number, optionText: string) {
    setActivities(prev =>
      prev.map(activity => {
        if (activity.id !== activityId) return activity;
        const questions = [...activity.config.questions];
        const q = questions[questionIndex] as QuizQuestion;
        const isCurrentlyCorrect = q.correctAnswers.includes(optionText);
        const correctAnswers = isCurrentlyCorrect
          ? q.correctAnswers.filter(a => a !== optionText)
          : [...q.correctAnswers, optionText];
        questions[questionIndex] = { ...q, correctAnswers };
        return { ...activity, config: { ...activity.config, questions } };
      })
    );
  }

  return {
    activities,
    replaceActivities: setActivities,
    updateQuestionText,
    updateQuizOption,
    toggleCorrectAnswer,
  };
}
