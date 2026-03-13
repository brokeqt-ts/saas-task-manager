"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { TaskWithRelations } from "@/types";
import { PRIORITY_COLORS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, isOverdue } from "@/lib/utils";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useLocale } from "@/components/providers/language-provider";

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-gray-300",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-orange-400",
  URGENT: "bg-red-500",
};

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
          style={provided.draggableProps.style}
          className={`
            select-none cursor-pointer transition-shadow

            flex-shrink-0 flex items-center gap-1.5
            bg-gray-50 border border-gray-200 rounded-md
            px-2 py-1.5 max-w-[200px]

            md:flex-shrink md:flex-col md:items-stretch md:gap-0
            md:max-w-none md:w-auto md:bg-white md:rounded-xl
            md:p-3 md:mb-2 md:border-gray-200

            ${snapshot.isDragging
              ? "shadow-lg ring-2 ring-blue-200 opacity-90"
              : "md:hover:border-gray-300 md:hover:shadow-sm"}
          `}
        >
          {/* ===== MOBILE: single-line chip ===== */}
          {/* Priority dot — mobile only */}
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 md:hidden ${PRIORITY_DOT[task.priority]}`} />

          {/* Title — truncated single line on mobile */}
          <span className="text-[11px] font-medium text-gray-800 truncate md:hidden">
            {task.title}
          </span>

          {/* Deadline chip — mobile only */}
          {task.deadline && (
            <span className={`flex items-center gap-0.5 flex-shrink-0 text-[9px] md:hidden ${overdue ? "text-red-500 font-bold" : "text-gray-400"}`}>
              <CalendarIcon className="w-2.5 h-2.5" />
              {formatDate(task.deadline)}
            </span>
          )}

          {/* ===== DESKTOP: full card layout ===== */}
          {/* Title + priority badge */}
          <div className="hidden md:flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {task.title}
            </p>
            <Badge className={`${PRIORITY_COLORS[task.priority]} flex-shrink-0 text-[10px]`}>
              {t(`priority.${task.priority}`)}
            </Badge>
          </div>

          {/* Description — desktop only */}
          {task.description && (
            <p className="hidden md:block text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          {/* Deadline + assignee — desktop only */}
          <div className="hidden md:flex items-center justify-between mt-2">
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
