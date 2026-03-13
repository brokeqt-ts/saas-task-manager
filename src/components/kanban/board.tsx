"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Column } from "./column";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import type { TaskWithRelations, MemberWithUser, TaskStatus } from "@/types";
import useSWR from "swr";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

interface BoardProps {
  projectId: string;
  initialTasks: TaskWithRelations[];
  members: MemberWithUser[];
}

export function Board({ projectId, initialTasks, members }: BoardProps) {
  const { data: tasks = initialTasks, mutate } = useSWR<TaskWithRelations[]>(
    `/api/projects/${projectId}/tasks`,
    { fallbackData: initialTasks }
  );

  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

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

  const handleTaskAdded = useCallback(() => mutate(), [mutate]);
  const handleTaskUpdated = useCallback(() => mutate(), [mutate]);

  const selectedTaskUpdated = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        {/*
          Mobile: vertical stack of compact horizontal rows (flex-col, gap-1)
          Desktop: horizontal columns side-by-side (md:flex-row, gap-4, overflow-x-auto)
        */}
        <div className="flex flex-col gap-1 md:flex-row md:gap-4 md:overflow-x-auto md:pb-4 md:h-full">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              projectId={projectId}
              onTaskClick={setSelectedTask}
              onTaskAdded={handleTaskAdded}
            />
          ))}
        </div>
      </DragDropContext>

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
