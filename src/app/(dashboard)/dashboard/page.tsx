import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/analytics/stats-cards";
import { StatusChart } from "@/components/analytics/status-chart";
import { OverdueList } from "@/components/analytics/overdue-list";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";

export default async function DashboardPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Single query to get user's project IDs — avoids repeated nested subqueries
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return (
      <>
        <Header title={t(locale, "dashboard.title")} />
        <main className="p-3 md:p-6 space-y-4 md:space-y-6">
          <StatsCards totalTasks={0} myTasks={0} overdueTasks={0} completedThisWeek={0} activeProjects={0} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusChart data={[
              { status: "TODO" as const, _count: 0 },
              { status: "IN_PROGRESS" as const, _count: 0 },
              { status: "REVIEW" as const, _count: 0 },
              { status: "DONE" as const, _count: 0 },
            ]} />
            <OverdueList tasks={[]} />
          </div>
        </main>
      </>
    );
  }

  const pFilter = { projectId: { in: projectIds } };

  // All queries in parallel with flat projectId filter (no nested JOINs)
  const [tasksByStatus, myTasksCount, overdueTasks, completedThisWeek] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      where: pFilter,
      _count: true,
    }),
    prisma.task.count({
      where: {
        ...pFilter,
        OR: [{ assigneeId: user.id }, { creatorId: user.id }],
      },
    }),
    prisma.task.findMany({
      where: {
        ...pFilter,
        deadline: { lt: now },
        status: { not: "DONE" },
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
        ...pFilter,
        status: "DONE",
        updatedAt: { gte: weekAgo },
      },
    }),
  ]);

  const totalTasks = tasksByStatus.reduce((sum, s) => sum + s._count, 0);
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
          activeProjects={projectIds.length}
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
