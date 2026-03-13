"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { TaskWithRelations } from "@/types";
import { formatDate, isOverdue } from "@/lib/utils";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/avatar";

const PRIORITY_BORDER: Record<string, string> = {
  LOW: "border-l-gray-300",
  MEDIUM: "border-l-blue-400",
  HIGH: "border-l-orange-400",
  URGENT: "border-l-red-500",
};

interface MobileTaskCardProps {
  task: TaskWithRelations;
  index: number;
  onClick: (task: TaskWithRelations) => void;
}

export function MobileTaskCard({ task, index, onClick }: MobileTaskCardProps) {
  const overdue = isOverdue(task.deadline) && task.status !== "DONE";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`
            w-32 flex-shrink-0 bg-white border-l-4 border border-gray-200 rounded-lg p-2
            select-none cursor-pointer flex flex-col justify-between
            ${PRIORITY_BORDER[task.priority]}
            ${snapshot.isDragging ? "shadow-lg opacity-90" : ""}
          `}
          style={{
            minHeight: 72,
            ...provided.draggableProps.style,
          }}
        >
          <p className="text-[11px] font-medium text-gray-800 leading-tight line-clamp-3 break-words">
            {task.title}
          </p>

          <div className="mt-1.5 flex items-end justify-between gap-1">
            {task.deadline ? (
              <span
                className={`flex items-center gap-0.5 text-[10px] leading-none ${
                  overdue ? "text-red-600 font-semibold" : "text-gray-400"
                }`}
              >
                <CalendarIcon className="w-2.5 h-2.5 flex-shrink-0" />
                {formatDate(task.deadline)}
              </span>
            ) : (
              <span />
            )}
            {task.assignee && <Avatar name={task.assignee.name} size="xs" />}
          </div>
        </div>
      )}
    </Draggable>
  );
}
