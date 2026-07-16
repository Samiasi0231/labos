import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { staffDetailUrl } from "./shared";
import type { StaffDetail } from "./shared";
import { StaffIdentityCard } from "./identity-card";
import { TabOverview } from "./tab-overview";
import { TabPermissions } from "./tab-permissions";
import { TabActivity } from "./tab-activity";
import { TabAssignedWork } from "./tab-assigned-work";
import { concatStrings } from "@/lib/utils";

export default function StaffDetail() {
  const { membershipId } = useParams<{ membershipId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const url = membershipId ? staffDetailUrl(membershipId) : null;
  const { data, isLoading, error, mutate } = useApi<StaffDetail>(url);
  const staff = data?.data ?? null;
  const name = concatStrings(staff?.user?.firstName, staff?.user?.lastName, " ");

  const showAssigned =
    staff?.role === "scientist" || staff?.role === "technician";

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-5">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-48 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
          <div className="flex flex-col gap-3.5">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[175px] rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[160px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="max-w-[1100px] mx-auto py-20 text-center text-muted-foreground text-sm">
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
    <div className="max-w-[1100px] mx-auto">

      {/* ── Breadcrumb ── matches design header style */}
      <p className="text-[13px] text-muted-foreground mb-5">
        <Link to="/lab/staff" className="hover:text-foreground transition-colors">
          Staff
        </Link>
        <ChevronRight className="inline w-3.5 h-3.5 mx-1.5 opacity-50" />
        <span className="text-foreground font-semibold">{name}</span>
      </p>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

        {/* Left — identity (sticky) */}
        <div className="lg:sticky lg:top-0">
          <StaffIdentityCard
            staff={staff}
            onRoleChanged={mutate}
            onStatusChanged={mutate}
            onRemoved={() => navigate("/lab/staff")}
          />
        </div>

        {/* Right — tabs */}
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>

            {/* Full-width segmented pill control */}
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              {showAssigned && (
                <TabsTrigger value="assigned">Assigned Work</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <TabOverview
                membershipId={staff._id}
                onViewAllActivity={() => setActiveTab("activity")}
              />
            </TabsContent>

            <TabsContent value="permissions" className="mt-0">
              <TabPermissions staff={staff} onRoleChanged={mutate} />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <TabActivity membershipId={staff._id} />
            </TabsContent>

            {showAssigned && (
              <TabsContent value="assigned" className="mt-0">
                <TabAssignedWork />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
