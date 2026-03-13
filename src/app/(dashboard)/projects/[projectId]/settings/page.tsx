"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import type { MemberWithUser } from "@/types";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useLocale } from "@/components/providers/language-provider";

export default function SettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { t } = useLocale();

  const { data: members = [], mutate } = useSWR<MemberWithUser[]>(`/api/projects/${projectId}/members`);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t("settings.error"));
    } else {
      setEmail("");
      mutate();
    }
    setLoading(false);
  }

  async function removeMember(userId: string) {
    await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    mutate();
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">{t("settings.members")}</h1>

      <form onSubmit={addMember} className="flex gap-2 mb-6">
        <input
          type="email"
          required
          placeholder={t("settings.memberEmail")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
        >
          {t("settings.add")}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
            <Avatar name={m.user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
              <p className="text-xs text-gray-400">{m.user.email}</p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {t(`settings.roles.${m.role}`)}
            </span>
            {m.role !== "OWNER" && (
              <button
                onClick={() => removeMember(m.userId)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
