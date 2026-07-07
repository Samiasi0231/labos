# LabOS – Laboratory Owner Dashboard Implementation Plan

## Context
Building the LabOS Laboratory Management System starting with the Laboratory Owner Dashboard. Frontend-only with mock data (Deep Teal & Mint theme). This is Phase 1–3 of the PRD (patient mgmt, test mgmt, results, inventory, finance, staff, branches).

---

## Design System Updates

### `src/index.css`
New CSS tokens for Deep Teal & Mint:
- `--primary`: 174 62% 35% (deep teal)
- `--primary-foreground`: 0 0% 100%
- `--accent`: 152 69% 52% (mint green)
- `--accent-foreground`: 152 69% 15%
- `--success`: 152 69% 42%
- `--warning`: 38 92% 50%
- `--sidebar-background`: 174 40% 10% (dark teal sidebar)
- `--sidebar-foreground`: 0 0% 95%
- Gradient tokens: `--gradient-primary`, `--gradient-card`
- Shadow tokens: `--shadow-card`, `--shadow-glow`

### `tailwind.config.ts`
Add `success`, `warning`, `info`, `teal` color aliases pointing to new CSS vars.

---

## Mock Data Layer

### `src/data/mockData.ts`
Export typed mock arrays:
- `patients[]` – id, name, phone, gender, dob, address, registeredAt
- `tests[]` – id, patientId, testType, status (Pending/In Progress/Completed/Approved), assignedTo, date
- `results[]` – id, testId, values, attachments, submittedBy, approvedBy, status
- `doctors[]` – id, name, specialty, phone, email, access
- `inventory[]` – id, product, category, quantity, reorderLevel, supplier
- `staff[]` – id, name, role, email, phone, status, lastActive
- `branches[]` – id, name, location, testsThisMonth, revenue, staffCount
- `transactions[]` – id, type (revenue/expense), amount, date, description, category
- `activities[]` – recent audit log entries

---

## File Structure

```
src/
  data/
    mockData.ts
  components/
    lab/
      LabLayout.tsx       – sidebar + topbar shell
      LabSidebar.tsx      – collapsible nav with icons
      LabHeader.tsx       – top bar: lab name, user avatar, notifications
      StatCard.tsx        – KPI widget card (icon, value, trend)
      DataTable.tsx       – reusable sortable/filterable table
      StatusBadge.tsx     – colored badge for test/result status
  pages/
    lab/
      LabDashboard.tsx    – overview widgets + charts (revenue, tests, trends)
      Patients.tsx        – patient list + register patient modal
      Tests.tsx           – test list + assign test modal + status tracking
      Results.tsx         – result entry + review + approve + release
      Doctors.tsx         – doctor registry + access management
      Inventory.tsx       – reagent/consumable list + low stock alerts
      Finance.tsx         – revenue/expense tracking + profit charts
      Staff.tsx           – staff list + add staff + role management
      Branches.tsx        – branch cards + performance comparison
      Settings.tsx        – lab profile form
```

---

## Routing (`src/router.tsx`)
Add nested routes under `/lab/*`:
- `/lab` → LabDashboard
- `/lab/patients` → Patients
- `/lab/tests` → Tests
- `/lab/results` → Results
- `/lab/doctors` → Doctors
- `/lab/inventory` → Inventory
- `/lab/finance` → Finance
- `/lab/staff` → Staff
- `/lab/branches` → Branches
- `/lab/settings` → Settings

Root `/` redirects to `/lab`.

---

## Key UI Components Per Page

### LabDashboard
- 5 stat cards: Today's Revenue, Tests Conducted, Pending Results, Inventory Alerts, Active Staff
- Line chart: Revenue (7-day)
- Bar chart: Tests by type (this week)
- Recent activity feed
- Quick actions: Register Patient, New Test, Enter Result

### Patients
- Search bar + filter by gender/date
- Sortable table with columns: Patient ID, Name, Phone, Gender, DOB, Actions
- "Register Patient" dialog with all required fields
- View patient history slide-over

### Tests
- Tab filter: All / Pending / In Progress / Completed / Approved
- Table with: Sample ID, Patient, Test Type, Date, Status, Assigned To, Actions
- "Assign Test" dialog
- Status change actions

### Results
- Tab: Enter Results / Pending Reviews
- Result entry form with value inputs + file upload area
- Submit for approval CTA
- QR verification badge on approved results

### Inventory
- Low stock alert banner (if items below reorder level)
- Table: Product, Category, Qty, Reorder Level, Supplier, Actions
- "Add Item" dialog

### Finance
- Stat cards: Today Revenue, Monthly Revenue, Total Expenses, Profit
- Revenue line chart (monthly)
- Revenue by test type pie chart
- Transactions table

### Staff
- Staff cards with role badge, status indicator, last active
- "Add Staff" dialog with role selector

### Branches
- Branch comparison cards with key metrics
- Performance bar chart comparing branches

---

## Implementation Order
1. Design tokens (index.css + tailwind.config.ts)
2. Mock data (mockData.ts)
3. Shared components (LabLayout, LabSidebar, LabHeader, StatCard, DataTable, StatusBadge)
4. LabDashboard page
5. Patients, Tests, Results pages
6. Doctors, Inventory, Finance pages
7. Staff, Branches, Settings pages
8. Router wiring

---

## Files Modified
- `src/index.css` – design tokens
- `tailwind.config.ts` – color aliases
- `src/router.tsx` – lab routes
- `src/pages/Index.tsx` – redirect to /lab
- New files: all listed above
