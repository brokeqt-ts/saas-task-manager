import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

async function getMember(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const member = await getMember(params.projectId, user.id);
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { tasks: true, members: true } },
    },
  });

  if (!project) return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const member = await getMember(params.projectId, user.id);
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const { name, description } = await req.json();
  const project = await prisma.project.update({
    where: { id: params.projectId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const member = await getMember(params.projectId, user.id);
  if (!member || member.role !== "OWNER") {
    return NextResponse.json({ error: "Только владелец может удалить проект" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: params.projectId } });
  return NextResponse.json({ success: true });
}
