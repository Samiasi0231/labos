import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Phone,
  Heart,
  Shield,
  Bell,
  Lock,
  Save,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCurrentUser,
  useUpdateProfile,
  useChangePassword,
} from "@/hooks/use-user";

export default function PatientProfile() {
  const { toast } = useToast();
  const { user, isLoading, error, refetch } = useCurrentUser();
  const { updateProfile, isLoading: isSavingProfile } = useUpdateProfile();
  const { changePassword, isLoading: isChangingPassword } = useChangePassword();

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setPersonal({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // No backend endpoint for these yet — local-only state
  const [notifSettings, setNotifSettings] = useState({
    resultEmail: true,
    resultSMS: true,
    resultWhatsApp: false,
    appointmentEmail: true,
    appointmentSMS: true,
    promotionalEmail: false,
  });
  const tgl = (key: keyof typeof notifSettings) =>
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handlePersonalChange =
    (key: keyof typeof personal) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setPersonal((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSavePersonal = async () => {
    try {
      await updateProfile({
        firstName: personal.firstName,
        lastName: personal.lastName,
        phone: personal.phone,
      });
      toast({
        title: "Profile updated",
        description: "Your personal info has been saved.",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Could not save your changes. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Check your current password and try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="pt-6 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          Couldn't load your profile. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">My Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Avatar card */}
      <Card className="shadow-card">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-card border-2 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {user.patient?.code && (
                  <Badge
                    variant="outline"
                    className="text-xs font-mono text-primary border-primary/30"
                  >
                    {user.patient.code}
                  </Badge>
                )}
                {user.emailVerified && (
                  <Badge
                    variant="outline"
                    className="text-xs border-success/30 text-success bg-success/5"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {memberSince}
                {user.membership?.role ? ` · ${user.membership.role}` : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="personal" className="gap-2 text-xs">
            <User className="w-3.5 h-3.5" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-2 text-xs">
            <Heart className="w-3.5 h-3.5" />
            Medical Info
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs">
            <Lock className="w-3.5 h-3.5" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Personal info */}
        <TabsContent value="personal" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    value={personal.firstName}
                    onChange={handlePersonalChange("firstName")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    value={personal.lastName}
                    onChange={handlePersonalChange("lastName")}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={personal.phone}
                  onChange={handlePersonalChange("phone")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" value={user.email} disabled />
                <p className="text-xs text-muted-foreground">
                  Email can't be changed here yet.
                </p>
              </div>
            </CardContent>
          </Card>
          <Button
            className="gap-2"
            onClick={handleSavePersonal}
            disabled={isSavingProfile}
          >
            <Save className="w-4 h-4" />
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </TabsContent>

        {/* Medical info — read-only until an update endpoint exists */}
        <TabsContent value="medical" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Medical Information
              </CardTitle>
              <CardDescription>
                {user.patient
                  ? "Read-only — editing isn't supported yet."
                  : "No patient record linked to your account."}
              </CardDescription>
            </CardHeader>
            {user.patient && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Input value={user.patient.gender} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <Input value={user.patient.dob} disabled />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Patient Phone</Label>
                  <Input value={user.patient.phone} disabled />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Notifications — local only, no backend endpoint yet */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                These preferences aren't saved to your account yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Test Results
              </p>
              {[
                {
                  key: "resultEmail" as const,
                  label: "Email notification",
                  desc: "Get emailed when results are ready",
                },
                {
                  key: "resultSMS" as const,
                  label: "SMS notification",
                  desc: "Get a text message when results are ready",
                },
                {
                  key: "resultWhatsApp" as const,
                  label: "WhatsApp notification",
                  desc: "Get a WhatsApp message when results are ready",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-1"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifSettings[item.key]}
                    onCheckedChange={() => tgl(item.key)}
                  />
                </div>
              ))}
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Appointments
              </p>
              {[
                {
                  key: "appointmentEmail" as const,
                  label: "Email reminders",
                  desc: "Receive appointment confirmation and reminders",
                },
                {
                  key: "appointmentSMS" as const,
                  label: "SMS reminders",
                  desc: "Receive SMS reminders 24 hours before",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-1"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifSettings[item.key]}
                    onCheckedChange={() => tgl(item.key)}
                  />
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium">Promotional emails</p>
                  <p className="text-xs text-muted-foreground">
                    Health tips and lab offers
                  </p>
                </div>
                <Switch
                  checked={notifSettings.promotionalEmail}
                  onCheckedChange={() => tgl("promotionalEmail")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="p-3 bg-muted/30 rounded-lg space-y-1.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Password requirements:
                </p>
                <p>• Minimum 8 characters</p>
                <p>• At least one uppercase letter</p>
                <p>• At least one number or symbol</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable 2FA via SMS</p>
                  <p className="text-xs text-muted-foreground">
                    Receive a code on {user.phone}
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>
          <Button
            className="gap-2"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
          >
            <Save className="w-4 h-4" />
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
