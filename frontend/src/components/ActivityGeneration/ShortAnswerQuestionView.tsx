import type { ShortAnswerQuestion } from './types';

interface Props {
  question: ShortAnswerQuestion;
  index: number;
}

export function ShortAnswerQuestionView({ question, index }: Props) {
  return (
    <div className="question-item question-item--short-answer">
      <p className="question-item__prompt">
        {index + 1}. {question.question}
      </p>
      <p className="question-item__hint">(Short-answer — no fixed correct answer)</p>
    </div>
  );
}