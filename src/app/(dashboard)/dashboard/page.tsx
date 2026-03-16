import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/analytics/stats-cards";
import { StatusChart } from "@/components/analytics/status-chart";
import { OverdueList } from "@/components/analytics/overdue-list";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const memberFilter = { project: { members: { some: { userId: user.id } } } };

  const [tasksByStatus, myTasksCount, overdueTasks, completedThisWeek, activeProjects] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      where: memberFilter,
      _count: true,
    }),
    prisma.task.count({
      where: {
        ...memberFilter,
        OR: [{ assigneeId: user.id }, { creatorId: user.id }],
      },
    }),
    prisma.task.findMany({
      where: {
        deadline: { lt: now },
        status: { not: "DONE" },
        ...memberFilter,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { deadline: "asc" },
      take: 20,
    }),
    prisma.task.count({
      where: {
        status: "DONE",
        updatedAt: { gte: weekAgo },
        ...memberFilter,
      },
    }),
    prisma.project.count({
      where: { members: { some: { userId: user.id } } },
    }),
  ]);

  const totalTasks = tasksByStatus.reduce((sum, s) => sum + s._count, 0);
  // Ensure all 4 statuses are always present for the chart
  const statusMap = Object.fromEntries(tasksByStatus.map((s) => [s.status, s._count]));
  const statusData = (["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((status) => ({
    status,
    _count: statusMap[status] ?? 0,
  }));

  return (
    <>
      <Header title={t(locale, "dashboard.title")} />
      <main className="p-3 md:p-6 space-y-4 md:space-y-6">
        <StatsCards
          totalTasks={totalTasks}
          myTasks={myTasksCount}
          overdueTasks={overdueTasks.length}
          completedThisWeek={completedThisWeek}
          activeProjects={activeProjects}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart data={statusData} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <OverdueList tasks={overdueTasks as any} />
        </div>
      </main>
    </>
  );
}
