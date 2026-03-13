import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = "Europe/Moscow";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** Convert UTC Date → "YYYY-MM-DDTHH:mm" string in Moscow time for datetime-local input */
export function toMoscowInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  // Format in Moscow timezone parts
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parse "YYYY-MM-DDTHH:mm" Moscow time → ISO string (UTC) for API */
export function fromMoscowInputValue(value: string): string | null {
  if (!value) return null;
  // Append Moscow offset (+03:00) so Date parses correctly
  return new Date(`${value}+03:00`).toISOString();
}

export function isOverdue(deadline: Date | string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function getDaysUntil(deadline: Date | string | null | undefined): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-400", "bg-orange-400", "bg-amber-400",
    "bg-green-500", "bg-teal-500", "bg-cyan-500",
    "bg-blue-500", "bg-indigo-500", "bg-violet-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
