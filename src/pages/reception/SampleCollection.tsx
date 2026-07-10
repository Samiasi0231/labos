import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  TestTube,
  Zap,
  Flame,
  CheckCircle2,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { useTestOrderList, useCollectSample } from "@/hooks/use-testorder";
import { useToast } from "@/hooks/use-toast";
import type { TestOrder, TestOrderPriority } from "@/api/types/test-order";


function PriorityBadge({ priority }: { priority: TestOrderPriority }) {
  if (priority === "stat")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
        <Flame className="w-3 h-3" />
        Stat
      </Badge>
    );
  if (priority === "urgent")
    return (
      <Badge className="bg-warning/15 text-warning border-warning/30 border text-xs gap-1">
        <Zap className="w-3 h-3" />
        Urgent
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      Routine
    </Badge>
  );
}

function getPatientName(order: TestOrder): string {
  return typeof order.patient === "string"
    ? "Unknown patient"
    : order.patient.name;
}

function getPatientGender(order: TestOrder): string {
  return typeof order.patient === "string" ? "" : (order.patient.gender ?? "");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const SAMPLE_TYPES = [
  "Venous Blood",
  "Capillary Blood",
  "Urine",
  "Stool",
  "Swab",
  "CSF",
  "Sputum",
  "Other",
];

const CONTAINERS = [
  "EDTA Tube (Purple)",
  "SST/Gel Tube (Yellow)",
  "Plain Tube (Red)",
  "Fluoride Tube (Grey)",
  "Sodium Citrate Tube (Blue)",
  "Urine Cup",
  "Stool Container",
  "Swab",
  "Sputum Container",
  "Other",
];

export default function SampleCollection() {
  const { toast } = useToast();

  const {
    orders: pendingOrdersRaw,
    isLoading,
    error,
    refetch,
  } = useTestOrderList({ status: "pending" });
  const { orders: collectedOrders } = useTestOrderList({
    status: "sample_collected",
  });
  const { collectSample, isLoading: isCollecting } = useCollectSample();

  const [search, setSearch] = useState("");
  const [collectTarget, setCollectTarget] = useState<string | null>(null); // orderId
  const [containerType, setContainerType] = useState("");
  const [itemSamples, setItemSamples] = useState<Record<string, string>>({});
  const pendingOrders = pendingOrdersRaw.filter((o) =>
    getPatientName(o).toLowerCase().includes(search.toLowerCase()),
  );

  const targetOrder =
    pendingOrdersRaw.find((o) => o._id === collectTarget) ?? null;

  const urgentOrStatCount = pendingOrdersRaw.filter(
    (o) => o.priority === "stat" || o.priority === "urgent",
  ).length;

  const openCollect = (orderId: string) => {
    const order = pendingOrdersRaw.find((o) => o._id === orderId);
    if (!order) return;
    setCollectTarget(orderId);
    setContainerType(order.containerType ?? "");
    const init: Record<string, string> = {};
    order.items.forEach((item) => {
      init[item._id] = item.sampleType || "";
    });
    setItemSamples(init);
  };

  const allFilled =
    !!targetOrder &&
    !!containerType &&
    targetOrder.items.every(
      (item) => (itemSamples[item._id] ?? "").trim() !== "",
    );

  const handleSubmit = async () => {
    if (!targetOrder) return;
    try {
      await collectSample(targetOrder._id, {
        containerType,
        items: targetOrder.items.map((item) => ({
          itemId: item._id,
          sampleType: itemSamples[item._id] ?? "",
        })),
      });
      setCollectTarget(null);
      toast({
        title: "Sample collected",
        description: `Order for ${getPatientName(targetOrder)} moved to Sample Collected.`,
      });
      refetch();
    } catch (err) {
      toast({
        title: "Failed to record collection",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="pt-6 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          Couldn't load sample collection orders. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Sample Collection</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${pendingOrders.length} order${pendingOrders.length !== 1 ? "s" : ""} awaiting sample collection`}
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full col-span-2 md:col-span-1" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="shadow-card p-4">
            <p className="text-2xl font-bold text-warning">
              {pendingOrdersRaw.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pending Collection
            </p>
          </Card>
          <Card className="shadow-card p-4">
            <p className="text-2xl font-bold text-info">
              {collectedOrders.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sample Collected
            </p>
          </Card>
          <Card className="shadow-card p-4 col-span-2 md:col-span-1">
            <p className="text-2xl font-bold text-destructive">
              {urgentOrStatCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Urgent / Stat Orders
            </p>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name (current page only)..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Patient</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="hidden sm:table-cell">Tests</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Order ID
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ) : pendingOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-14 text-muted-foreground text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Droplets className="w-8 h-8 text-muted-foreground/30" />
                        <span>No orders awaiting sample collection.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingOrders.map((order) => {
                    const name = getPatientName(order);
                    return (
                      <TableRow
                        key={order._id}
                        className={`hover:bg-muted/20 transition-colors ${
                          order.priority === "stat"
                            ? "border-l-2 border-l-destructive"
                            : order.priority === "urgent"
                              ? "border-l-2 border-l-warning"
                              : ""
                        }`}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {getInitials(name)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">
                                {getPatientGender(order)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={order.priority} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {order.items.length} test
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs font-mono text-muted-foreground">
                            {order._id}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(
                            order.date ?? order.createdAt,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => openCollect(order._id)}
                          >
                            <TestTube className="w-3.5 h-3.5" />
                            Collect Sample
                          </Button>
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

      {/* ─── COLLECT SAMPLE DIALOG ─── */}
      <Dialog
        open={!!targetOrder}
        onOpenChange={(v) => {
          if (!v) setCollectTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {targetOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-primary" />
                  Collect Sample
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium">
                    {getPatientName(targetOrder)}
                  </span>
                  <PriorityBadge priority={targetOrder.priority} />
                </div>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div className="space-y-1.5">
                  <Label>
                    Container Type{" "}
                    <span className="text-muted-foreground text-xs">
                      (applies to all items)
                    </span>
                  </Label>
                  <Select
                    value={containerType}
                    onValueChange={setContainerType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select container" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTAINERS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-semibold">Sample Type per Test</p>
                  <p className="text-xs text-muted-foreground">
                    All fields are required before submitting.
                  </p>
                  {targetOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 border border-border rounded-xl space-y-2"
                    >
                      <p className="text-sm font-medium">{item.testName}</p>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Sample Type{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={itemSamples[item._id] ?? ""}
                          onValueChange={(v) =>
                            setItemSamples((prev) => ({
                              ...prev,
                              [item._id]: v,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select sample type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {SAMPLE_TYPES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {!allFilled && (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
                    Select a container and fill in sample type for all{" "}
                    {targetOrder.items.length} test
                    {targetOrder.items.length !== 1 ? "s" : ""} to continue.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCollectTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!allFilled || isCollecting}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCollecting ? "Saving..." : "Confirm Collection"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
