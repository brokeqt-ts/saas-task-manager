"use client";

import { useLocale } from "@/components/providers/language-provider";

interface StatsCardsProps {
  totalTasks: number;
  myTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
  activeProjects: number;
}

export function StatsCards({ totalTasks, myTasks, overdueTasks, completedThisWeek, activeProjects }: StatsCardsProps) {
  const { t } = useLocale();

  const stats = [
    {
      label: t("stats.myTasks"),
      value: myTasks,
      subLabel: t("stats.totalTasks", { count: totalTasks }),
      icon: "📋",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: t("stats.overdue"),
      value: overdueTasks,
      icon: "⚠️",
      color: overdueTasks > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500",
    },
    {
      label: t("stats.completedThisWeek"),
      value: completedThisWeek,
      icon: "✅",
      color: "bg-green-50 text-green-600",
    },
    {
      label: t("stats.activeProjects"),
      value: activeProjects,
      icon: "📁",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${s.color}`}>
            {s.icon}
          </div>
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          {"subLabel" in s && s.subLabel && (
            <p className="text-xs text-gray-400 mt-0.5">{s.subLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
