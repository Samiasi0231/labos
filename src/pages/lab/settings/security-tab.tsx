import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const SECURITY_ITEMS = [
  {
    key: "mfa",
    label: "Two-Factor Authentication (MFA)",
    desc: "Require MFA for all staff logins",
    defaultValue: true,
  },
  {
    key: "sessionTimeout",
    label: "Session Timeout",
    desc: "Auto-logout after 30 minutes of inactivity",
    defaultValue: true,
  },
  {
    key: "auditLogs",
    label: "Audit Logs",
    desc: "Track all user actions and changes",
    defaultValue: true,
  },
  {
    key: "ipRestriction",
    label: "IP Restriction",
    desc: "Restrict access to specific IP ranges",
    defaultValue: false,
  },
] as const;

type SecurityKey = (typeof SECURITY_ITEMS)[number]["key"];

export function SecurityTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<SecurityKey, boolean>>(
    Object.fromEntries(SECURITY_ITEMS.map((i) => [i.key, i.defaultValue])) as Record<SecurityKey, boolean>,
  );

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated.",
    });
  };

  return (
    <TabsContent value="security" className="mt-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Security Settings</CardTitle>
          <CardDescription>
            Manage authentication and access control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {SECURITY_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-4 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings[item.key]}
                onCheckedChange={(v) =>
                  setSettings((p) => ({ ...p, [item.key]: v }))
                }
              />
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>Save Security Settings</Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
