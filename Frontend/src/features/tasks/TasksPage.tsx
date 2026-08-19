import { useState } from 'react';
import { Task } from '@/types';
import { KPICard } from '@/components/patterns/KPICard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  User,
  Building,
} from 'lucide-react';

import { useTasks } from './hooks/useTasks';

export function TasksPage() {
  const { tasks, createTask, toggleTask } = useTasks();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('HIGH');
  const { addToast } = useUIStore();

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextState = !task.isCompleted;
    toggleTask(taskId, nextState);
    addToast({
      type: nextState ? 'success' : 'info',
      title: nextState ? 'Task Marked Done' : 'Task Reopened',
      message: task.title,
    });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    await createTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });

    setIsNewTaskOpen(false);
    setNewTaskTitle('');
  };

  const priorityColors = {
    URGENT: 'bg-rose-100 text-rose-800 border-rose-200',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
    LOW: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Tasks, Meetings & SLA Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time SLA breach monitoring and priority action items.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsNewTaskOpen(true)}
        >
          Create Task
        </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-active-tasks">
          <KPICard
            label="Pending Tasks"
            value={tasks.filter((t) => !t.isCompleted).length}
            subtext="Due within 24h"
            accent="blue"
            icon={<CheckSquare className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-sla-breach-risk">
          <KPICard
            label="SLA Breach Risk (<1h)"
            value="1"
            delta="Critical"
            deltaDirection="down"
            deltaLabel="Action required"
            accent="rose"
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-completed-tasks">
          <KPICard
            label="Completed Today"
            value={tasks.filter((t) => t.isCompleted).length}
            delta="+3"
            deltaDirection="up"
            deltaLabel="on track"
            accent="green"
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-upcoming-meetings">
          <KPICard
            label="Scheduled Meetings"
            value="3"
            subtext="Next at 2:00 PM"
            accent="neutral"
            icon={<Calendar className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Task List */}
      <WidgetBoundary name="tasks-list">
        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 divide-y divide-neutral-100">
          <div className="p-fib-13 bg-neutral-50 flex items-center justify-between font-bold text-xs text-neutral-800">
            <span>Action Item</span>
            <span>Priority & SLA Status</span>
          </div>

          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={cn(
                'p-fib-13 flex items-start justify-between gap-fib-13 cursor-pointer hover:bg-neutral-50 transition-colors select-none',
                task.isCompleted && 'opacity-60 bg-neutral-50/50'
              )}
            >
              <div className="flex items-start gap-fib-8">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <h4
                    className={cn(
                      'text-xs font-bold text-neutral-900',
                      task.isCompleted && 'line-through text-neutral-500'
                    )}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-fib-8 text-[11px] text-neutral-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-neutral-700">
                      <Building className="w-3 h-3 text-neutral-400" />
                      {task.relatedTo.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {task.dueDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-neutral-400" />
                      {task.assignedToName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-fib-8 shrink-0">
                {task.slaBreachInMinutes && !task.isCompleted && (
                  <span className="text-[10px] font-bold px-fib-5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    SLA risk: {task.slaBreachInMinutes}m left
                  </span>
                )}
                <span
                  className={cn(
                    'text-[10px] font-bold px-fib-5 py-0.5 rounded-pill border uppercase tracking-wider',
                    priorityColors[task.priority]
                  )}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </WidgetBoundary>

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-fib-13">
          <div
            onClick={() => setIsNewTaskOpen(false)}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in"
          />
          <div className="relative w-full max-w-md skeuo-raised-3 bg-white rounded-xl border border-neutral-200 p-fib-21 z-10 shadow-2xl space-y-fib-13">
            <h3 className="text-base font-bold text-neutral-900">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-fib-13">
              <Input
                label="Task Title *"
                placeholder="e.g. Follow up on proposal terms"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                  className="w-full skeuo-sunken text-xs px-fib-8 py-fib-8 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-900 outline-none"
                >
                  <option value="URGENT">Urgent (SLA Triggered)</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="pt-fib-13 border-t border-neutral-100 flex items-center justify-end gap-fib-8">
                <Button type="button" variant="ghost" onClick={() => setIsNewTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
