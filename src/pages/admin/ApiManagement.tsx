import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Code2, Plus, Copy, Eye, EyeOff, RefreshCw, Trash2,
  Activity, Shield, Zap, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  lab: string;
  key: string;
  status: "Active" | "Revoked";
  created: string;
  lastUsed: string;
  callsToday: number;
  callsLimit: number;
  permissions: string[];
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "KEY-001", name: "HealthFirst Production", lab: "HealthFirst Laboratories", key: "lbos_live_hfl_a1b2c3d4e5f6789012345678", status: "Active", created: "2024-01-15", lastUsed: "5m ago", callsToday: 840, callsLimit: 5000, permissions: ["results.read", "results.write", "patients.read"] },
  { id: "KEY-002", name: "AccuMed Integration", lab: "AccuMed Diagnostics", key: "lbos_live_amd_b2c3d4e5f6789012345678a", status: "Active", created: "2024-02-20", lastUsed: "2h ago", callsToday: 320, callsLimit: 2000, permissions: ["results.read", "reports.download"] },
  { id: "KEY-003", name: "CityDiag Webhook", lab: "CityDiag Ikeja", key: "lbos_live_cdg_c3d4e5f6789012345678ab2", status: "Active", created: "2024-03-10", lastUsed: "1d ago", callsToday: 95, callsLimit: 1000, permissions: ["webhooks.receive"] },
  { id: "KEY-004", name: "NovaDiag Test Key", lab: "NovaDiag Abuja", key: "lbos_test_nvd_d4e5f6789012345678abc3", status: "Revoked", created: "2024-04-01", lastUsed: "15d ago", callsToday: 0, callsLimit: 500, permissions: ["results.read"] },
];

const endpointStats = [
  { endpoint: "GET /results", calls: 14820, avgMs: 124, errors: 12 },
  { endpoint: "POST /tests", calls: 8340, avgMs: 210, errors: 5 },
  { endpoint: "GET /patients", calls: 6120, avgMs: 89, errors: 3 },
  { endpoint: "GET /reports/download", calls: 2480, avgMs: 840, errors: 18 },
  { endpoint: "POST /webhooks", calls: 1920, avgMs: 56, errors: 2 },
];

export default function ApiManagement() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyLab, setNewKeyLab] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const toggleShow = (id: string) => setShowKeys(p => ({ ...p, [id]: !p[id] }));

  const maskKey = (key: string) => key.slice(0, 16) + "••••••••••••••••••••••••";

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied", description: "API key copied to clipboard." });
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "Revoked" } : k));
    toast({ title: "Key Revoked", description: `API key ${id} has been revoked.` });
  };

  const handleGenerate = () => {
    if (!newKeyName || !newKeyLab) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const newKey = `lbos_live_${newKeyLab.slice(0, 3).toLowerCase()}_${Math.random().toString(36).slice(2, 26)}`;
    setGeneratedKey(newKey);
    const entry: ApiKey = {
      id: `KEY-${String(keys.length + 1).padStart(3, "0")}`,
      name: newKeyName,
      lab: newKeyLab,
      key: newKey,
      status: "Active",
      created: "2024-06-17",
      lastUsed: "Never",
      callsToday: 0,
      callsLimit: 1000,
      permissions: ["results.read"],
    };
    setKeys([entry, ...keys]);
  };

  const activeKeys = keys.filter(k => k.status === "Active");
  const totalCallsToday = keys.reduce((s, k) => s + k.callsToday, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">API Management</h2>
          <p className="text-sm text-muted-foreground">Manage API keys and monitor platform API usage</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setGeneratedKey(null); setNewKeyName(""); setNewKeyLab(""); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Generate API Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Generate New API Key</DialogTitle></DialogHeader>
            {!generatedKey ? (
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Key Name</Label>
                  <Input placeholder="e.g. HealthFirst Production" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Laboratory</Label>
                  <Input placeholder="Lab name" value={newKeyLab} onChange={e => setNewKeyLab(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />Copy this key now — it won't be shown again.
                </div>
                <div className="bg-muted rounded-lg p-3 font-mono text-xs break-all">{generatedKey}</div>
                <Button variant="outline" className="w-full gap-2" onClick={() => copyKey(generatedKey)}>
                  <Copy className="w-4 h-4" />Copy Key
                </Button>
              </div>
            )}
            <DialogFooter>
              {!generatedKey ? (
                <>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleGenerate}>Generate</Button>
                </>
              ) : (
                <Button onClick={() => setOpen(false)}>Done</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Active Keys</p>
          <p className="text-2xl font-bold text-primary mt-1">{activeKeys.length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">API Calls Today</p>
          <p className="text-2xl font-bold mt-1">{totalCallsToday.toLocaleString()}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Avg Response Time</p>
          <p className="text-2xl font-bold text-info mt-1">264ms</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Error Rate</p>
          <p className="text-2xl font-bold text-success mt-1">0.24%</p>
        </Card>
      </div>

      {/* API keys table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">API Keys</CardTitle>
          <CardDescription>{keys.length} keys total · {activeKeys.length} active</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Key Name</TableHead>
                  <TableHead className="hidden md:table-cell">Lab</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="hidden lg:table-cell">Usage Today</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map(k => (
                  <TableRow key={k.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6">
                      <p className="text-sm font-medium">{k.name}</p>
                      <p className="text-xs text-muted-foreground">{k.id} · created {k.created}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{k.lab}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded max-w-[180px] truncate block">
                          {showKeys[k.id] ? k.key : maskKey(k.key)}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleShow(k.id)}>
                          {showKeys[k.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyKey(k.key)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={(k.callsToday / k.callsLimit) * 100} className={`h-1.5 w-20 ${k.callsToday / k.callsLimit > 0.8 ? "[&>div]:bg-warning" : ""}`} />
                        <span className="text-xs text-muted-foreground">{k.callsToday}/{k.callsLimit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{k.lastUsed}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${k.status === "Active" ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground"}`}>
                        {k.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyKey(k.key)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        {k.status === "Active" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => revokeKey(k.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint stats */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Endpoint Performance</CardTitle>
          <CardDescription>Top endpoints by call volume today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {endpointStats.map(ep => (
            <div key={ep.endpoint} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium">{ep.endpoint}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" />{ep.calls.toLocaleString()} calls
                  </span>
                  <span className="text-xs text-muted-foreground">{ep.avgMs}ms avg</span>
                  {ep.errors > 10 && (
                    <span className="text-xs text-warning flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{ep.errors} errors
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={`text-xs flex-shrink-0 ${ep.errors > 10 ? "border-warning/30 text-warning" : "border-success/30 text-success"}`}>
                {ep.errors > 10 ? "Degraded" : "Healthy"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
