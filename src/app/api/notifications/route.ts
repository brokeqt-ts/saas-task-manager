import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth-utils";

// In-memory cache: only run checkDeadlines once per 5 min per user
const checkCache = new Map<string, number>();
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const lastCheck = checkCache.get(user.id) ?? 0;
  if (Date.now() - lastCheck > CHECK_INTERVAL_MS) {
    checkCache.set(user.id, Date.now());
    await checkDeadlines(user.id);
  }

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
    tag: "[overdue]",
    match: (msLeft: number) => msLeft < 0,
    message: (title: string, msLeft: number) => {
      const overMin = Math.round(-msLeft / 60000);
      const text =
        overMin < 60 ? `${overMin} мин. назад` : `${Math.round(overMin / 60)} ч. назад`;
      return `🔴 [overdue] Просрочена задача: "${title}" (${text})`;
    },
    dedupWindowMs: 2 * 3600000,
  },
  {
    tag: "[2h]",
    match: (msLeft: number) => msLeft >= 0 && msLeft <= 2 * 3600000,
    message: (title: string, msLeft: number) => {
      const minLeft = Math.round(msLeft / 60000);
      return `🔔 [2h] До дедлайна "${title}" осталось ${minLeft} мин.`;
    },
    dedupWindowMs: 1 * 3600000,
  },
  {
    tag: "[24h]",
    match: (msLeft: number) => msLeft > 2 * 3600000 && msLeft <= 24 * 3600000,
    message: (title: string, msLeft: number) => {
      const hLeft = Math.round(msLeft / 3600000);
      return `⏰ [24h] До дедлайна "${title}" осталось ~${hLeft} ч.`;
    },
    dedupWindowMs: 12 * 3600000,
  },
];

const MAX_DEDUP_WINDOW = Math.max(...BUCKETS.map((b) => b.dedupWindowMs));

async function checkDeadlines(userId: string) {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600000);

  // Find tasks where this user is creator or assignee, and include both user IDs
  const tasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      deadline: { not: null, lte: in24h },
      OR: [{ assigneeId: userId }, { creatorId: userId }],
    },
    select: { id: true, title: true, deadline: true, assigneeId: true, creatorId: true },
  });

  if (tasks.length === 0) return;

  // Collect all unique recipient IDs (creator + assignee for every task)
  const allRecipientIds: string[] = [];
  const seenIds = new Set<string>();
  for (const task of tasks) {
    if (!seenIds.has(task.creatorId)) {
      seenIds.add(task.creatorId);
      allRecipientIds.push(task.creatorId);
    }
    if (task.assigneeId && !seenIds.has(task.assigneeId)) {
      seenIds.add(task.assigneeId);
      allRecipientIds.push(task.assigneeId);
    }
  }

  // Fetch all recent deadline notifications for these tasks + recipients in ONE query
  const since = new Date(now.getTime() - MAX_DEDUP_WINDOW);
  const recentNotifs = await prisma.notification.findMany({
    where: {
      userId: { in: Array.from(allRecipientIds) },
      type: "DEADLINE_APPROACHING",
      taskId: { in: tasks.map((t) => t.id) },
      createdAt: { gte: since },
    },
    select: { taskId: true, userId: true, message: true, createdAt: true },
  });

  // Group by "taskId:userId" for fast lookup
  const notifsByKey = new Map<string, { message: string; createdAt: Date }[]>();
  for (const n of recentNotifs) {
    if (!n.taskId) continue;
    const key = `${n.taskId}:${n.userId}`;
    if (!notifsByKey.has(key)) notifsByKey.set(key, []);
    notifsByKey.get(key)!.push({ message: n.message, createdAt: n.createdAt });
  }

  const toCreate: {
    type: "DEADLINE_APPROACHING";
    message: string;
    userId: string;
    taskId: string;
  }[] = [];

  for (const task of tasks) {
    if (!task.deadline) continue;

    const msLeft = task.deadline.getTime() - now.getTime();
    const bucket = BUCKETS.find((b) => b.match(msLeft));
    if (!bucket) continue;

    const dedupSince = new Date(now.getTime() - bucket.dedupWindowMs);

    // Notify BOTH creator and assignee
    const recipients: string[] = [task.creatorId];
    if (task.assigneeId && task.assigneeId !== task.creatorId) {
      recipients.push(task.assigneeId);
    }

    for (const recipientId of recipients) {
      const key = `${task.id}:${recipientId}`;
      const taskNotifs = notifsByKey.get(key) ?? [];
      const alreadySent = taskNotifs.some(
        (n) => n.message.includes(bucket.tag) && n.createdAt >= dedupSince
      );
      if (alreadySent) continue;

      toCreate.push({
        type: "DEADLINE_APPROACHING",
        message: bucket.message(task.title, msLeft),
        userId: recipientId,
        taskId: task.id,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.notification.createMany({ data: toCreate });
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
