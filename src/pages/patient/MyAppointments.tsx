import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Stethoscope, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ApptStatus = "Upcoming" | "Completed" | "Cancelled";

interface Appointment {
  id: string;
  test: string;
  date: string;
  time: string;
  lab: string;
  address: string;
  status: ApptStatus;
  notes?: string;
  instructions?: string;
}

const initialAppts: Appointment[] = [
  {
    id: "APT-004", test: "Kidney Function Test", date: "Jun 20, 2024", time: "09:00 AM",
    lab: "HealthFirst Laboratories", address: "14 Medical Road, Victoria Island, Lagos",
    status: "Upcoming",
    instructions: "Fast for 8–12 hours before the test. Bring your patient card.",
  },
  {
    id: "APT-007", test: "Full Blood Count Follow-up", date: "Jul 03, 2024", time: "10:30 AM",
    lab: "HealthFirst Laboratories", address: "14 Medical Road, Victoria Island, Lagos",
    status: "Upcoming",
    instructions: "No special preparation required.",
  },
  {
    id: "APT-001", test: "Full Blood Count", date: "Jun 17, 2024", time: "08:30 AM",
    lab: "HealthFirst Laboratories", address: "14 Medical Road, Victoria Island, Lagos",
    status: "Completed",
  },
  {
    id: "APT-002", test: "Blood Glucose (Fasting)", date: "Jun 05, 2024", time: "07:45 AM",
    lab: "HealthFirst Laboratories", address: "14 Medical Road, Victoria Island, Lagos",
    status: "Completed",
    notes: "Arrived on time. Sample collected successfully.",
  },
  {
    id: "APT-003", test: "Urinalysis", date: "Mar 14, 2024", time: "09:15 AM",
    lab: "HealthFirst Laboratories", address: "14 Medical Road, Victoria Island, Lagos",
    status: "Cancelled",
  },
];

const statusConfig: Record<ApptStatus, { color: string; icon: typeof CheckCircle }> = {
  Upcoming: { color: "bg-primary/10 text-primary border-primary/30", icon: Clock },
  Completed: { color: "bg-success/10 text-success border-success/30", icon: CheckCircle },
  Cancelled: { color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

export default function MyAppointments() {
  const { toast } = useToast();
  const [appts, setAppts] = useState<Appointment[]>(initialAppts);
  const [activeTab, setActiveTab] = useState("Upcoming");

  const filtered = appts.filter(a => a.status === activeTab);
  const tabCounts = (["Upcoming", "Completed", "Cancelled"] as ApptStatus[]).map(t => ({
    t, c: appts.filter(a => a.status === t).length
  }));

  const cancel = (id: string) => {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status: "Cancelled" } : a));
    toast({ title: "Appointment Cancelled", description: "Your appointment has been cancelled." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">My Appointments</h2>
        <p className="text-sm text-muted-foreground">
          {appts.filter(a => a.status === "Upcoming").length} upcoming · {appts.filter(a => a.status === "Completed").length} completed
        </p>
      </div>

      {/* Upcoming count */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{appts.filter(a => a.status === "Upcoming").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
        </Card>
        <Card className="shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{appts.filter(a => a.status === "Completed").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </Card>
        <Card className="shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{appts.filter(a => a.status === "Cancelled").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Cancelled</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="gap-1">
          {tabCounts.map(({ t, c }) => (
            <TabsTrigger key={t} value={t} className="gap-2 text-xs">
              {t} <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{c}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Appointment cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No {activeTab.toLowerCase()} appointments found.
            </CardContent>
          </Card>
        ) : filtered.map(appt => {
          const cfg = statusConfig[appt.status];
          return (
            <Card key={appt.id} className={`shadow-card transition-colors ${appt.status === "Upcoming" ? "border-primary/20" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-center border border-primary/20">
                    <p className="text-lg font-bold text-primary leading-tight">
                      {appt.date.split(",")[0].split(" ")[1]}
                    </p>
                    <p className="text-[10px] text-primary font-medium uppercase">
                      {appt.date.split(" ")[0]}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-base font-semibold">{appt.test}</p>
                      <Badge variant="outline" className={`text-xs border ${cfg.color}`}>
                        {appt.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{appt.time}</p>
                      <p className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />{appt.lab}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{appt.address}</p>
                    </div>

                    {appt.instructions && appt.status === "Upcoming" && (
                      <div className="mt-3 p-3 bg-info/5 border border-info/20 rounded-lg">
                        <p className="text-xs font-semibold text-info mb-0.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />Preparation Instructions
                        </p>
                        <p className="text-xs text-muted-foreground">{appt.instructions}</p>
                      </div>
                    )}

                    {appt.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{appt.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {appt.status === "Upcoming" && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <Phone className="w-3 h-3" />Call Lab
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => cancel(appt.id)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Note */}
      {activeTab === "Upcoming" && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          To reschedule or cancel, call the lab directly or use the button above.
        </p>
      )}
    </div>
  );
}
