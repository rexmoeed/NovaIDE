import { Task, TaskPriority, TaskStatus } from '../types/task';

export function filterTasks(tasks: Task[], status?: TaskStatus, priority?: TaskPriority): Task[] {
  return tasks.filter(t => {
    if (status && t.status !== status) return false;
    if (priority && t.priority !== priority) return false;
    return true;
  });
}

export function canTransitionTask(from: TaskStatus, to: TaskStatus, userRole: string): boolean {
  if (from === to) return true;
  if (userRole === 'admin') return true;
  if (userRole === 'member' && from === 'todo' && to === 'done') {
    return false;
  }
  return true;
}

export function getPriorityWeight(priority: TaskPriority): number {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
}
