"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { TaskWithRelations } from "@/types";
import { PRIORITY_COLORS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, isOverdue } from "@/lib/utils";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useLocale } from "@/components/providers/language-provider";

interface TaskCardProps {
  task: TaskWithRelations;
  index: number;
  onClick: (task: TaskWithRelations) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const { t } = useLocale();
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
            bg-white border rounded-xl p-3 mb-2 cursor-pointer
            transition-shadow select-none
            ${snapshot.isDragging ? "shadow-lg border-blue-200 rotate-1" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}
          `}
        >
          {/* Priority */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {task.title}
            </p>
            <Badge className={`${PRIORITY_COLORS[task.priority]} flex-shrink-0 text-[10px]`}>
              {t(`priority.${task.priority}`)}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            {task.deadline ? (
              <span className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-400"}`}>
                <CalendarIcon className="w-3 h-3" />
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
