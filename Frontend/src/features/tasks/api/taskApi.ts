import { apiClient, withFallback } from '@/lib/apiClient';
import { Task } from '@/types';
import { SEED_TASKS } from '@/lib/mockData';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  relatedEntityType?: 'LEAD' | 'DEAL' | 'CALL' | 'INVOICE' | 'GENERAL';
  relatedEntityId?: string;
  relatedEntityName?: string;
  assignedTo?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  isCompleted?: boolean;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

function normalizeTask(raw: any): Task {
  return {
    id: raw.id || raw._id?.toString() || `task_${Date.now()}`,
    organizationId: raw.organizationId || 'org_acme_corp',
    title: raw.title || 'Follow up with client',
    dueDate: raw.dueDate ? new Date(raw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today at 6:00 PM',
    isCompleted: raw.isCompleted ?? raw.status === 'COMPLETED',
    priority: raw.priority || 'HIGH',
    relatedTo: {
      type: raw.relatedEntityType || 'DEAL',
      id: raw.relatedEntityId || 'deal_01',
      name: raw.relatedEntityName || 'General Follow-up',
    },
    assignedToName: raw.assignedToName || 'Devon Patel',
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
    return await withFallback(
      (async () => {
        const created = await apiClient.post<any>('/tasks', payload);
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
