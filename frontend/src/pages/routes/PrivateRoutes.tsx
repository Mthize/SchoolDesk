import { useAuth } from "@/hooks/AuthProvider";
import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react"; // Optional: for loading spinner
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

const PrivateRoutes = () => {
  const { loading, user, year, yearStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!year) {
    if (user.role === "admin" && yearStatus === "missing") {
      if (location.pathname !== "/settings/academic-years") {
        return <Navigate to="/settings/academic-years" replace />;
      }
    } else if (yearStatus === "missing") {
      return <Navigate to="/login?reason=no-year" replace />;
    } else if (yearStatus === "error") {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-3 text-center px-6">
          <p className="text-xl font-semibold">Unable to load the active academic year</p>
          <p className="text-muted-foreground max-w-md">
            Please refresh the page or contact an administrator.
          </p>
        </div>
      );
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrivateRoutes;
