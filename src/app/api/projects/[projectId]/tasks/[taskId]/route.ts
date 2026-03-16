import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { TaskStatus } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!task || task.projectId !== params.projectId) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const existingTask = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (!existingTask || existingTask.projectId !== params.projectId) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  const { title, description, status, priority, assigneeId, deadline, order } = await req.json();

  const oldStatus = existingTask.status;
  const newStatus: TaskStatus = status ?? oldStatus;
  const statusChanged = newStatus !== oldStatus;
  const assigneeChanged = assigneeId !== undefined && assigneeId !== existingTask.assigneeId;

  let newOrder = existingTask.order;

  // Handle drag-and-drop reordering in a transaction
  if (order !== undefined || statusChanged) {
    const targetOrder = order ?? existingTask.order;

    await prisma.$transaction(async (tx) => {
      if (statusChanged) {
        // Move out of old column: shift down tasks above old position
        await tx.task.updateMany({
          where: {
            projectId: params.projectId,
            status: oldStatus,
            order: { gt: existingTask.order },
          },
          data: { order: { decrement: 1 } },
        });

        // Move into new column: shift up tasks at or after target position
        await tx.task.updateMany({
          where: {
            projectId: params.projectId,
            status: newStatus,
            order: { gte: targetOrder },
            id: { not: params.taskId },
          },
          data: { order: { increment: 1 } },
        });
      } else if (order !== undefined && order !== existingTask.order) {
        // Same column reorder
        if (targetOrder > existingTask.order) {
          await tx.task.updateMany({
            where: {
              projectId: params.projectId,
              status: newStatus,
              order: { gt: existingTask.order, lte: targetOrder },
              id: { not: params.taskId },
            },
            data: { order: { decrement: 1 } },
          });
        } else {
          await tx.task.updateMany({
            where: {
              projectId: params.projectId,
              status: newStatus,
              order: { gte: targetOrder, lt: existingTask.order },
              id: { not: params.taskId },
            },
            data: { order: { increment: 1 } },
          });
        }
      }
    });

    newOrder = targetOrder;
  }

  const updatedTask = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
      ...(status !== undefined && { status: newStatus }),
      ...(priority !== undefined && { priority }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId ?? null }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(order !== undefined || statusChanged ? { order: newOrder } : {}),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  // Record status change history
  if (statusChanged) {
    await prisma.taskHistory.create({
      data: {
        oldStatus,
        newStatus,
        taskId: params.taskId,
        userId: user.id,
      },
    });
  }

  // Notifications
  const notificationsToCreate = [];

  if (assigneeChanged && updatedTask.assigneeId && updatedTask.assigneeId !== user.id) {
    notificationsToCreate.push({
      type: "TASK_ASSIGNED" as const,
      message: `Вам назначена задача: "${updatedTask.title}"`,
      userId: updatedTask.assigneeId,
      taskId: updatedTask.id,
    });

    // If the task has a near deadline, also notify the new assignee
    if (updatedTask.deadline) {
      const msLeft = updatedTask.deadline.getTime() - Date.now();
      if (msLeft > 0 && msLeft <= 24 * 3600000) {
        const tag = msLeft <= 2 * 3600000 ? "[2h]" : "[24h]";
        const timeText = msLeft <= 2 * 3600000
          ? `${Math.round(msLeft / 60000)} мин.`
          : `~${Math.round(msLeft / 3600000)} ч.`;
        const emoji = msLeft <= 2 * 3600000 ? "🔔" : "⏰";
        notificationsToCreate.push({
          type: "DEADLINE_APPROACHING" as const,
          message: `${emoji} ${tag} До дедлайна "${updatedTask.title}" осталось ${timeText}`,
          userId: updatedTask.assigneeId,
          taskId: updatedTask.id,
        });
      }
    }
  }

  if (statusChanged && updatedTask.assigneeId && updatedTask.assigneeId !== user.id) {
    notificationsToCreate.push({
      type: "TASK_STATUS_CHANGED" as const,
      message: `Статус задачи "${updatedTask.title}" изменён на ${newStatus}`,
      userId: updatedTask.assigneeId,
      taskId: updatedTask.id,
    });
  }

  if (notificationsToCreate.length > 0) {
    await prisma.notification.createMany({ data: notificationsToCreate });
  }

  return NextResponse.json(updatedTask);
}

export async function DELETE(_req: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const task = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (!task || task.projectId !== params.projectId) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  // Only OWNER, ADMIN, or task creator can delete
  if (member.role === "MEMBER" && task.creatorId !== user.id) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.taskId } });
  return NextResponse.json({ success: true });
}
