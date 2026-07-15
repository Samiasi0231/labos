import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApi, useMyPermissions } from "@/hooks/use-api";
import type {
  AssignmentItem,
  AssignmentListResponse,
  TestOrderItemStatus,
} from "@/api/types/test-order";
import endpoint from "@/api/endpoints";
import { TestCard, TABS, TAB_LABEL } from "./test-card";
import { StartTestDialog } from "./start-test-dialog";

export default function AssignedTests() {
  const navigate = useNavigate();
  const { can } = useMyPermissions();

  const [tab, setTab] = useState<TestOrderItemStatus>("assigned");
  const [page, setPage] = useState(1);
  const [startTestItem, setStartTestItem] = useState<AssignmentItem | null>(
    null,
  );

  const assignmentsParams = new URLSearchParams({
    page: String(page),
    limit: "20",
  });
  if (tab !== "all") assignmentsParams.set("status", tab);

  const {
    data: assignmentsData,
    error,
    isLoading,
    mutate: refetch,
  } = useApi<AssignmentListResponse>(
    `${endpoint.lab.testOrders.assignments}?${assignmentsParams}`,
  );

  const items = assignmentsData?.data?.docs ?? [];
  const pagination = assignmentsData?.data
    ? {
      totalDocs: assignmentsData.data.totalDocs,
      page: assignmentsData.data.page,
      totalPages: assignmentsData.data.totalPages,
      hasNextPage: assignmentsData.data.hasNextPage,
      hasPrevPage: assignmentsData.data.hasPrevPage,
    }
    : null;

  const handleTabChange = (value: string) => {
    setTab(value as TestOrderItemStatus);
    setPage(1);
  };

  const handleEnterResult = (item: AssignmentItem) => {
    const patient = item.testOrder.patient;
    navigate("/lab/result-entry", {
      state: {
        orderId: item.testOrder._id,
        itemId: item._id,
        testName: item.testName,
        patientName: `${patient.firstName} ${patient.lastName}`.trim(),
        patientId: patient._id,
        priority: item.testOrder.priority,
      },
    });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading assigned tests…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center bg-card border border-border rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">
          Couldn't load your assigned tests.
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Assigned Tests</h2>
        <p className="text-sm text-muted-foreground">
          {pagination?.totalDocs ?? 0} item
          {(pagination?.totalDocs ?? 0) !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="bg-muted rounded-lg p-1 h-auto gap-0.5">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs font-semibold px-3 py-1.5">
              {TAB_LABEL[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center bg-card border border-border rounded-2xl">
          <FlaskConical className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No {TAB_LABEL[tab].toLowerCase()} tests found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <TestCard
              key={item._id}
              item={item}
              canProcess={can("tests.process")}
              isStarting={startTestItem?._id === item._id}
              onOpenStartDialog={() => setStartTestItem(item)}
              onEnterResult={() => handleEnterResult(item)}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      <StartTestDialog
        item={startTestItem}
        onClose={() => setStartTestItem(null)}
        onStarted={() => {
          setStartTestItem(null);
          refetch();
        }}
      />
    </div>
  );
}
