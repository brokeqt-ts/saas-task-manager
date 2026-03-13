import { auth } from "./auth";
import { redirect } from "next/navigation";
import type { UserSession } from "@/types";

export async function getCurrentUser(): Promise<UserSession> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}

export async function getOptionalUser(): Promise<UserSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}
