import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Settings, Shield, Bell, Globe, Mail, MessageSquare,
  Server, Database, Lock, AlertTriangle, CheckCircle, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    platformName: "Ezralabs",
    supportEmail: "support@ezralabs.ng",
    billingEmail: "billing@ezralabs.ng",
    defaultCurrency: "NGN",
    defaultCountry: "Nigeria",
    maintenanceMode: false,
    signupEnabled: true,
    trialDays: "30",
    maxBranches: "unlimited",
    apiRateLimit: "5000",
    sessionTimeout: "480",
    mfaRequired: false,
    ipWhitelist: false,
    auditLogs: true,
    emailNotifs: true,
    smsNotifs: true,
    whatsappNotifs: false,
    slackWebhook: "",
    smtpHost: "smtp.mailgun.org",
    smtpPort: "587",
    smtpUser: "postmaster@ezralabs.ng",
    smsProvider: "Termii",
    backupFrequency: "Daily",
    retentionDays: "365",
    maintenanceMessage: "Ezralabs is undergoing scheduled maintenance. We'll be back shortly.",
  });

  const save = (tab: string) => toast({ title: `${tab} settings saved`, description: "Configuration updated successfully." });

  const toggle = (key: keyof typeof settings) =>
    setSettings(p => ({ ...p, [key]: !p[key] }));

  const set = (key: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">System Settings</h2>
        <p className="text-sm text-muted-foreground">Platform-wide configuration for Ezralabs</p>
      </div>

      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-sm text-warning font-medium">Maintenance mode is ACTIVE. All lab portals are inaccessible to users.</p>
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2 text-xs"><Globe className="w-3.5 h-3.5" />General</TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs"><Shield className="w-3.5 h-3.5" />Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="communications" className="gap-2 text-xs"><Mail className="w-3.5 h-3.5" />Comms</TabsTrigger>
          <TabsTrigger value="system" className="gap-2 text-xs"><Server className="w-3.5 h-3.5" />System</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />Platform Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Platform Name</Label>
                  <Input value={settings.platformName} onChange={set("platformName")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Currency</Label>
                  <Select value={settings.defaultCurrency} onValueChange={v => setSettings(p => ({ ...p, defaultCurrency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Support Email</Label>
                  <Input type="email" value={settings.supportEmail} onChange={set("supportEmail")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Billing Email</Label>
                  <Input type="email" value={settings.billingEmail} onChange={set("billingEmail")} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Trial Period (days)</Label>
                  <Input type="number" value={settings.trialDays} onChange={set("trialDays")} />
                </div>
                <div className="space-y-1.5">
                  <Label>API Rate Limit (calls/day)</Label>
                  <Input type="number" value={settings.apiRateLimit} onChange={set("apiRateLimit")} />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Lab Signups</p>
                  <p className="text-xs text-muted-foreground">Allow new labs to register</p>
                </div>
                <Switch checked={settings.signupEnabled} onCheckedChange={() => toggle("signupEnabled")} />
              </div>
              <div className="flex items-center justify-between py-2 border border-warning/30 rounded-lg px-3 bg-warning/5">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    Maintenance Mode
                    {settings.maintenanceMode && <Badge className="bg-warning text-white text-[10px] px-1.5">ACTIVE</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">Takes the platform offline for all users</p>
                </div>
                <Switch checked={settings.maintenanceMode} onCheckedChange={() => toggle("maintenanceMode")} />
              </div>
              {settings.maintenanceMode && (
                <div className="space-y-1.5">
                  <Label>Maintenance Message</Label>
                  <Textarea value={settings.maintenanceMessage} onChange={set("maintenanceMessage")} rows={2} />
                </div>
              )}
            </CardContent>
          </Card>
          <Button className="gap-2" onClick={() => save("General")}><Save className="w-4 h-4" />Save General Settings</Button>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "mfaRequired" as const, label: "Require MFA for All Admins", desc: "Force two-factor authentication on all Super Admin accounts" },
                { key: "ipWhitelist" as const, label: "IP Whitelisting", desc: "Only allow access from approved IP ranges" },
                { key: "auditLogs" as const, label: "Audit Logging", desc: "Log all admin actions, user logins, and data changes" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
                </div>
              ))}
              <Separator />
              <div className="space-y-1.5">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" value={settings.sessionTimeout} onChange={set("sessionTimeout")} className="max-w-xs" />
              </div>
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                All data encrypted at rest (AES-256) and in transit (TLS 1.3)
              </div>
            </CardContent>
          </Card>
          <Button className="gap-2" onClick={() => save("Security")}><Save className="w-4 h-4" />Save Security Settings</Button>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "emailNotifs" as const, label: "Email Notifications", desc: "Receive subscription, lab, and system alerts via email" },
                { key: "smsNotifs" as const, label: "SMS Notifications", desc: "Critical alerts sent to the admin phone number" },
                { key: "whatsappNotifs" as const, label: "WhatsApp Notifications", desc: "Receive important alerts on WhatsApp" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
                </div>
              ))}
              <Separator />
              <div className="space-y-1.5">
                <Label>Slack Webhook URL</Label>
                <Input placeholder="https://hooks.slack.com/..." value={settings.slackWebhook} onChange={set("slackWebhook")} />
              </div>
            </CardContent>
          </Card>
          <Button className="gap-2" onClick={() => save("Notifications")}><Save className="w-4 h-4" />Save Notification Settings</Button>
        </TabsContent>

        {/* Communications */}
        <TabsContent value="communications" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />Email (SMTP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>SMTP Host</Label>
                  <Input value={settings.smtpHost} onChange={set("smtpHost")} />
                </div>
                <div className="space-y-1.5">
                  <Label>SMTP Port</Label>
                  <Input value={settings.smtpPort} onChange={set("smtpPort")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>SMTP Username</Label>
                <Input value={settings.smtpUser} onChange={set("smtpUser")} />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP Password</Label>
                <Input type="password" placeholder="••••••••••••" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />SMS / WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>SMS Provider</Label>
                  <Select value={settings.smsProvider} onValueChange={v => setSettings(p => ({ ...p, smsProvider: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Termii">Termii</SelectItem>
                      <SelectItem value="Twilio">Twilio</SelectItem>
                      <SelectItem value="BULK SMS">BulkSMS Nigeria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Provider API key" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Button className="gap-2" onClick={() => save("Communications")}><Save className="w-4 h-4" />Save Comms Settings</Button>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="mt-4 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />Backup & Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={v => setSettings(p => ({ ...p, backupFrequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data Retention (days)</Label>
                  <Input type="number" value={settings.retentionDays} onChange={set("retentionDays")} />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Database", status: "Healthy", size: "24.6 GB", color: "text-success border-success/30 bg-success/10" },
                  { label: "File Storage", status: "Healthy", size: "128.4 GB", color: "text-success border-success/30 bg-success/10" },
                  { label: "Cache", status: "Healthy", size: "512 MB", color: "text-success border-success/30 bg-success/10" },
                ].map(sys => (
                  <div key={sys.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{sys.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{sys.size}</span>
                      <Badge variant="outline" className={`text-xs border ${sys.color}`}>{sys.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button className="gap-2" onClick={() => save("System")}><Save className="w-4 h-4" />Save System Settings</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
