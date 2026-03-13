"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { MobileTaskCard } from "./mobile-task-card";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { TaskWithRelations, MemberWithUser, TaskStatus } from "@/types";
import { useLocale } from "@/components/providers/language-provider";
import useSWR from "swr";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const ROW_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-yellow-400",
  DONE: "bg-green-500",
};

interface MobileBoardProps {
  projectId: string;
  initialTasks: TaskWithRelations[];
  members: MemberWithUser[];
}

export function MobileBoard({ projectId, initialTasks, members }: MobileBoardProps) {
  const { t } = useLocale();
  const { data: tasks = initialTasks, mutate } = useSWR<TaskWithRelations[]>(
    `/api/projects/${projectId}/tasks`,
    { fallbackData: initialTasks }
  );

  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [addingStatus, setAddingStatus] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");

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
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

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

  async function handleAddTask(status: TaskStatus) {
    if (!newTitle.trim()) {
      setAddingStatus(null);
      return;
    }
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), status }),
    });
    setNewTitle("");
    setAddingStatus(null);
    mutate();
  }

  const selectedTaskUpdated = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-2 h-full overflow-y-auto">
          {STATUSES.map((status) => {
            const statusTasks = tasksByStatus[status];
            return (
              <div key={status} className="flex-shrink-0">
                {/* Row header */}
                <div className="flex items-center gap-2 px-1 mb-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ROW_COLORS[status]}`} />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {t(`status.${status}`)}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 font-medium">
                    {statusTasks.length}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      setAddingStatus(status);
                      setNewTitle("");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontally scrollable task row */}
                <Droppable droppableId={status} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex gap-2 px-1 pb-1 overflow-x-auto
                        min-h-[84px] rounded-lg transition-colors
                        ${snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50/60"}
                      `}
                      style={{ scrollbarWidth: "none" }}
                    >
                      {statusTasks.map((task, index) => (
                        <MobileTaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onClick={setSelectedTask}
                        />
                      ))}
                      {provided.placeholder}

                      {/* Inline add */}
                      {addingStatus === status && (
                        <div className="w-32 flex-shrink-0 flex items-start pt-1">
                          <input
                            autoFocus
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddTask(status);
                              if (e.key === "Escape") {
                                setAddingStatus(null);
                                setNewTitle("");
                              }
                            }}
                            onBlur={() => handleAddTask(status)}
                            placeholder={t("task.namePlaceholder")}
                            className="w-full text-[11px] px-2 py-1.5 border border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskDetailPanel
        task={selectedTaskUpdated}
        members={members}
        projectId={projectId}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => mutate()}
      />
    </>
  );
}
