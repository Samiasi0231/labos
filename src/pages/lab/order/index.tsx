import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { OrderTable } from "@/components/lab/OrderTable";
import { CreateOrderSheet } from "./create";
import { useMyPermissions } from "@/hooks/use-permissions";

export default function Tests() {
  const { can } = useMyPermissions();
  const location = useLocation();

  const [showCreate, setShowCreate] = useState(false);
  const [initialState, setInitialState] = useState<{ patientId?: string; patientName?: string }>({});

  // Deep-link from patient profile
  useEffect(() => {
    const state = location.state as { openCreate?: boolean; patientId?: string; patientName?: string } | null;
    if (state?.openCreate) {
      setInitialState({ patientId: state.patientId, patientName: state.patientName });
      setShowCreate(true);
      window.history.replaceState({}, "");
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Test Orders</h2>
          <p className="text-sm text-muted-foreground">Manage and track lab test orders</p>
        </div>
      </div>

      <OrderTable
        action={
          can("tests.create") ? (
            <Button className="gap-2" onClick={() => { setInitialState({}); setShowCreate(true); }}>
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          ) : undefined
        }
      />

      <CreateOrderSheet
        open={showCreate}
        onOpenChange={setShowCreate}
        initialState={initialState}
      />
    </div>
  );
}
