"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/avatar";
import type { TaskWithRelations, MemberWithUser, TaskStatus } from "@/types";
import { useLocale } from "@/components/providers/language-provider";
import { formatDate, isOverdue } from "@/lib/utils";
import useSWR from "swr";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const ROW_COLORS: Record<TaskStatus, string> = {
  TODO: "border-l-gray-400",
  IN_PROGRESS: "border-l-blue-500",
  REVIEW: "border-l-yellow-400",
  DONE: "border-l-green-500",
};

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-gray-300",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-orange-400",
  URGENT: "bg-red-500",
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
        <div className="flex flex-col gap-1">
          {STATUSES.map((status) => {
            const statusTasks = tasksByStatus[status];
            return (
              <div
                key={status}
                className={`border-l-4 ${ROW_COLORS[status]} bg-white rounded-r-lg`}
              >
                {/* Row header — compact single line */}
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    {t(`status.${status}`)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {statusTasks.length}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      setAddingStatus(status);
                      setNewTitle("");
                    }}
                    className="p-0.5 text-gray-400 active:text-gray-600 active:bg-gray-100 rounded"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Horizontally scrollable task chips */}
                <Droppable droppableId={status} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex gap-1.5 px-3 pb-2 overflow-x-auto items-start
                        min-h-[44px] transition-colors
                        ${snapshot.isDraggingOver ? "bg-blue-50/80" : ""}
                      `}
                      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                    >
                      {statusTasks.map((task, index) => {
                        const overdue = isOverdue(task.deadline) && task.status !== "DONE";
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                                className={`
                                  flex-shrink-0 bg-gray-50 border border-gray-200 rounded-md
                                  px-2 py-1.5 select-none cursor-pointer
                                  flex items-center gap-1.5
                                  max-w-[180px]
                                  ${dragSnapshot.isDragging ? "shadow-md opacity-90 bg-white" : ""}
                                `}
                                style={dragProvided.draggableProps.style}
                              >
                                {/* Priority dot */}
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                                {/* Title */}
                                <span className="text-[11px] text-gray-800 font-medium truncate">
                                  {task.title}
                                </span>
                                {/* Deadline if any */}
                                {task.deadline && (
                                  <span className={`flex items-center gap-0.5 text-[9px] flex-shrink-0 ${overdue ? "text-red-500 font-bold" : "text-gray-400"}`}>
                                    <CalendarIcon className="w-2.5 h-2.5" />
                                    {formatDate(task.deadline)}
                                  </span>
                                )}
                                {/* Assignee */}
                                {task.assignee && (
                                  <div className="flex-shrink-0">
                                    <Avatar name={task.assignee.name} size="xs" />
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {/* Inline add */}
                      {addingStatus === status && (
                        <div className="flex-shrink-0 flex items-center">
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
                            className="w-28 text-[11px] px-2 py-1 border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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
