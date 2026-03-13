import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json([], { status: 401 });

  await checkDeadlines(user.id);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(notifications);
}

// Notification thresholds — each fires once per task when deadline enters the bucket.
// The bucket tag is embedded in the message for deduplication.
const BUCKETS = [
  {
    // Already overdue
    tag: "[overdue]",
    match: (msLeft: number) => msLeft < 0,
    message: (title: string, msLeft: number) => {
      const overMin = Math.round(-msLeft / 60000);
      const text = overMin < 60
        ? `${overMin} мин. назад`
        : `${Math.round(overMin / 60)} ч. назад`;
      return `🔴 [overdue] Просрочена задача: "${title}" (${text})`;
    },
    // Repeat every 2 hours for overdue
    dedupWindowMs: 2 * 3600000,
  },
  {
    // <= 2 hours left
    tag: "[2h]",
    match: (msLeft: number) => msLeft >= 0 && msLeft <= 2 * 3600000,
    message: (title: string, msLeft: number) => {
      const minLeft = Math.round(msLeft / 60000);
      return `🔔 [2h] До дедлайна "${title}" осталось ${minLeft} мин.`;
    },
    dedupWindowMs: 1 * 3600000,
  },
  {
    // <= 24 hours left
    tag: "[24h]",
    match: (msLeft: number) => msLeft > 2 * 3600000 && msLeft <= 24 * 3600000,
    message: (title: string, msLeft: number) => {
      const hLeft = Math.round(msLeft / 3600000);
      return `⏰ [24h] До дедлайна "${title}" осталось ~${hLeft} ч.`;
    },
    dedupWindowMs: 12 * 3600000,
  },
];

async function checkDeadlines(userId: string) {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600000);

  // All non-done tasks of this user with deadline within 24h or overdue
  const tasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      deadline: { not: null, lte: in24h },
      OR: [{ assigneeId: userId }, { creatorId: userId }],
    },
    select: { id: true, title: true, deadline: true },
  });

  for (const task of tasks) {
    if (!task.deadline) continue;

    const msLeft = task.deadline.getTime() - now.getTime();
    const bucket = BUCKETS.find((b) => b.match(msLeft));
    if (!bucket) continue;

    // Deduplicate: skip if a notification with this bucket tag already exists recently
    const since = new Date(now.getTime() - bucket.dedupWindowMs);
    const existing = await prisma.notification.findFirst({
      where: {
        taskId: task.id,
        type: "DEADLINE_APPROACHING",
        userId,
        message: { contains: bucket.tag },
        createdAt: { gte: since },
      },
    });
    if (existing) continue;

    await prisma.notification.create({
      data: {
        type: "DEADLINE_APPROACHING",
        message: bucket.message(task.title, msLeft),
        userId,
        taskId: task.id,
      },
    });
  }
}

export async function PATCH(req: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  const { ids, all } = await req.json();

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } else if (ids?.length > 0) {
    await prisma.notification.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
