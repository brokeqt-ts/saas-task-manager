"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { TaskWithRelations } from "@/types";
import Link from "next/link";
import { useLocale } from "@/components/providers/language-provider";

interface OverdueListProps {
  tasks: (TaskWithRelations & { project: { name: string } })[];
}

export function OverdueList({ tasks }: OverdueListProps) {
  const { t } = useLocale();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {t("overdue.title")}
        {tasks.length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
            {tasks.length}
          </span>
        )}
      </h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">{t("overdue.empty")}</p>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 8).map((task) => (
            <Link
              key={task.id}
              href={`/projects/${task.projectId}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{task.project.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.assignee && <Avatar name={task.assignee.name} size="xs" />}
                <span className="text-xs text-red-600 font-medium">
                  {formatDate(task.deadline)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
