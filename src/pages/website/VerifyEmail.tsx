import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import { notify } from "@/lib/notify";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const verifyMutation = useMutation<
    { message: string; data: {} },
    { token: string }
  >(endpoint.auth.verifyEmail, {
    skipErrorHandling: true,
    onSuccess: (res) => {
      notify.fromApiSuccess(res, "Email verified successfully");

      setTimeout(() => {
        navigate("/signin");
      }, 2500);
    },
    onError: (err) => {
      notify.fromApiError(err, "Verification failed");
    },
  });

  useEffect(() => {
    if (!token) {
      notify.error("Invalid verification link");
      return;
    }

    verifyMutation.trigger({ token });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center">
          {verifyMutation.isLoading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h2 className="text-2xl font-bold mt-6">
                Verifying your email...
              </h2>
              <p className="text-muted-foreground mt-2">
                Please wait while we verify your account.
              </p>
            </>
          ) : verifyMutation.error ? (
            <>
              <XCircle className="mx-auto h-14 w-14 text-red-500" />
              <h2 className="text-2xl font-bold mt-6">Verification Failed</h2>
              <p className="text-muted-foreground mt-2">
                {verifyMutation.error.message ||
                  "Your verification link is invalid or has expired."}
              </p>

              <Button asChild className="mt-6 w-full">
                <Link to="/signin">Go to Sign In</Link>
              </Button>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
              <h2 className="text-2xl font-bold mt-6">Email Verified</h2>
              <p className="text-muted-foreground mt-2">
                Your email has been verified successfully.
                <br />
                Redirecting you to Sign In...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
