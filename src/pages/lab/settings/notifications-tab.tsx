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

const NOTIFICATION_ITEMS = [
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
] as const;

type NotificationKey = (typeof NOTIFICATION_ITEMS)[number]["key"];

export function NotificationsTab() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    emailResults: true,
    smsResults: false,
    whatsappResults: true,
    lowStockAlerts: true,
    appointmentReminders: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Notifications settings have been updated.",
    });
  };

  return (
    <TabsContent value="notifications" className="mt-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
          <CardDescription>
            Configure how results and alerts are delivered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-4 border-b border-border last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(v) =>
                  setNotifications((p) => ({ ...p, [item.key]: v }))
                }
              />
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
