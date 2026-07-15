import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bell, Shield, Printer } from "lucide-react";
import Profile from "./profile";
import { NotificationsTab } from "./notifications-tab";
import { PrintTab } from "./print-tab";
import { SecurityTab } from "./security-tab";

export default function Settings() {
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

        <Profile />
        <NotificationsTab />
        <PrintTab />
        <SecurityTab />
      </Tabs>
    </div>
  );
}
