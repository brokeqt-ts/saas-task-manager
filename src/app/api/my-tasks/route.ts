import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getCurrentUser();

  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id, status: { not: "DONE" } },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: [
      { deadline: { sort: "asc", nulls: "last" } },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Also include completed tasks (last 20)
  const doneTasks = await prisma.task.findMany({
    where: { assigneeId: user.id, status: "DONE" },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json([...tasks, ...doneTasks]);
}
