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

  // Notify assignee about assignment
  if (task.assigneeId && task.assigneeId !== user.id) {
    await prisma.notification.create({
      data: {
        type: "TASK_ASSIGNED",
        message: `Вам назначена задача: "${task.title}"`,
        userId: task.assigneeId,
        taskId: task.id,
      },
    });
  }

  // If deadline is within 24h, immediately notify both creator and assignee
  if (task.deadline) {
    const msLeft = task.deadline.getTime() - Date.now();
    if (msLeft > 0 && msLeft <= 24 * 3600000) {
      const recipients = [user.id];
      if (task.assigneeId && task.assigneeId !== user.id) {
        recipients.push(task.assigneeId);
      }
      const tag = msLeft <= 2 * 3600000 ? "[2h]" : "[24h]";
      const timeText = msLeft <= 2 * 3600000
        ? `${Math.round(msLeft / 60000)} мин.`
        : `~${Math.round(msLeft / 3600000)} ч.`;
      const emoji = msLeft <= 2 * 3600000 ? "🔔" : "⏰";
      await prisma.notification.createMany({
        data: recipients.map((recipientId) => ({
          type: "DEADLINE_APPROACHING" as const,
          message: `${emoji} ${tag} До дедлайна "${task.title}" осталось ${timeText}`,
          userId: recipientId,
          taskId: task.id,
        })),
      });
    }
  }

  return NextResponse.json(task, { status: 201 });
}
