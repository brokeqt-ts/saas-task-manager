"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { AddTaskInline } from "./add-task-inline";
import type { TaskStatus, TaskWithRelations } from "@/types";
import { useLocale } from "@/components/providers/language-provider";

const COLUMN_STYLES: Record<TaskStatus, string> = {
  TODO: "border-t-gray-300",
  IN_PROGRESS: "border-t-blue-400",
  REVIEW: "border-t-yellow-400",
  DONE: "border-t-green-500",
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
    <div className={`w-72 flex-shrink-0 bg-gray-50 rounded-xl border-t-4 ${COLUMN_STYLES[status]} flex flex-col`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {t(`status.${status}`)}
        </span>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5 font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-3 pb-2 min-h-[100px] transition-colors ${snapshot.isDraggingOver ? "bg-blue-50/50" : ""}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task */}
      <div className="px-3 pb-3">
        <AddTaskInline projectId={projectId} status={status} onTaskAdded={onTaskAdded} />
      </div>
    </div>
  );
}
