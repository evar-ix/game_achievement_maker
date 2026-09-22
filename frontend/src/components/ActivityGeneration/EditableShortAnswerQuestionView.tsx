import type { ShortAnswerQuestion } from './types';

interface Props {
  question: ShortAnswerQuestion;
  index: number;
  onQuestionTextChange: (text: string) => void;
}

export function EditableShortAnswerQuestionView({
  question,
  index,
  onQuestionTextChange,
}: Props) {
  return (
    <div className="question-item question-item--short-answer question-item--editable">
      <label className="question-item__label">Question {index + 1}</label>
      <textarea
        className="question-item__input question-item__input--textarea"
        value={question.question}
        onChange={e => onQuestionTextChange(e.target.value)}
        rows={2}
      />
      <p className="question-item__hint">(Short-answer — no fixed correct answer)</p>
    </div>
  );
}