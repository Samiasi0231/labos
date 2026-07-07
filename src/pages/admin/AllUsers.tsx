import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Shield, UserCheck, UserX, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "Lab Owner" | "Lab Manager" | "Lab Scientist" | "Receptionist" | "Doctor" | "Super Admin";
type UserStatus = "Active" | "Inactive" | "Suspended";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lab: string;
  status: UserStatus;
  lastSeen: string;
  joinedDate: string;
}

const initialUsers: PlatformUser[] = [
  { id: "USR-001", name: "Dr. Nnenna Okafor", email: "nnenna@healthfirst.ng", role: "Lab Owner", lab: "HealthFirst Laboratories", status: "Active", lastSeen: "2 mins ago", joinedDate: "2022-01-15" },
  { id: "USR-002", name: "Chidi Obi", email: "chidi@healthfirst.ng", role: "Lab Manager", lab: "HealthFirst Laboratories", status: "Active", lastSeen: "1h ago", joinedDate: "2022-02-10" },
  { id: "USR-003", name: "Dr. Emeka Nwachukwu", email: "emeka@accumed.ng", role: "Lab Owner", lab: "AccuMed Diagnostics", status: "Active", lastSeen: "3h ago", joinedDate: "2022-06-20" },
  { id: "USR-004", name: "Grace Ekene", email: "grace@healthfirst.ng", role: "Lab Scientist", lab: "HealthFirst Laboratories", status: "Active", lastSeen: "30m ago", joinedDate: "2022-05-01" },
  { id: "USR-005", name: "Kemi Adewale", email: "kemi@healthfirst.ng", role: "Receptionist", lab: "HealthFirst Laboratories", status: "Active", lastSeen: "5m ago", joinedDate: "2022-04-15" },
  { id: "USR-006", name: "Dr. Bello Musa", email: "bello@citydiag.ng", role: "Lab Owner", lab: "CityDiag Ikeja", status: "Active", lastSeen: "1d ago", joinedDate: "2021-11-10" },
  { id: "USR-007", name: "Fatima Usman", email: "fatima@biotest.ng", role: "Lab Scientist", lab: "BioTest Lagos", status: "Inactive", lastSeen: "5d ago", joinedDate: "2023-03-20" },
  { id: "USR-008", name: "Dr. Ayo Adeleke", email: "ayo@citydiag.ng", role: "Doctor", lab: "CityDiag Ikeja", status: "Active", lastSeen: "2h ago", joinedDate: "2022-01-20" },
  { id: "USR-009", name: "Seun Ogun", email: "seun@quickscan.ng", role: "Lab Manager", lab: "QuickScan Ibadan", status: "Suspended", lastSeen: "30d ago", joinedDate: "2022-09-20" },
  { id: "USR-010", name: "System Admin", email: "super@labos.ng", role: "Super Admin", lab: "—", status: "Active", lastSeen: "Now", joinedDate: "2021-01-01" },
];

const roleColors: Record<UserRole, string> = {
  "Super Admin": "bg-destructive/10 text-destructive border-destructive/30",
  "Lab Owner": "bg-primary/10 text-primary border-primary/30",
  "Lab Manager": "bg-info/10 text-info border-info/30",
  "Lab Scientist": "bg-accent/10 text-accent border-accent/30",
  "Receptionist": "bg-warning/10 text-warning border-warning/30",
  "Doctor": "bg-purple-500/10 text-purple-600 border-purple-300",
};

const statusColor: Record<UserStatus, string> = {
  Active: "bg-success/10 text-success border-success/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AllUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filtered = users.filter(u => {
    const matchTab = activeTab === "All" || (activeTab === "Super Admin" ? u.role === "Super Admin" : u.role === activeTab as UserRole);
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.lab.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabDefs = ["All", "Lab Owner", "Lab Manager", "Lab Scientist", "Receptionist", "Doctor"];
  const tabCounts = tabDefs.map(t => ({
    t, c: t === "All" ? users.length : users.filter(u => u.role === t).length
  }));

  const toggleStatus = (id: string, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    toast({ title: "User Updated", description: `User ${id} status changed to ${newStatus}.` });
  };

  const roleStats = [
    { role: "Lab Owner", count: users.filter(u => u.role === "Lab Owner").length, icon: Shield },
    { role: "Lab Manager", count: users.filter(u => u.role === "Lab Manager").length, icon: UserCheck },
    { role: "Lab Scientist", count: users.filter(u => u.role === "Lab Scientist").length, icon: UserCheck },
    { role: "Receptionist", count: users.filter(u => u.role === "Receptionist").length, icon: UserCheck },
  ];

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">All Users</h2>
        <p className="text-sm text-muted-foreground">{users.length} users across all labs on the platform</p>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roleStats.map(s => (
          <Card key={s.role} className="shadow-card p-4">
            <p className="text-2xl font-bold text-primary">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.role}s</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or lab..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-6">
          <div className="overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1 min-w-max">
                {tabCounts.map(({ t, c }) => (
                  <TabsTrigger key={t} value={t} className="gap-1.5 text-xs">
                    {t} <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{c}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Laboratory</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No users found.</TableCell></TableRow>
                ) : filtered.map(user => (
                  <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${roleColors[user.role]}`}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.lab !== "—" ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="w-3 h-3 flex-shrink-0" />{user.lab}
                        </span>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{user.joinedDate}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{user.lastSeen}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${statusColor[user.status]}`}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          {user.status === "Active" && (
                            <DropdownMenuItem className="text-warning" onClick={() => toggleStatus(user.id, "Suspended")}>
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          {user.status === "Suspended" && (
                            <DropdownMenuItem className="text-success" onClick={() => toggleStatus(user.id, "Active")}>
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
