import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye, FilterX, CalendarX } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  Appointment,
  AppointmentListResponse,
  AppointmentStatus,
} from "@/api/types/appointments";
import type { SearchHit } from "@/api/types/search";
import { GlobalSearchSelect } from "@/components/lab/GlobalSearchSelect";
import { STATUS_CONFIG, formatDateTime, patientName } from "./shared";
import { BookDialog } from "./book-dialog";
import { DetailSheet } from "./detail-sheet";
import { CheckInDialog } from "./checkin-dialog";

const STATUS_TABS: (AppointmentStatus | "all")[] = [
  "all",
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

const TAB_LABEL: Record<AppointmentStatus | "all", string> = {
  all: "All",
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export interface AppointmentTableProps {
  /** Pre-set filters when embedded in patient profile */
  filters?: {
    patient?: string;
    start_date?: string;
    end_date?: string;
    status?: AppointmentStatus;
  };
  /** Show page header + Book button (default true when not patient-scoped) */
  showHeader?: boolean;
}

export function AppointmentTable({
  filters,
  showHeader,
}: AppointmentTableProps) {
  const isPatientView = Boolean(filters?.patient);
  const showPageHeader = showHeader ?? !isPatientView;

  const [tab, setTab] = useState<AppointmentStatus | "all">(
    filters?.status ?? "all",
  );
  const [dateFrom, setDateFrom] = useState(filters?.start_date ?? "");
  const [dateTo, setDateTo] = useState(filters?.end_date ?? "");
  const [selectedPatient, setSelectedPatient] = useState<SearchHit | null>(null);
  const [branchFilter, setBranchFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [checkinAppointment, setCheckinAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    setPage(1);
  }, [tab, dateFrom, dateTo, selectedPatient, filters?.patient, branchFilter]);

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    const patientId = filters?.patient ?? selectedPatient?.id;
    if (patientId) params.set("patient", patientId);
    if (tab !== "all") params.set("status", tab);
    const from = filters?.start_date ?? dateFrom;
    const to = filters?.end_date ?? dateTo;
    if (from) params.set("start_date", from);
    if (to) params.set("end_date", to);
    return `${endpoint.lab.appointments.list}?${params.toString()}`;
  }, [
    tab,
    page,
    dateFrom,
    dateTo,
    selectedPatient,
    filters?.patient,
    filters?.start_date,
    filters?.end_date,
  ]);

  const { data, isLoading, mutate: refetch } = useApi<AppointmentListResponse>(listUrl);
  const appointments = data?.data?.docs ?? [];
  const pagination = data?.data ?? null;

  const branches = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    appointments.forEach((a) => {
      if (a.branch && !seen.has(a.branch._id)) {
        seen.add(a.branch._id);
        list.push({ id: a.branch._id, name: a.branch.name });
      }
    });
    return list;
  }, [appointments]);

  const filtered =
    branchFilter === "all"
      ? appointments
      : appointments.filter((a) => a.branch?._id === branchFilter);

  const hasFilters =
    tab !== "all" ||
    !!dateFrom ||
    !!dateTo ||
    (!!selectedPatient && !isPatientView) ||
    branchFilter !== "all";

  const clearFilters = () => {
    setTab("all");
    setDateFrom("");
    setDateTo("");
    setSelectedPatient(null);
    setBranchFilter("all");
    setPage(1);
  };

  const handleTabChange = (t: AppointmentStatus | "all") => {
    setTab(t);
    setPage(1);
  };

  const handleOpenCheckIn = (appt: Appointment) => {
    setSelectedAppointment(null);
    setCheckinAppointment(appt);
  };

  return (
    <div className="space-y-5">
      {showPageHeader && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Appointments</h2>
            <p className="text-sm text-muted-foreground">
              {pagination?.totalDocs ?? 0} appointment
              {(pagination?.totalDocs ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowBookDialog(true)}>
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>
      )}

      {!showPageHeader && (
        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setShowBookDialog(true)}
          >
            <Plus className="w-4 h-4" />
            Book Appointment
          </Button>
        </div>
      )}

      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
              {STATUS_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTabChange(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    tab === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {TAB_LABEL[t]}
                </button>
              ))}
            </div>

            {!filters?.start_date && (
              <>
                <Input
                  type="date"
                  className="w-36 h-9 text-sm"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="w-36 h-9 text-sm"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </>
            )}

            {!isPatientView && (
              <GlobalSearchSelect
                types={["patients"]}
                placeholder="Filter by patient…"
                emptyMessage="No patients found"
                value={selectedPatient}
                onSelect={(h) => {
                  setSelectedPatient(h);
                  setPage(1);
                }}
                onClear={() => {
                  setSelectedPatient(null);
                  setPage(1);
                }}
                className="w-52"
              />
            )}

            {!isPatientView && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-muted-foreground"
                onClick={clearFilters}
              >
                <FilterX className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              {hasFilters ? (
                <>
                  <FilterX className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No appointments match your filters</p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <CalendarX className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No appointments booked yet</p>
                  <Button
                    size="sm"
                    onClick={() => setShowBookDialog(true)}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Book Appointment
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {!isPatientView && (
                      <TableHead className="pl-6">Patient</TableHead>
                    )}
                    <TableHead className={isPatientView ? "pl-6" : undefined}>
                      Tests
                    </TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead className="hidden lg:table-cell">Branch</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Booked By
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((appt) => {
                    const cfg = STATUS_CONFIG[appt.status];
                    const shown = appt.testCatalogs.slice(0, 2);
                    const overflow = appt.testCatalogs.length - 2;
                    return (
                      <TableRow
                        key={appt._id}
                        className="cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setSelectedAppointment(appt)}
                      >
                        {!isPatientView && (
                          <TableCell className="pl-6">
                            <p className="font-semibold text-sm leading-tight">
                              {patientName(appt.patient)}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">
                              {appt.patient.code}
                            </p>
                          </TableCell>
                        )}
                        <TableCell className={isPatientView ? "pl-6" : undefined}>
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {shown.map((t) => (
                              <span
                                key={t._id}
                                className="inline-flex text-[10.5px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 whitespace-nowrap"
                              >
                                {t.name}
                              </span>
                            ))}
                            {overflow > 0 && (
                              <span className="inline-flex text-[10.5px] font-semibold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                                +{overflow}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(appt.scheduledAt)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {appt.branch?.name ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {appt.bookedBy
                            ? `${appt.bookedBy.firstName} ${appt.bookedBy.lastName}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${cfg.bg} ${cfg.color} ${cfg.border} border text-xs font-semibold`}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="pr-6 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => setSelectedAppointment(appt)}
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showBookDialog && (
        <BookDialog
          open={showBookDialog}
          onClose={() => setShowBookDialog(false)}
          patientId={filters?.patient}
          invalidate={[listUrl, endpoint.lab.appointments.list]}
        />
      )}
      <DetailSheet
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCheckIn={handleOpenCheckIn}
        onMutate={refetch}
      />
      <CheckInDialog
        appointment={checkinAppointment}
        onClose={() => setCheckinAppointment(null)}
        onMutate={refetch}
      />
    </div>
  );
}
