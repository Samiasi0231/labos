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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bell, Shield, Printer, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type UpdateLabPayload } from "@/api/types/lab";
import { useUpdateLab, useUpdateLabLogo, useLab } from "@/hooks/use-lab"; 

interface LabFormState {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
}

const emptyLabForm: LabFormState = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  country: "NG",
};

export default function Settings() {
  const { toast } = useToast();
  const { lab, isLoading: isLabLoading, refetch } = useLab();
  const { updateLab, isLoading: isSaving } = useUpdateLab();
  const { updateLogo, isLoading: isUploadingLogo } = useUpdateLabLogo();
  const [labForm, setLabForm] = useState<LabFormState>(emptyLabForm);
  useEffect(() => {
    if (!lab) return;
    setLabForm({
      name: lab.name ?? "",
      email: lab.email ?? "",
      phone: lab.phone ?? "",
      line1: lab.address?.line1 ?? "",
      line2: lab.address?.line2 ?? "",
      city: lab.address?.city ?? "",
      state: lab.address?.state ?? "",
      country: lab.address?.country ?? "NG",
    });
  }, [lab]);

  const [notifications, setNotifications] = useState({
    emailResults: true,
    smsResults: false,
    whatsappResults: true,
    lowStockAlerts: true,
    appointmentReminders: true,
  });

  const handleSaveProfile = async () => {
    if (!labForm.name || !labForm.email || !labForm.phone) {
      toast({
        title: "Required fields missing",
        description: "Name, email, and phone are required.",
        variant: "destructive",
      });
      return;
    }

    const payload: UpdateLabPayload = {
      name: labForm.name,
      email: labForm.email,
      phone: labForm.phone,
      address: {
        line1: labForm.line1,
        line2: labForm.line2,
        city: labForm.city,
        state: labForm.state,
        country: labForm.country,
      },
    };

    try {
      await updateLab(payload);
      toast({
        title: "Settings Saved",
        description: "Lab Profile settings have been updated.",
      });
      refetch();
    } catch {
      toast({
        title: "Save failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // NOTE: /labs/logo expects a URL string, not a file — this assumes
    // you upload the file to your existing Cloudinary flow first (same
    // pattern you used for HotelMS branding) and get a URL back.
    // Plug your actual upload call in here, e.g.:
    // const url = await uploadToCloudinary(file);
    toast({
      title: "Wire up file upload",
      description:
        "Upload the file to Cloudinary, then call updateLogo(url) with the returned URL.",
    });
  };

  const save = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure your laboratory profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <Building className="w-3.5 h-3.5" />
            Lab Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="print" className="gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5" />
            Print Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Lab Profile */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Laboratory Logo</CardTitle>
              <CardDescription>
                Upload your laboratory logo for reports and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30 overflow-hidden">
                  {lab?.logo ? (
                    <img
                      src={lab.logo}
                      alt="Lab logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-primary/50" />
                  )}
                </div>
                <div>
                  <Label htmlFor="logo-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={isUploadingLogo}
                    >
                      <span>
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : null}
                        Upload Logo
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleLogoFileSelected}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    PNG or JPG, max 2MB. Recommended: 200×200px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">
                Laboratory Information
              </CardTitle>
              {lab?.code && (
                <CardDescription>Lab code: {lab.code}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isLabLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading lab profile…
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Laboratory Name *</Label>
                      <Input
                        value={labForm.name}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={labForm.email}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, email: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone *</Label>
                      <Input
                        value={labForm.phone}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, phone: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <Input
                        value={labForm.country}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, country: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Address Line 1</Label>
                      <Input
                        value={labForm.line1}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, line1: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Address Line 2</Label>
                      <Input
                        value={labForm.line2}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, line2: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input
                        value={labForm.city}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, city: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>State</Label>
                      <Input
                        value={labForm.state}
                        onChange={(e) =>
                          setLabForm((p) => ({ ...p, state: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : null}
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Notification Channels</CardTitle>
              <CardDescription>
                Configure how results and alerts are delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                {
                  key: "emailResults",
                  label: "Email Results to Patients",
                  desc: "Send result PDFs via email",
                },
                {
                  key: "smsResults",
                  label: "SMS Notification",
                  desc: "Send SMS when results are ready",
                },
                {
                  key: "whatsappResults",
                  label: "WhatsApp Results",
                  desc: "Send results via WhatsApp Business API",
                },
                {
                  key: "lowStockAlerts",
                  label: "Low Stock Alerts",
                  desc: "Notify manager when inventory is low",
                },
                {
                  key: "appointmentReminders",
                  label: "Appointment Reminders",
                  desc: "Send reminders 24h before appointments",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-4 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={
                      notifications[item.key as keyof typeof notifications]
                    }
                    onCheckedChange={(v) =>
                      setNotifications((p) => ({ ...p, [item.key]: v }))
                    }
                  />
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <Button onClick={() => save("Notifications")}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Print Settings */}
        <TabsContent value="print" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">
                Report & Print Configuration
              </CardTitle>
              <CardDescription>
                Customize how reports are generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Paper Size</Label>
                  <Select defaultValue="A4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Signature Style</Label>
                  <Select defaultValue="digital">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="typed">Typed Name</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-y border-border">
                <div>
                  <p className="text-sm font-medium">Include QR Code</p>
                  <p className="text-xs text-muted-foreground">
                    Embed QR code for report verification
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save("Print")}>
                  Save Print Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
              <CardDescription>
                Manage authentication and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                {
                  label: "Two-Factor Authentication (MFA)",
                  desc: "Require MFA for all staff logins",
                  defaultChecked: true,
                },
                {
                  label: "Session Timeout",
                  desc: "Auto-logout after 30 minutes of inactivity",
                  defaultChecked: true,
                },
                {
                  label: "Audit Logs",
                  desc: "Track all user actions and changes",
                  defaultChecked: true,
                },
                {
                  label: "IP Restriction",
                  desc: "Restrict access to specific IP ranges",
                  defaultChecked: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-4 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <Button onClick={() => save("Security")}>
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
