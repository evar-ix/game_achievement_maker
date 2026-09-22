import { useState } from 'react';
import type { Activity } from './types';
import { EditableQuestionItem } from './EditableQuestionItem';

interface Props {
  activity: Activity;
  onQuestionTextChange: (questionIndex: number, text: string) => void;
  onOptionTextChange: (questionIndex: number, optionIndex: number, text: string) => void;
  onToggleCorrect: (questionIndex: number, optionText: string) => void;
  onSave?: (activity: Activity) => Promise<void>;
  onDoneEditing: () => void;
}

export function EditableActivityCard({
  activity,
  onQuestionTextChange,
  onOptionTextChange,
  onToggleCorrect,
  onSave,
  onDoneEditing,
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!onSave) {
      onDoneEditing();
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      await onSave(activity);

      onDoneEditing();
    } catch (error) {
      console.error('Failed to save activity:', error);

      setSaveError(
        error instanceof Error
          ? error.message
          : 'Failed to save changes.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="activity-card activity-card--editing">
      <div className="activity-card__header">
        <h3 className="activity-card__title">{activity.title}</h3>
      </div>
      <p className="activity-card__description">{activity.description}</p>



      <div className="activity-card__questions">
        {activity.config.questions.map((q, i) => (
          <EditableQuestionItem
            key={i}
            question={q}
            index={i}
            onQuestionTextChange={text => onQuestionTextChange(i, text)}
            onOptionTextChange={(optIdx, text) => onOptionTextChange(i, optIdx, text)}
            onToggleCorrect={optText => onToggleCorrect(i, optText)}
          />
        ))}
      </div>

      <button
        className="activity-card__save-btn"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving
          ? 'Saving...'
          : onSave
            ? 'Save changes'
            : 'Done Editing'}
      </button>

      {saveError && (
        <p className="activity-card__save-error">
          {saveError}
        </p>
      )}
    </div>
  );
}