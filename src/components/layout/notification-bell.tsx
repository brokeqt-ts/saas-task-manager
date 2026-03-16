"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import useSWR from "swr";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import type { NotificationItem } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/components/providers/language-provider";

// Module-level state — survives component remounts (page navigation)
// Only resets on full page refresh, which is correct behavior
let prevUnreadCount = -1;
let audioElement: HTMLAudioElement | null = null;
let audioUnlocked = false;
let mutating = false;

function getAudio(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio("/sounds/notification.wav");
    audioElement.volume = 0.5;
    audioElement.preload = "auto";
  }
  return audioElement;
}

function unlockAudio() {
  if (audioUnlocked) return;
  const audio = getAudio();
  audio.volume = 0;
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.5;
    audioUnlocked = true;
  }).catch(() => {});
}

function playNotificationSound() {
  try {
    const audio = getAudio();
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
}

export function NotificationBell() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Unlock audio on first user interaction (browser autoplay policy)
  useEffect(() => {
    getAudio(); // pre-create
    function handleInteraction() {
      unlockAudio();
    }
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const onSuccess = useCallback((data: NotificationItem[]) => {
    if (mutating) return;
    const newUnread = data.filter((n) => !n.read).length;
    if (prevUnreadCount >= 0 && newUnread > prevUnreadCount) {
      playNotificationSound();
    }
    prevUnreadCount = newUnread;
  }, []);

  const { data: notifications = [], mutate } = useSWR<NotificationItem[]>(
    "/api/notifications",
    {
      refreshInterval: 30000,
      refreshWhenHidden: true, // Keep polling even when tab is in background
      onSuccess,
    }
  );

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    mutating = true;
    prevUnreadCount = 0;
    mutate(
      (prev = []) => prev.map((n) => ({ ...n, read: true })),
      { revalidate: false }
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    mutating = false;
    const fresh = await mutate();
    if (fresh) {
      prevUnreadCount = fresh.filter((n) => !n.read).length;
    }
  }

  async function markOneRead(id: string) {
    mutating = true;
    prevUnreadCount = Math.max(0, prevUnreadCount - 1);
    mutate(
      (prev = []) => prev.map((n) => n.id === id ? { ...n, read: true } : n),
      { revalidate: false }
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    mutating = false;
    const fresh = await mutate();
    if (fresh) {
      prevUnreadCount = fresh.filter((n) => !n.read).length;
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title={t("notifications.title")}
      >
        {unread > 0 ? (
          <BellAlertIcon className="w-5 h-5 text-blue-600 animate-pulse" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ width: 340 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{t("notifications.title")}</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  {t("notifications.new", { count: unread })}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <BellIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t("notifications.empty")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markOneRead(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                  }`}
                >
                  <p className="text-[11px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wide">
                    {t(`notif.${n.type}`)}
                  </p>
                  <p className="text-sm text-gray-800 leading-snug">
                    {n.message.replace(/\[(overdue|2h|24h)\]\s*/g, "")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
