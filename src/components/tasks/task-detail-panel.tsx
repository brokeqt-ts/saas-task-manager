"use client";

import { useState, useEffect } from "react";
import type { TaskWithRelations, MemberWithUser, TaskStatus, Priority } from "@/types";
import { formatDate, isOverdue, toMoscowInputValue, fromMoscowInputValue } from "@/lib/utils";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/avatar";
import { useLocale } from "@/components/providers/language-provider";

interface TaskDetailPanelProps {
  task: TaskWithRelations | null;
  members: MemberWithUser[];
  projectId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TaskDetailPanel({ task, members, projectId, onClose, onUpdate }: TaskDetailPanelProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId ?? "");
      // Convert UTC deadline → Moscow time for the input
      setDeadline(toMoscowInputValue(task.deadline));
    }
  }, [task]);

  if (!task) return null;

  async function save(fields: Partial<Record<string, unknown>>) {
    setSaving(true);
    await fetch(`/api/projects/${projectId}/tasks/${task!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setSaving(false);
    onUpdate();
  }

  async function handleDelete() {
    if (!confirm(t("task.deleteConfirm"))) return;
    await fetch(`/api/projects/${projectId}/tasks/${task!.id}`, { method: "DELETE" });
    onClose();
    onUpdate();
  }

  function handleDeadlineBlur() {
    // Convert Moscow input value → UTC ISO string for API
    const isoDeadline = fromMoscowInputValue(deadline);
    save({ deadline: isoDeadline });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">{t("task.details")}</span>
          <div className="flex items-center gap-1">
            {saving && <span className="text-xs text-gray-400">{t("task.saving")}</span>}
            <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== task.title && save({ title })}
              className="w-full text-base font-semibold text-gray-900 border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none py-1 transition-colors bg-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description !== (task.description ?? "") && save({ description })}
              rows={4}
              placeholder={t("task.descriptionPlaceholder")}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.status")}</label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as TaskStatus;
                  setStatus(s);
                  save({ status: s });
                }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{t(`status.${s}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.priority")}</label>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as Priority;
                  setPriority(p);
                  save({ priority: p });
                }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{t(`priority.${p}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.assignee")}</label>
            <select
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                save({ assigneeId: e.target.value || null });
              }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t("task.unassigned")}</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t("task.deadline")}
              {task.deadline && isOverdue(task.deadline) && task.status !== "DONE" && (
                <span className="ml-2 text-red-500">{t("task.overdue")}</span>
              )}
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              onBlur={handleDeadlineBlur}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Meta */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Avatar name={task.creator.name} size="xs" />
              <span>{t("task.createdBy", { name: task.creator.name })}</span>
              <span>·</span>
              <span>{formatDate(task.createdAt)}</span>
            </div>
            <p className="text-xs text-gray-400">{t("task.modifiedAt", { date: formatDate(task.updatedAt) })}</p>
          </div>
        </div>
      </div>
    </>
  );
}
