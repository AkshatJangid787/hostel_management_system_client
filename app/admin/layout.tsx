import { AdminSidebar } from "@/components/layout/AdminSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-slate-50 min-h-screen">
          <header className="h-12 flex items-center border-b px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10 transition-[width,height] ease-linear sm:h-16">
            <SidebarTrigger />
            <span className="ml-3 font-semibold text-lg">Hostel Admin</span>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}