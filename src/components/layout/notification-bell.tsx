"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import useSWR from "swr";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import type { NotificationItem } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/components/providers/language-provider";

export function NotificationBell() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // -1 means "not yet initialized" — skip sound on first fetch (page load/navigation)
  const prevUnreadRef = useRef<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.wav");
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Browser may block sound until first interaction — ignore
      });
    } catch {
      // Ignore audio errors
    }
  }, []);

  const { data: notifications = [], mutate } = useSWR<NotificationItem[]>(
    "/api/notifications",
    {
      refreshInterval: 60000,
      onSuccess(data) {
        const newUnread = data.filter((n) => !n.read).length;
        // prevUnreadRef starts at -1: first fetch just records the baseline, no sound
        if (prevUnreadRef.current >= 0 && newUnread > prevUnreadRef.current) {
          playSound();
        }
        prevUnreadRef.current = newUnread;
      },
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
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    mutate();
  }

  async function markOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    mutate();
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
