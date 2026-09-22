import type { Activity } from './types';
import { QuestionItem } from './QuestionItem';

interface Props {
  activity: Activity;
  onEdit: () => void;
}

export function ActivityCard({ activity, onEdit }: Props) {
  return (
    <div className="activity-card">
      <div className="activity-card__header">
        <h3 className="activity-card__title">{activity.title}</h3>
        <button className="activity-card__edit-btn" onClick={onEdit}>
          Edit
        </button>
      </div>
      <p className="activity-card__description">{activity.description}</p>


      <div className="activity-card__questions">
        {activity.config.questions.map((q, i) => (
          <QuestionItem key={i} question={q} index={i} />
        ))}
      </div>
    </div>
  );
}