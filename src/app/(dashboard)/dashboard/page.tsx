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

  const [tasksByStatus, overdueTasks, completedThisWeek, activeProjects] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      where: {
        project: { members: { some: { userId: user.id } } },
      },
      _count: true,
    }),
    prisma.task.findMany({
      where: {
        deadline: { lt: now },
        status: { not: "DONE" },
        project: { members: { some: { userId: user.id } } },
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
        project: { members: { some: { userId: user.id } } },
      },
    }),
    prisma.project.count({
      where: { members: { some: { userId: user.id } } },
    }),
  ]);

  const totalTasks = tasksByStatus.reduce((sum, s) => sum + s._count, 0);
  const statusData = tasksByStatus.map((s) => ({ status: s.status, _count: s._count }));

  return (
    <>
      <Header title={t(locale, "dashboard.title")} />
      <main className="p-6 space-y-6">
        <StatsCards
          totalTasks={totalTasks}
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
