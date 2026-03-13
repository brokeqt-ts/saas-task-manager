"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { useSidebar } from "./sidebar-context";

interface Project {
  id: string;
  name: string;
}

export function SidebarProjectList({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const { close } = useSidebar();

  return (
    <div className="space-y-0.5">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          onClick={close}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === `/projects/${p.id}`
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
          <span className="truncate">{p.name}</span>
        </Link>
      ))}
      <CreateProjectButton />
    </div>
  );
}
