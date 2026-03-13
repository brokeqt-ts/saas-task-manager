import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { Avatar } from "@/components/ui/avatar";
import { SidebarProjectList } from "./sidebar-project-list";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SignOutButton } from "./sign-out-button";
import { getLocale } from "@/lib/get-locale";
import { t } from "@/lib/i18n";

export async function Sidebar() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <SidebarNavLink href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">TaskFlow</span>
        </SidebarNavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <SidebarNavLink
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mb-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          {t(locale, "nav.home")}
        </SidebarNavLink>

        <div className="mt-3">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {t(locale, "nav.projects")}
            </span>
          </div>
          <SidebarProjectList projects={projects} />
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Avatar name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </>
  );
}
