"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Column } from "./column";
import { MobileBoard } from "./mobile-board";
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
  // Default to mobile (true) so SSR and first paint are mobile-first.
  // After mount, check real viewport and update once.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Render only ONE DragDropContext at a time — avoids iOS Safari conflicts.
  if (isMobile) {
    return (
      <MobileBoard
        projectId={projectId}
        initialTasks={initialTasks}
        members={members}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
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
    </div>
  );
}
