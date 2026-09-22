import type { QuizQuestion } from './types';

interface Props {
  question: QuizQuestion;
  index: number;
  onQuestionTextChange: (text: string) => void;
  onOptionTextChange: (optionIndex: number, text: string) => void;
  onToggleCorrect: (optionText: string) => void;
}

export function EditableQuizQuestionView({
  question,
  index,
  onQuestionTextChange,
  onOptionTextChange,
  onToggleCorrect,
}: Props) {
  return (
    <div className="question-item question-item--quiz question-item--editable">
      <label className="question-item__label">Question {index + 1}</label>
      <input
        type="text"
        className="question-item__input"
        value={question.question}
        onChange={e => onQuestionTextChange(e.target.value)}
      />

      <ul className="question-item__options question-item__options--editable">
        {question.options.map((opt, i) => {
          const isCorrect = question.correctAnswers.includes(opt);
          return (
            <li key={i} className="option-editable">
              <input
                type="checkbox"
                checked={isCorrect}
                onChange={() => onToggleCorrect(opt)}
                title="Mark as correct answer"
              />
              <input
                type="text"
                value={opt}
                onChange={e => onOptionTextChange(i, e.target.value)}
                className={
                  isCorrect
                    ? 'option-editable__text option-editable__text--correct'
                    : 'option-editable__text'
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}