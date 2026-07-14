export interface DashboardGreeting {
  firstName: string;
  lastName: string;
}

export interface DashboardOverview {
  totalPatients: number;
  totalTestOrders?: number;
  activeStaff?: number;
}

/** Manager / receptionist — lab-wide order breakdown */
export interface LabTestOrders {
  pending: number;
  sampleCollected: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

/** Scientist — own assigned item breakdown */
export interface ScientistTestOrders {
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

/** Manager / receptionist — lab-wide result breakdown */
export interface LabResults {
  submitted: number;
  returned: number;
  approved: number;
  released: number;
}

/** Scientist — own result breakdown */
export interface ScientistResults {
  draft: number;
  submitted: number;
  returned: number;
}

export interface DashboardWorkListItem {
  _id: string;
  testName: string;
  status: "pending" | "assigned" | "in_progress" | "completed";
  patient: { _id: string; firstName: string; lastName: string } | string;
  testOrder: { _id: string; priority: string } | string;
  createdAt: string;
}

export interface DashboardResultUpdate {
  _id: string;
  status: "returned" | "draft";
  patient: { _id: string; firstName: string; lastName: string } | string;
  testOrderItem: { _id: string; testName: string } | string;
  timelines: Array<{
    status: string;
    at: string;
    note?: string;
    by: unknown;
  }>;
  updatedAt: string;
}

export interface DashboardAppointments {
  todayTotal: number;
  todayConfirmed: number;
  upcoming: number;
}

export interface DashboardInventory {
  lowStock: number;
  outOfStock: number;
}

export interface DashboardFinance {
  revenue: number;
  expenses: number;
  net: number;
}

export interface DashboardActivityItem {
  _id: string;
  actor: { _id: string; firstName: string; lastName: string } | string;
  resource: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface DashboardData {
  greeting: DashboardGreeting;
  overview?: DashboardOverview;
  testOrders?: LabTestOrders | ScientistTestOrders;
  results?: LabResults | ScientistResults;
  workList?: DashboardWorkListItem[];
  resultUpdates?: DashboardResultUpdate[];
  appointments?: DashboardAppointments;
  inventory?: DashboardInventory;
  finance?: DashboardFinance;
  recentActivity?: DashboardActivityItem[];
}
