import { useNavigate } from "react-router-dom";
import { FlaskConical, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-api";
import { getStoredAuth, setStoredAuth } from "@/api/client";
import endpoint from "@/api/endpoints";
import type { SwitchTokens, SwitchLabPayload } from "@/api/types/auth";
import type { UserLabItem } from "@/api/types/user";

function getRoleRedirect(role: string): string {
  switch (role) {
    case "lab_manager":
    case "lab_owner":
    case "manager":
      return "/lab";
    case "scientist":
      return "/lab";
    case "receptionist":
      return "/lab";
    case "patient":
      return "/patient";
    case "admin":
      return "/admin";
    default:
      return "/lab";
  }
}

export default function SelectLab() {
  const navigate = useNavigate();

  // Labs come from the login response — already stored in localStorage
  const stored = getStoredAuth();
  const labs: UserLabItem[] = (stored as any)?.labs ?? [];

  const switchMutation = useMutation<SwitchTokens, SwitchLabPayload>(
    endpoint.auth.switch,
    {
      skipErrorHandling: true,
      onSuccess: (res) => {
        if (!res.data) return;
        setStoredAuth(res.data);
        toast.success("Lab selected");
        navigate(getRoleRedirect(res.data.role));
      },
      onError: (err) => toast.error(err.message || "Failed to switch lab"),
    },
  );

  if (labs.length === 0) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            No labs found. Please sign in again.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.clear();
              navigate("/signin");
            }}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-primary">Lab</span>OS
            </span>
          </div>
          <h1 className="text-2xl font-bold">Select a Laboratory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            You belong to multiple labs. Choose one to continue.
          </p>
        </div>

        <div className="space-y-3">
          {labs.map((item) => (
            <Card
              key={item.membershipId}
              className="shadow-card border hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() =>
                switchMutation.trigger({ membershipId: item.membershipId })
              }
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.lab.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.lab.code}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 capitalize"
                    >
                      {item.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {switchMutation.isLoading ? (
                  <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Wrong account?{" "}
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/signin");
            }}
            className="text-primary hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
