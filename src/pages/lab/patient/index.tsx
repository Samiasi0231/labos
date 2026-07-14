import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Plus, Filter, Eye } from "lucide-react";
import { PortalAccessBadge } from "@/components/lab/PortalAccessBadge";
import { PortalActionMenu } from "@/components/lab/PortalActionMenu";
import { usePatientsList } from "@/hooks/use-patients";
import { usePortalAccess } from "@/hooks/use-portal-access";
import { derivePortalAccess } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { PatientGender } from "@/api/types/patients";

function calculateAge(dob: string): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  return `${m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? age - 1 : age}`;
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"All" | PatientGender>(
    "All",
  );
  const navigate = useNavigate();

  const { patients, isLoading, listUrl } = usePatientsList({
    search: search || undefined,
    gender: genderFilter === "All" ? undefined : genderFilter,
    limit: 100,
  });

  const { grant, resend, revoke } = usePortalAccess("patient", [listUrl]);

  const handleGrant = async (id: string) => {
    await grant(id);
  };
  const handleResend = async (id: string) => {
    await resend(id);
  };
  const handleRevoke = async (id: string) => {
    await revoke(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Patient Registry</h2>
          <p className="text-sm text-muted-foreground">
            {patients.length} patients registered
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/lab/register")}>
          <Plus className="w-4 h-4" />
          Register Patient
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={genderFilter}
              onValueChange={(v) => setGenderFilter(v as "All" | PatientGender)}
            >
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Patient Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Gender</TableHead>
                  <TableHead className="hidden lg:table-cell">Age</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Registered
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Portal</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Loading patients…
                    </TableCell>
                  </TableRow>
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => {
                    const fullName = `${patient.firstName} ${patient.lastName}`;
                    const access = derivePortalAccess(patient.user);
                    return (
                      <TableRow
                        key={patient._id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/lab/patients/${patient._id}`)}
                      >
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                          {patient.code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {fullName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {patient.email ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {patient.phone}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className={
                              patient.gender === "female"
                                ? "border-pink-300 text-pink-600 bg-pink-50"
                                : "border-blue-300 text-blue-600 bg-blue-50"
                            }
                          >
                            {patient.gender.charAt(0).toUpperCase() +
                              patient.gender.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {calculateAge(patient.dob)} yrs
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <PortalAccessBadge access={access} />
                        </TableCell>
                        <TableCell className="pr-4">
                          <div
                            className="flex items-center justify-end gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="link"
                              className="h-auto py-0 px-1 text-[12px] gap-1"
                              onClick={() =>
                                navigate(`/lab/patients/${patient._id}`)
                              }
                            >
                              View
                            </Button>
                            <PortalActionMenu
                              id={patient._id}
                              name={fullName}
                              email={patient.email}
                              portalAccess={access}
                              onGrant={handleGrant}
                              onResend={handleResend}
                              onRevoke={handleRevoke}
                              variant="menu"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
