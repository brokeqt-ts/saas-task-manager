import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { Header } from "@/components/layout/header";
import { Board } from "@/components/kanban/board";
import Link from "next/link";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const locale = await getLocale();

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) notFound();

  const [project, tasks, members] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.projectId },
      select: { id: true, name: true },
    }),
    prisma.task.findMany({
      where: { projectId: params.projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    }),
    prisma.projectMember.findMany({
      where: { projectId: params.projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  if (!project) notFound();

  return (
    <>
      <Header title={project.name} />
      <main className="p-3 md:p-6 md:h-[calc(100vh-3.5rem)] md:flex md:flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500">
              {t(locale, "project.tasksCount", { count: tasks.length, members: members.length })}
            </p>
          </div>
          {(member.role === "OWNER" || member.role === "ADMIN") && (
            <Link
              href={`/projects/${params.projectId}/settings`}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              {t(locale, "project.settings")}
            </Link>
          )}
        </div>
        <div className="md:flex-1 md:overflow-hidden">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Board projectId={params.projectId} initialTasks={tasks as any} members={members as any} />
        </div>
      </main>
    </>
  );
}
