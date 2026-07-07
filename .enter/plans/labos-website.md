# Plan: Contextual Action Menus for Patients, Doctors & Staff

## Context
Three lab management pages need contextual action menus with state-driven portal/membership
access controls. Currently:
- **Patients** — no portal access field, no action menu (just a View button)
- **Doctors** — `access: boolean` with a simple Switch toggle; no invite-sent state
- **Staff** — no action menu on cards; status doesn't include `'Pending'`

---

## Data Model Changes — `src/data/mockData.ts`

### Patient (add `portalAccess`)
```ts
portalAccess: 'none' | 'invite_sent' | 'active'
```
Seed existing patients with `'none'` (1–2 with `'invite_sent'` / `'active'` for demo variety).

### Doctor (replace `access: boolean` with `portalAccess`)
```ts
portalAccess: 'none' | 'invite_sent' | 'active'
```
Map existing `access: true → 'active'`, `access: false → 'none'`.

### StaffStatus (add `'Pending'`)
```ts
export type StaffStatus = 'Active' | 'On Leave' | 'Inactive' | 'Pending';
```
Add 1–2 pending staff entries in seed data for demo.

---

## New Shared Components

### `src/components/lab/PortalAccessBadge.tsx`
Renders a small status badge:
- `none` → grey "No Access"
- `invite_sent` → amber "Invite Sent"
- `active` → green "Active"

### `src/components/lab/PortalActionMenu.tsx`
Props: `{ id, name, email, portalAccess, onGrant, onResend, onRevoke, variant: 'menu' | 'buttons' }`

**Logic:**
| State | Actions shown |
|---|---|
| `none` | "Grant Portal Access" (primary) |
| `invite_sent` | "Resend Invite" (secondary) + "Revoke Access" (destructive) |
| `active` | "Revoke Access" (destructive) |

- `variant='menu'` → DropdownMenu (three-dot kebab) — used in list rows
- `variant='buttons'` → Explicit labeled buttons — used in detail/panel view
- "Revoke Access" opens an inline `AlertDialog` before firing
- Loading spinner replaces icon while action is in flight
- On error shows inline `"Something went wrong. Please try again."` text below the menu
- Grant Access shows a `window.confirm`-style `AlertDialog` ("Send a portal invite to {name}?")

### `src/components/lab/StaffMembershipBadge.tsx`
Badge for Pending (amber) / Active (green) / Inactive (grey) / On Leave (muted).

### `src/components/lab/StaffActionMenu.tsx`
Props: `{ id, name, role, status, onResend, onEditRole, onDeactivate, onActivate, onRemove, variant: 'menu' | 'buttons' }`

**Logic:**
| Status | Actions |
|---|---|
| `Pending` | "Resend Invite" + "Remove" (destructive, confirm modal) |
| `Active` | "Edit Role" (hidden if Manager) + "Deactivate" (confirm) + "Remove" (confirm, hidden if Manager) |
| `Inactive` | "Activate" (primary) + "Remove" (confirm) |

- "Edit Role" opens an inline dialog with a role Select
- Destructive actions require AlertDialog confirmation with red confirm button
- Loading/spinner per action; inline error on failure

---

## Page Changes

### `src/pages/lab/Patients.tsx`
1. Lift `patients` import into `const [patientList, setPatientList] = useState<Patient[]>(patients)`
2. Add `PortalAccessBadge` to the Status column (replaces existing `StatusBadge` or shown alongside)
3. Replace the Actions column "View" button with:
   - "View" ghost button (kept)
   - `PortalActionMenu variant='menu'` kebab next to it
4. Wire `onGrant/onResend/onRevoke` to update `patientList` state inline + toast

### `src/pages/lab/PatientDetail.tsx`
1. Initialize `const [patient, setPatient] = useState<Patient | undefined>(...)` from URL param lookup
2. Show `PortalAccessBadge` next to the patient name in the header
3. Add `PortalActionMenu variant='buttons'` in the patient info card header area
4. Wire handlers to update local `patient` state + toast

### `src/pages/lab/Doctors.tsx`
1. Lift to `const [doctorList, setDoctorList] = useState<Doctor[]>(doctors)`
2. Remove the `Switch` toggle and `toggleAccess` function
3. Replace "Portal Access" column with: `PortalAccessBadge` + `PortalActionMenu variant='menu'`
4. Wire handlers to update `doctorList` state inline + toast

### `src/pages/lab/Staff.tsx`
1. Lift to `const [staff, setStaff] = useState<StaffMember[]>(staffMembers)`
2. Replace `StatusBadge` in each card with `StaffMembershipBadge`
3. Add a `StaffActionMenu variant='menu'` kebab button to top-right of each card
4. Wire all handlers (activate, deactivate, remove, resend, editRole) to update `staff` state + toast
5. Update new staff invite to set `status: 'Pending'`
6. Update summary counts in header to use `Pending` count

---

## Verification
- Switch to Lab Manager → Patients: each row shows portal badge + kebab menu with correct actions per state
- Grant Access: confirm dialog appears → confirm → badge changes to "Invite Sent"
- Resend Invite: fires immediately → toast "Invite resent to {email}"
- Revoke Access: confirm modal → red button → badge resets to "No Access"
- PatientDetail: header shows badge + labeled buttons matching list row actions
- Doctors: same portal badge/menu pattern; Switch removed
- Staff: cards show membership badge + kebab menu with correct state-driven actions
- Edit Role: modal opens, role changes, card updates inline
- Manager card: Edit Role and Remove are hidden
- Deactivate/Remove: confirmation modal with red button required
