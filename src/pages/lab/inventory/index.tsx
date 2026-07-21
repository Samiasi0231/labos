<<<<<<< HEAD
import { useMemo, useState } from "react";
=======
import { useState } from "react";
>>>>>>> origin/main
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Package, Activity } from "lucide-react";
<<<<<<< HEAD
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { InventoryListResponse } from "@/api/types/inventory";
=======
import { useInventoryList } from "@/hooks/use-inventory";
>>>>>>> origin/main
import { ItemsTab } from "./items-tab";
import { MovementsTab } from "./movements-tab";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<"items" | "movements">("items");

<<<<<<< HEAD
  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "100");
    return `${endpoint.lab.inventory.list}?${params.toString()}`;
  }, []);

  const { data } = useApi<InventoryListResponse>(listUrl);
  const allItems = data?.data?.docs ?? [];
=======
  const { items: allItems } = useInventoryList({ limit: 100 });
>>>>>>> origin/main
  const lowStockItems = allItems.filter((i) => i.quantityOnHand <= i.reorderLevel);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Inventory</h2>
        <p className="text-sm text-muted-foreground">
          {allItems.length} items tracked
        </p>
      </div>

      {/* Low stock banner */}
      {lowStockItems.length > 0 && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <AlertDescription className="text-warning-foreground font-medium">
            {lowStockItems.length} item(s) at or below reorder level:{" "}
            <span className="font-semibold">
              {lowStockItems.map((i) => i.name).join(", ")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: allItems.length, color: "" },
          {
            label: "Reagents",
            value: allItems.filter((i) => i.category === "reagent").length,
            color: "text-primary",
          },
          {
            label: "Consumables",
            value: allItems.filter((i) => i.category === "consumable").length,
            color: "text-amber-600",
          },
          {
            label: "Low Stock",
            value: lowStockItems.length,
            color: "text-destructive",
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "items" | "movements")}
      >
        <TabsList>
          <TabsTrigger value="items" className="gap-2">
            <Package className="w-3.5 h-3.5" />
            Items
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <Activity className="w-3.5 h-3.5" />
            Stock Movements
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "items" && <ItemsTab />}
      {activeTab === "movements" && <MovementsTab />}
    </div>
  );
}
