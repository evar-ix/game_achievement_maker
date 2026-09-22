import type { QuizQuestion } from './types';

interface Props {
  question: QuizQuestion;
  index: number;
}

export function QuizQuestionView({ question, index }: Props) {
  return (
    <div className="question-item question-item--quiz">
      <p className="question-item__prompt">
        {index + 1}. {question.question}
      </p>
      <ul className="question-item__options">
        {question.options.map((opt, i) => {
          const isCorrect = question.correctAnswers.includes(opt);
          return (
            <li key={i} className={isCorrect ? 'option--correct' : ''}>
              {opt}
            </li>
          );
        })}
      </ul>
    </div>
  );
}