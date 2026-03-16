import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getCurrentUser();

  // Single query — active tasks sorted by deadline/priority, then completed
  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id },
    include: {
      project: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: [
      { status: "asc" },
      { deadline: { sort: "asc", nulls: "last" } },
      { priority: "desc" },
    ],
    take: 100,
  });

  return NextResponse.json(tasks);
}
