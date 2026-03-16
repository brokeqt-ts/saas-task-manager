"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import type { TaskStatus, Priority } from "@/types";
import { useLocale } from "@/components/providers/language-provider";
import { Avatar } from "@/components/ui/avatar";
import { ClockIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface MyTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  project: { id: string; name: string };
  assignee: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string; email: string };
}

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};
const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
};

function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function formatDeadline(deadline: string | null, t: (key: string) => string): string {
  if (!deadline) return "";
  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.round(diffMs / 3600000);
  const diffD = Math.round(diffMs / 86400000);

  if (diffMs < 0) {
    const overH = Math.abs(diffH);
    if (overH < 24) return t("myTasks.overdueHours").replace("{hours}", String(overH));
    return t("myTasks.overdueDays").replace("{days}", String(Math.abs(diffD)));
  }
  if (diffH < 1) return t("myTasks.lessThanHour");
  if (diffH < 24) return t("myTasks.hoursLeft").replace("{hours}", String(diffH));
  if (diffD < 7) return t("myTasks.daysLeft").replace("{days}", String(diffD));
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", timeZone: "Europe/Moscow" });
}

type FilterTab = "active" | "done";

export function MyTasksList() {
  const { t } = useLocale();
  const { data: allTasks = [] } = useSWR<MyTask[]>("/api/my-tasks", { refreshInterval: 30000 });
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null);
  const [tab, setTab] = useState<FilterTab>("active");

  const activeTasks = allTasks.filter((t) => t.status !== "DONE");
  const doneTasks = allTasks.filter((t) => t.status === "DONE");
  const tasks = tab === "active" ? activeTasks : doneTasks;

  return (
    <div className="max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => setTab("active")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "active"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {t("myTasks.active")} ({activeTasks.length})
        </button>
        <button
          onClick={() => setTab("done")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "done"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {t("myTasks.completed")} ({doneTasks.length})
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">{t("myTasks.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const overdue = isOverdue(task.deadline) && task.status !== "DONE";
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer hover:shadow-sm transition-shadow ${
                  overdue ? "border-red-200 bg-red-50/30" : "border-gray-200"
                }`}
              >
                {/* Priority dot */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === "URGENT" ? "bg-red-500" :
                    task.priority === "HIGH" ? "bg-orange-500" :
                    task.priority === "MEDIUM" ? "bg-blue-500" : "bg-gray-400"
                  }`}
                />

                {/* Title + project */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 truncate">{task.project.name}</p>
                </div>

                {/* Status badge */}
                <span className={`hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
                  {t(`status.${task.status}`)}
                </span>

                {/* Deadline */}
                {task.deadline && (
                  <span className={`flex items-center gap-1 text-xs flex-shrink-0 ${
                    overdue ? "text-red-500 font-medium" : "text-gray-400"
                  }`}>
                    <ClockIcon className="w-3.5 h-3.5" />
                    {formatDeadline(task.deadline, t)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task detail slide-over */}
      {selectedTask && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedTask(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">{t("task.details")}</span>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">{selectedTask.title}</h2>

              {selectedTask.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedTask.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{t("task.status")}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[selectedTask.status]}`}>
                    {t(`status.${selectedTask.status}`)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">{t("task.priority")}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[selectedTask.priority]}`}>
                    {t(`priority.${selectedTask.priority}`)}
                  </span>
                </div>
              </div>

              {selectedTask.deadline && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">{t("task.deadline")}</p>
                  <p className={`text-sm ${isOverdue(selectedTask.deadline) && selectedTask.status !== "DONE" ? "text-red-500 font-medium" : "text-gray-700"}`}>
                    {new Date(selectedTask.deadline).toLocaleString("ru-RU", {
                      day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                      timeZone: "Europe/Moscow",
                    })}
                    {isOverdue(selectedTask.deadline) && selectedTask.status !== "DONE" && (
                      <span className="ml-2">{t("task.overdue")}</span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 mb-1">{t("myTasks.project")}</p>
                <p className="text-sm text-gray-700">{selectedTask.project.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">{t("task.createdBy", { name: "" })}</p>
                <div className="flex items-center gap-2">
                  <Avatar name={selectedTask.creator.name} size="xs" />
                  <span className="text-sm text-gray-700">{selectedTask.creator.name}</span>
                </div>
              </div>
            </div>

            {/* Go to project button */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100">
              <Link
                href={`/projects/${selectedTask.projectId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                {t("myTasks.goToProject")}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
