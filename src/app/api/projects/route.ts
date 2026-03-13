import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getCurrentUser();

  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const { name, description } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Название проекта обязательно" }, { status: 400 });
  }

  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: { name: name.trim(), description: description?.trim() ?? null, ownerId: user.id },
    });
    await tx.projectMember.create({
      data: { projectId: p.id, userId: user.id, role: "OWNER" },
    });
    return p;
  });

  return NextResponse.json(project, { status: 201 });
}
