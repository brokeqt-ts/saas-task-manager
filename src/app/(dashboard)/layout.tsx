import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { SidebarShell } from "@/components/layout/sidebar-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <SidebarShell>
          <Sidebar />
        </SidebarShell>
        <div className="md:ml-64 pt-14 min-h-screen">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
