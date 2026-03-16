"use client";

import { useState, useCallback, useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Column } from "./column";
import { AddTaskModal } from "./add-task-modal";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import type { TaskWithRelations, MemberWithUser, TaskStatus, Role } from "@/types";
import { useLocale } from "@/components/providers/language-provider";
import useSWR from "swr";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

interface BoardProps {
  projectId: string;
  initialTasks: TaskWithRelations[];
  members: MemberWithUser[];
  projectName: string;
  memberRole: Role;
  settingsHref: string;
}

export function Board({ projectId, initialTasks, members, projectName, memberRole, settingsHref }: BoardProps) {
  const { t } = useLocale();
  const { data: tasks = initialTasks, mutate } = useSWR<TaskWithRelations[]>(
    `/api/projects/${projectId}/tasks`,
    { fallbackData: initialTasks, refreshInterval: 30000 }
  );

  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterUserId, setFilterUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterUserId) {
      result = result.filter((t) => t.assigneeId === filterUserId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, filterUserId, searchQuery]);

  const tasksByStatus = STATUSES.reduce<Record<TaskStatus, TaskWithRelations[]>>(
    (acc, s) => {
      acc[s] = filteredTasks.filter((t) => t.status === s).sort((a, b) => a.order - b.order);
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

  const handleTaskUpdated = useCallback(() => mutate(), [mutate]);

  const selectedTaskUpdated = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) ?? null
    : null;

  const canManage = memberRole === "OWNER" || memberRole === "ADMIN";

  return (
    <>
      {/* Project header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{projectName}</h2>
          <p className="text-sm text-gray-500">
            {t("project.tasksCount", { count: tasks.length, members: members.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add task button (desktop) */}
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            {t("task.add")}
          </button>
          {canManage && (
            <Link
              href={settingsHref}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("project.settings")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("board.search")}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none min-w-[160px]"
          >
            <option value="">{t("board.allMembers")}</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FAB on mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="
          fixed bottom-6 right-6 z-30 md:hidden
          flex items-center justify-center
          bg-blue-600 hover:bg-blue-700 text-white
          rounded-full w-14 h-14
          shadow-lg transition-colors
        "
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-1 md:flex-row md:gap-4 md:overflow-x-auto md:pb-4 md:h-full">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Add task modal */}
      {showAddModal && (
        <AddTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowAddModal(false)}
          onCreated={() => mutate()}
        />
      )}

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
