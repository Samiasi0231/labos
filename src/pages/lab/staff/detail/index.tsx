import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { staffDetailUrl } from "./shared";
import type { StaffDetail } from "./shared";
import { StaffIdentityCard } from "./identity-card";
import { TabOverview } from "./tab-overview";
import { TabPermissions } from "./tab-permissions";
import { TabActivity } from "./tab-activity";
import { TabAssignedWork } from "./tab-assigned-work";
import { cn } from "@/lib/utils";

type Tab = "overview" | "permissions" | "activity" | "assigned";

function baseTabs(): { id: Tab; label: string }[] {
  return [
    { id: "overview",     label: "Overview" },
    { id: "permissions",  label: "Permissions" },
    { id: "activity",     label: "Activity Log" },
  ];
}

export default function StaffDetail() {
  const { membershipId } = useParams<{ membershipId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  const url = membershipId ? staffDetailUrl(membershipId) : null;
  const { data, isLoading, error, mutate } = useApi<StaffDetail>(url);
  const staff = data?.data ?? null;

  // Only show "Assigned Work" tab for scientist role
  const tabs = staff
    ? [
        ...baseTabs(),
        ...(staff.role === "scientist" || staff.role === "technician"
          ? [{ id: "assigned" as Tab, label: "Assigned Work" }]
          : []),
      ]
    : baseTabs();

  if (isLoading) {
    return (
      <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start max-w-[1100px] mx-auto">
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[180px] rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-80 rounded-lg" />
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[160px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="max-w-[1100px] mx-auto py-20 text-center text-muted-foreground">
        Staff member not found or you don't have access.{" "}
        <button
          className="text-primary underline cursor-pointer bg-transparent border-none"
          onClick={() => navigate("/lab/staff")}
        >
          Back to Staff
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start max-w-[1100px] mx-auto">

      {/* ── LEFT — identity (sticky on desktop) ── */}
      <div className="lg:sticky lg:top-0">
        <StaffIdentityCard
          staff={staff}
          onRoleChanged={mutate}
          onStatusChanged={mutate}
          onRemoved={() => navigate("/lab/staff")}
        />
      </div>

      {/* ── RIGHT — tabs ── */}
      <div className="flex flex-col gap-4 min-w-0">
        {/* Tab bar */}
        <div className="flex gap-0 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <TabOverview
            membershipId={staff._id}
            onViewAllActivity={() => setTab("activity")}
          />
        )}
        {tab === "permissions" && (
          <TabPermissions staff={staff} onRoleChanged={mutate} />
        )}
        {tab === "activity" && <TabActivity membershipId={staff._id} />}
        {tab === "assigned" && <TabAssignedWork />}
      </div>
    </div>
  );
}
