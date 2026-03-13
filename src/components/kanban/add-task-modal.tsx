"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { TaskStatus, Priority, MemberWithUser } from "@/types";
import { useLocale } from "@/components/providers/language-provider";

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

interface AddTaskModalProps {
  projectId: string;
  members: MemberWithUser[];
  onClose: () => void;
  onCreated: () => void;
}

export function AddTaskModal({ projectId, members, onClose, onCreated }: AddTaskModalProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;

    setLoading(true);
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      }),
    });
    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Modal — fullscreen on mobile, centered card on desktop */}
      <div
        className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden
          md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-[480px] md:max-h-[90vh] md:rounded-xl md:shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          {/* Header row: title + close button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("task.newTask")}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 active:text-gray-600 active:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Title */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.titleLabel")}</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("task.namePlaceholder")}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t("task.descriptionPlaceholder")}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.status")}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{t(`priority.${p}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.assignee")}</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t("task.unassigned")}</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t("task.deadline")}</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Fixed bottom button */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="w-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 rounded-lg py-3 transition-colors"
          >
            {loading ? t("task.creating") : t("task.createTask")}
          </button>
        </div>
      </div>
    </>
  );
}
