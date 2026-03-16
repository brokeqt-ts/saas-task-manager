import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { Header } from "@/components/layout/header";
import { Board } from "@/components/kanban/board";
import type { TaskWithRelations, MemberWithUser } from "@/types";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();

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
        <div className="md:flex-1 md:overflow-hidden">
          <Board
            projectId={params.projectId}
            initialTasks={tasks as TaskWithRelations[]}
            members={members as MemberWithUser[]}
            projectName={project.name}
            memberRole={member.role}
            settingsHref={`/projects/${params.projectId}/settings`}
          />
        </div>
      </main>
    </>
  );
}
