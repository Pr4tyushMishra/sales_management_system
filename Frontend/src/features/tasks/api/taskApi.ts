import { apiClient, withFallback } from '@/lib/apiClient';
import { Task } from '@/types';
import { SEED_TASKS } from '@/lib/mockData';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  /** ISO datetime string – sent as `dueAt` to backend */
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  relatedEntityType?: 'LEAD' | 'DEAL' | 'ACCOUNT';
  relatedEntityId?: string;
  relatedEntityName?: string;
  assignedToName?: string;
  notes?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  isCompleted?: boolean;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

/** Transforms the frontend-friendly payload into the shape the backend Zod schema expects */
function toBackendPayload(payload: CreateTaskPayload) {
  const {
    dueDate,
    relatedEntityType,
    relatedEntityId,
    relatedEntityName,
    description,
    ...rest
  } = payload;

  return {
    ...rest,
    notes: description ?? rest.notes,
    dueAt: dueDate ?? new Date(Date.now() + 86400000).toISOString(),
    relatedTo: {
      type: relatedEntityType ?? 'DEAL',
      id: relatedEntityId ?? 'general',
      name: relatedEntityName ?? 'General',
    },
  };
}

function normalizeTask(raw: any): Task {
  // Backend returns `dueAt`; frontend payload uses `dueDate`
  const dueDateRaw = raw.dueAt ?? raw.dueDate;
  // Backend returns a nested `relatedTo` object; frontend payload uses flat fields
  const relatedTo = raw.relatedTo ?? {
    type: raw.relatedEntityType,
    id: raw.relatedEntityId,
    name: raw.relatedEntityName,
  };

  return {
    id: raw.id || raw._id?.toString() || `task_${Date.now()}`,
    organizationId: raw.organizationId || 'org_acme_corp',
    title: raw.title || 'Follow up with client',
    dueDate: dueDateRaw
      ? new Date(dueDateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Today at 6:00 PM',
    isCompleted: raw.isCompleted ?? raw.status === 'COMPLETED',
    priority: raw.priority || 'HIGH',
    relatedTo: {
      type: relatedTo?.type || 'DEAL',
      id: relatedTo?.id || 'general',
      name: relatedTo?.name || 'General',
    },
    assignedToName: raw.assignedToName || 'Unassigned',
  };
}

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    return await withFallback(
      (async () => {
        const response = await apiClient.get<any[]>('/tasks');
        const items = Array.isArray(response) ? response : [];
        return items.map(normalizeTask);
      })(),
      SEED_TASKS,
      'Tasks Subsystem'
    );
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const backendPayload = toBackendPayload(payload);
    return await withFallback(
      (async () => {
        const created = await apiClient.post<any>('/tasks', backendPayload);
        return normalizeTask(created);
      })(),
      normalizeTask({
        ...payload,
        id: `task_${Date.now()}`,
      }),
      'Task Creation'
    );
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    return await withFallback(
      (async () => {
        const updated = await apiClient.patch<any>(`/tasks/${id}`, payload);
        return normalizeTask(updated);
      })(),
      normalizeTask({ id, ...payload }),
      'Task Update'
    );
  },

  deleteTask: async (id: string): Promise<boolean> => {
    return await withFallback(
      (async () => {
        await apiClient.delete(`/tasks/${id}`);
        return true;
      })(),
      true,
      'Task Deletion'
    );
  },
};
