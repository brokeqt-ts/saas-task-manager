import { TaskStatus, Priority, Role, NotificationType } from "@prisma/client";

export type { TaskStatus, Priority, Role, NotificationType };

export interface UserSession {
  id: string;
  name: string;
  email: string;
}

export interface ProjectWithMeta {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
    tasks: number;
  };
  members: MemberWithUser[];
}

export interface MemberWithUser {
  id: string;
  role: Role;
  userId: string;
  projectId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  order: number;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  taskId: string | null;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  URGENT: "Срочно",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-gray-200 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
};
