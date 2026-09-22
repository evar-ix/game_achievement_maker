import type { Question } from './types';
import { isQuizQuestion } from './types';
import { EditableQuizQuestionView } from './EditableQuizQuestionView';
import { EditableShortAnswerQuestionView } from './EditableShortAnswerQuestionView';

interface Props {
  question: Question;
  index: number;
  onQuestionTextChange: (text: string) => void;
  onOptionTextChange?: (optionIndex: number, text: string) => void;
  onToggleCorrect?: (optionText: string) => void;
}

export function EditableQuestionItem({
  question,
  index,
  onQuestionTextChange,
  onOptionTextChange,
  onToggleCorrect,
}: Props) {
  if (isQuizQuestion(question)) {
    return (
      <EditableQuizQuestionView
        question={question}
        index={index}
        onQuestionTextChange={onQuestionTextChange}
        onOptionTextChange={onOptionTextChange!}
        onToggleCorrect={onToggleCorrect!}
      />
    );
  }
  return (
    <EditableShortAnswerQuestionView
      question={question}
      index={index}
      onQuestionTextChange={onQuestionTextChange}
    />
  );
}