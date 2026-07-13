import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ── Mock data ─────────────────────────────────────────────────────────────────

type ApptStatus = "Scheduled" | "Completed" | "Cancelled";

interface Appointment {
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: ApptStatus;
}

const APPOINTMENTS: Appointment[] = [
  { date: "2026-07-25", time: "9:00 AM",  doctor: "Dr. Ngozi Eze",    type: "Annual Check-up",        status: "Scheduled"  },
  { date: "2026-07-18", time: "10:30 AM", doctor: "Dr. Tunde Bakare", type: "Follow-up Consultation", status: "Scheduled"  },
  { date: "2026-06-20", time: "2:00 PM",  doctor: "Dr. Tunde Bakare", type: "Result Review",          status: "Completed"  },
  { date: "2026-06-02", time: "11:15 AM", doctor: "Dr. Chidi Nwosu",  type: "Consultation",           status: "Completed"  },
  { date: "2026-05-14", time: "3:30 PM",  doctor: "Dr. Ngozi Eze",    type: "Consultation",           status: "Cancelled"  },
];

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CLS: Record<ApptStatus, string> = {
  Scheduled: "bg-info/15 text-info border-info/30 border",
  Completed: "bg-success/15 text-success border-success/30 border",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30 border",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] +
    " " + d.getDate() + ", " + d.getFullYear();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyAppointments() {
  const sorted = [...APPOINTMENTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Appointments</h2>
        <p className="text-sm text-muted-foreground">Upcoming and past appointments</p>
      </div>

      <Card className="shadow-card p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6">Date &amp; Time</TableHead>
              <TableHead className="hidden sm:table-cell">Doctor / Clinician</TableHead>
              <TableHead className="hidden md:table-cell">Type / Reason</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-14 text-muted-foreground text-sm">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((a, i) => (
                <TableRow key={i} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-6 text-sm font-medium whitespace-nowrap">
                    {fmtDate(a.date)} · {a.time}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {a.doctor}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {a.type}
                  </TableCell>
                  <TableCell className="pr-6">
                    <Badge className={`text-xs ${STATUS_CLS[a.status]}`}>
                      {a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
