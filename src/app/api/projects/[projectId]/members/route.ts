import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!member) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const members = await prisma.projectMember.findMany({
    where: { projectId: params.projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const { email } = await req.json();
  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: targetUser.id, projectId: params.projectId } },
  });
  if (existing) return NextResponse.json({ error: "Уже участник" }, { status: 409 });

  const member = await prisma.projectMember.create({
    data: { projectId: params.projectId, userId: targetUser.id, role: "MEMBER" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(member, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.projectId } },
  });
  if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const { userId } = await req.json();
  const targetMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId: params.projectId } },
  });
  if (!targetMember) return NextResponse.json({ error: "Участник не найден" }, { status: 404 });
  if (targetMember.role === "OWNER") return NextResponse.json({ error: "Нельзя удалить владельца" }, { status: 400 });

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId: params.projectId } },
  });

  return NextResponse.json({ success: true });
}
