import UniversalUserForm from "@/components/auth/UniversalUserForm";
import { useAuth } from "@/hooks/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { School, TriangleAlert } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router";

const Login = () => {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const showNoYearBanner = params.get("reason") === "no-year";
  if (user && !loading) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <School className="size-4" />
            </div>
            SchoolDesk.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {showNoYearBanner && (
              <Alert className="mb-6">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>SchoolDesk isn&apos;t ready yet</AlertTitle>
                <AlertDescription>
                  An administrator still needs to set the current academic year.
                  Once that is done you will be able to sign in.
                </AlertDescription>
              </Alert>
            )}
            <UniversalUserForm type="login" />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/erika-fletcher.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Login;
