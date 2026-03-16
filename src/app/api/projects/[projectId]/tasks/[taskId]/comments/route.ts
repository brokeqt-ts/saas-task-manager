import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(_req: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "No access" }, { status: 403 });

  const comments = await prisma.comment.findMany({
    where: { taskId: params.taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "No access" }, { status: 403 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const [comment, task] = await Promise.all([
    prisma.comment.create({
      data: {
        text: text.trim(),
        userId: user.id,
        taskId: params.taskId,
        projectId: params.projectId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.task.findUnique({
      where: { id: params.taskId },
      select: { title: true, assigneeId: true },
    }),
  ]);

  // Notify assignee about the new comment (if not the commenter themselves)
  if (task?.assigneeId && task.assigneeId !== user.id) {
    await prisma.notification.create({
      data: {
        type: "COMMENT_ADDED",
        message: `${user.name} оставил комментарий к задаче "${task.title}": "${text.trim().slice(0, 100)}"`,
        userId: task.assigneeId,
        taskId: params.taskId,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
