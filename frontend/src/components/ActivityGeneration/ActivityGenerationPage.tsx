import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Activity } from './types';
import { ActivityCard } from './ActivityCard';
import { EditableActivityCard } from './EditableActivityCard';
import { useEditableActivities } from './hooks/useEditableActivities';
import { exportActivityToClientJson, getActivityById, updateActivity } from './activityService';
import { downloadJson } from './downloadJson';
import '../../pages/LearningPages.css';
import './ActivityGeneration.css';


export function ActivityGenerationPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();

  const activityId = searchParams.get('activityId');

  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [activityLoadState, setActivityLoadState] = useState<{
    activityId: string | null;
    error: string | null;
  }>({
    activityId: null,
    error: null,
  });

  const isLoadingActivity = Boolean(
    activityId && activityLoadState.activityId !== activityId,
  );

  const loadError =
    activityLoadState.activityId === activityId
      ? activityLoadState.error
      : null;

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const {
    activities,
    replaceActivities,
    updateQuestionText,
    updateQuizOption,
    toggleCorrectAnswer,
  } = useEditableActivities([]);

  useEffect(() => {
    if (!activityId) {
      return;
    }

    let cancelled = false;

    getActivityById(activityId)
      .then((activity) => {
        if (cancelled) return;

        replaceActivities([activity]);
        setEditingIds(new Set());
        setActivityLoadState({
          activityId,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setActivityLoadState({
          activityId,
          error:
            error instanceof Error
              ? error.message
              : 'Could not load the generated quiz.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [activityId, replaceActivities]);

  const toggleEditing = (activityId: string) => {
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  };

  const handleSaveActivity = async (activity: Activity) => {
    const savedActivity = await updateActivity(activity);

    replaceActivities(
      activities.map((item) =>
        item.id === savedActivity.id
          ? savedActivity
          : item,
      ),
    );
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      const exportActivities = activities.map(activity => ({
        id: activity.id,
        gameId: activity.gameId,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        isActive: activity.isActive,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        questions: activity.config.questions,
      }));

      const exportData = await exportActivityToClientJson({
        unitId: '',
        createdBy: activities[0]?.createdBy ?? '',
        activities: exportActivities,
      });

      downloadJson(
        exportData,
        `achievement-challenges-${gameId ?? 'game'}.json`
      );
    } catch (error) {
     console.error('Failed to export achievement challenges:', error);
     setExportError('Failed to export achievement challenges.');
     } finally {
      setIsExporting(false);
      }
  };

  return (
    <main className="learning-page">
      <header className="learning-hero">
        <div>
          <span className="eyebrow">Developer workspace</span>
          <h1>Achievement challenges</h1>
          <p>
            Review the quiz generated from your gameplay checkpoint, edit anything
            that needs changing, and export it as client JSON.
          </p>
        </div>
        <Link className="secondary-link" to={`/games/${gameId}/monitoring`}>
          Back to checkpoints
        </Link>
      </header>

      {loadError && <p className="notice error">{loadError}</p>}
      {exportError && <p className="notice error">{exportError}</p>}
      {isLoadingActivity && <p className="empty-state">Loading generated quiz…</p>}

      {!activityId && (
        <p className="empty-state">
          Select a generated quiz from a gameplay checkpoint to review it.
        </p>
      )}

      {activities.length > 0 && (
        <>
          <section className="material-list">
            {activities.map(activity =>
              editingIds.has(activity.id) ? (
                <EditableActivityCard
                  key={activity.id}
                  activity={activity}
                  onQuestionTextChange={(qIdx, text) => updateQuestionText(activity.id, qIdx, text)}
                  onOptionTextChange={(qIdx, optIdx, text) => updateQuizOption(activity.id, qIdx, optIdx, text)}
                  onToggleCorrect={(qIdx, optText) => toggleCorrectAnswer(activity.id, qIdx, optText)}
                  onSave={activityId ? handleSaveActivity : undefined}
                  onDoneEditing={() => toggleEditing(activity.id)}
                />
              ) : (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={() => toggleEditing(activity.id)}
                />
              )
            )}
          </section>

          <button
            type="button"
            className="primary-button"
            onClick={handleExport}
            disabled={isExporting || activities.length === 0}
          >
            {isExporting ? 'Exporting…' : 'Export to JSON'}
          </button>
        </>
      )}
    </main>
  );
}
