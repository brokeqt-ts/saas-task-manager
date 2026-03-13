"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { TaskStatus } from "@/types";
import { useLocale } from "@/components/providers/language-provider";

interface StatusChartProps {
  data: { status: TaskStatus; _count: number }[];
}

const COLORS: Record<string, string> = {
  TODO: "#9ca3af",
  IN_PROGRESS: "#3b82f6",
  REVIEW: "#f59e0b",
  DONE: "#22c55e",
};

export function StatusChart({ data }: StatusChartProps) {
  const { t } = useLocale();

  const chartData = data.map((d) => ({
    name: t(`status.${d.status}`),
    value: d._count,
    status: d.status,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t("chart.tasksByStatus")}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            cursor={{ fill: "#f9fafb" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status] ?? "#9ca3af"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
