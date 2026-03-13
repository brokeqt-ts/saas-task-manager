import { NotificationBell } from "./notification-bell";
import { getCurrentUser } from "@/lib/auth-utils";
import { Avatar } from "@/components/ui/avatar";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenuButton } from "./mobile-menu-button";

interface HeaderProps {
  title?: string;
}

export async function Header({ title }: HeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 md:left-64 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <MobileMenuButton />
        <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <LanguageSwitcher />
        <NotificationBell />
        <Avatar name={user.name} size="sm" />
      </div>
    </header>
  );
}
