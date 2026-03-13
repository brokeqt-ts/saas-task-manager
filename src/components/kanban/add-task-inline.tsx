"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { TaskStatus } from "@/types";
import { useLocale } from "@/components/providers/language-provider";

interface AddTaskInlineProps {
  projectId: string;
  status: TaskStatus;
  onTaskAdded: () => void;
}

export function AddTaskInline({ projectId, status, onTaskAdded }: AddTaskInlineProps) {
  const { t } = useLocale();
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) {
      setActive(false);
      return;
    }
    setLoading(true);
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status }),
    });
    setTitle("");
    setActive(false);
    setLoading(false);
    onTaskAdded();
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1.5 w-full transition-colors"
      >
        <PlusIcon className="w-3.5 h-3.5" />
        {t("task.add")}
      </button>
    );
  }

  return (
    <div className="mt-1">
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreate();
          if (e.key === "Escape") { setActive(false); setTitle(""); }
        }}
        onBlur={handleCreate}
        placeholder={t("task.namePlaceholder")}
        disabled={loading}
        className="w-full px-3 py-2 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
    </div>
  );
}
