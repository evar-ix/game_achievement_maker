import type { Question } from './types';
import { isQuizQuestion } from './types';
import { QuizQuestionView } from './QuizQuestionView';
import { ShortAnswerQuestionView } from './ShortAnswerQuestionView';

interface Props {
  question: Question;
  index: number;
}

export function QuestionItem({ question, index }: Props) {
  if (isQuizQuestion(question)) {
    return <QuizQuestionView question={question} index={index} />;
  }
  return <ShortAnswerQuestionView question={question} index={index} />;
}