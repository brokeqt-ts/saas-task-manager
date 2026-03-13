"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Column } from "./column";
import { AddTaskModal } from "./add-task-modal";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import type { TaskWithRelations, MemberWithUser, TaskStatus } from "@/types";
import { useLocale } from "@/components/providers/language-provider";
import useSWR from "swr";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

interface BoardProps {
  projectId: string;
  initialTasks: TaskWithRelations[];
  members: MemberWithUser[];
}

export function Board({ projectId, initialTasks, members }: BoardProps) {
  const { t } = useLocale();
  const { data: tasks = initialTasks, mutate } = useSWR<TaskWithRelations[]>(
    `/api/projects/${projectId}/tasks`,
    { fallbackData: initialTasks }
  );

  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const tasksByStatus = STATUSES.reduce<Record<TaskStatus, TaskWithRelations[]>>(
    (acc, s) => {
      acc[s] = tasks.filter((t) => t.status === s).sort((a, b) => a.order - b.order);
      return acc;
    },
    { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] }
  );

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId as TaskStatus;
      const newOrder = destination.index;

      mutate(
        (prev = []) =>
          prev.map((t) =>
            t.id === draggableId ? { ...t, status: newStatus, order: newOrder } : t
          ),
        { revalidate: false }
      );

      try {
        await fetch(`/api/projects/${projectId}/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, order: newOrder }),
        });
      } finally {
        mutate();
      }
    },
    [projectId, mutate]
  );

  const handleTaskUpdated = useCallback(() => mutate(), [mutate]);

  const selectedTaskUpdated = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  return (
    <>
      {/* Add task button — fixed bottom-right on mobile, inline on desktop */}
      <button
        onClick={() => setShowAddModal(true)}
        className="
          fixed bottom-6 right-6 z-30
          md:static md:mb-3
          flex items-center gap-2
          bg-blue-600 hover:bg-blue-700 text-white
          rounded-full md:rounded-lg
          w-14 h-14 md:w-auto md:h-auto md:px-4 md:py-2
          justify-center
          shadow-lg md:shadow-none
          transition-colors text-sm font-medium
        "
      >
        <PlusIcon className="w-6 h-6 md:w-4 md:h-4" />
        <span className="hidden md:inline">{t("task.add")}</span>
      </button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-1 md:flex-row md:gap-4 md:overflow-x-auto md:pb-4 md:h-full">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Add task modal */}
      {showAddModal && (
        <AddTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowAddModal(false)}
          onCreated={() => mutate()}
        />
      )}

      <TaskDetailPanel
        task={selectedTaskUpdated}
        members={members}
        projectId={projectId}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdated}
      />
    </>
  );
}
