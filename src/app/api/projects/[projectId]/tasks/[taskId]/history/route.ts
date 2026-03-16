import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(_req: Request, { params }: { params: { projectId: string; taskId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "No access" }, { status: 403 });

  const history = await prisma.taskHistory.findMany({
    where: { taskId: params.taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(history);
}
