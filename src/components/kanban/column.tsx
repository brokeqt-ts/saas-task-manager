"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { AddTaskInline } from "./add-task-inline";
import type { TaskStatus, TaskWithRelations } from "@/types";
import { useLocale } from "@/components/providers/language-provider";

/* Mobile: left-border color. Desktop: top-border color */
const BORDER_COLORS: Record<TaskStatus, string> = {
  TODO: "border-l-gray-400 md:border-l-0 md:border-t-gray-300",
  IN_PROGRESS: "border-l-blue-500 md:border-l-0 md:border-t-blue-400",
  REVIEW: "border-l-yellow-400 md:border-l-0 md:border-t-yellow-400",
  DONE: "border-l-green-500 md:border-l-0 md:border-t-green-500",
};

interface ColumnProps {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  projectId: string;
  onTaskClick: (task: TaskWithRelations) => void;
  onTaskAdded: () => void;
}

export function Column({ status, tasks, projectId, onTaskClick, onTaskAdded }: ColumnProps) {
  const { t } = useLocale();

  return (
    <div
      className={`
        border-l-4 md:border-l-0 md:border-t-4
        ${BORDER_COLORS[status]}
        bg-white md:bg-gray-50 rounded-r-lg md:rounded-xl
        md:w-72 md:flex-shrink-0 flex flex-col
      `}
    >
      {/* Header: compact on mobile, spacious on desktop */}
      <div className="flex items-center justify-between px-3 py-1.5 md:px-4 md:pt-4 md:pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider">
            {t(`status.${status}`)}
          </span>
          <span className="text-[10px] md:text-xs text-gray-400 bg-gray-100 md:bg-white md:border md:border-gray-200 rounded-full px-1.5 md:px-2 py-0.5 font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable area:
          Mobile — horizontal row of compact chips, scrollable sideways
          Desktop — vertical stack of full cards */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex gap-1.5 px-3 pb-2 overflow-x-auto
              min-h-[44px]
              md:flex-col md:gap-0 md:overflow-x-visible
              md:min-h-[100px] md:flex-1 md:px-3 md:pb-2
              transition-colors
              ${snapshot.isDraggingOver ? "bg-blue-50/50" : ""}
            `}
            style={{ scrollbarWidth: "none" }}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task — desktop only (on mobile, use + in header or tap to add) */}
      <div className="hidden md:block px-3 pb-3">
        <AddTaskInline projectId={projectId} status={status} onTaskAdded={onTaskAdded} />
      </div>
    </div>
  );
}
