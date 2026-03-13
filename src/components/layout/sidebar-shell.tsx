"use client";

import { useSidebar } from "./sidebar-context";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar wrapper */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {children}
      </aside>
    </>
  );
}
