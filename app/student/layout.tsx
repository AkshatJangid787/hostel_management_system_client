import { StudentSidebar } from "@/components/layout/StudentSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <SidebarProvider>
        <StudentSidebar />
        <SidebarInset className="bg-slate-50 min-h-screen">
          <header className="h-12 flex items-center border-b px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10 transition-[width,height] ease-linear sm:h-16">
            <SidebarTrigger />
            <span className="ml-3 font-semibold text-lg">Student Portal</span>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}