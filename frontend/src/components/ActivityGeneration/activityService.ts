import type {
  Activity,
  ClientActivityExportRequest,
  ClientTeachingActivityFile,
} from './types';

import { apiRequest } from '../../services/api';

export async function exportActivityToClientJson(
  request: ClientActivityExportRequest,
): Promise<ClientTeachingActivityFile> {
  return apiRequest<ClientTeachingActivityFile>('/activities/client-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
}

export async function getActivityById(
  activityId: string,
): Promise<Activity> {
  return apiRequest<Activity>(`/activities/${activityId}`);
}

export async function updateActivity(
  activity: Activity,
): Promise<Activity> {
  return apiRequest<Activity>(`/activities/${activity.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: activity.title,
      description: activity.description,
      questions: activity.config.questions,
    }),
  });
}