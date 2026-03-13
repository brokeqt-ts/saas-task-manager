import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { TaskStatus } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const tasks = await prisma.task.findMany({
    where: { projectId: params.projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { title, description, status, priority, assigneeId, deadline } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Название задачи обязательно" }, { status: 400 });
  }

  const taskStatus: TaskStatus = status ?? "TODO";

  const maxOrderResult = await prisma.task.aggregate({
    where: { projectId: params.projectId, status: taskStatus },
    _max: { order: true },
  });
  const order = (maxOrderResult._max.order ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? null,
      status: taskStatus,
      priority: priority ?? "MEDIUM",
      order,
      deadline: deadline ? new Date(deadline) : null,
      projectId: params.projectId,
      assigneeId: assigneeId ?? null,
      creatorId: user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  // Notify assignee
  if (task.assigneeId && task.assigneeId !== user.id) {
    await prisma.notification.create({
      data: {
        type: "TASK_ASSIGNED",
        message: `Вам назначена задача: ${task.title}`,
        userId: task.assigneeId,
        taskId: task.id,
      },
    });
  }

  return NextResponse.json(task, { status: 201 });
}
