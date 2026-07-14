# LabOS — Inventory & Test Order UI Design Brief

> This document describes screens, flows, visual states, and role-based interactions for the Inventory module and Test Order lifecycle inside the **Lab Dashboard**. All sections live under the lab's main sidebar navigation — there is no separate portal.

---

## 1. Navigation Structure (Lab Dashboard Sidebar)

The lab dashboard sidebar has the following top-level sections:

- Dashboard (overview / home)
- Patients
- Test Orders ← covered in this doc
- Results
- **Inventory** ← covered in this doc
- Staff
- Settings

---

## 2. Inventory Module

### 2.1 Inventory — Items List Page (`/inventory/items`)

**Who can see it:** Manager, Receptionist (read), Manager (full CRUD + restock + adjust)

**Page layout:**
- Page title: **"Inventory"**
- Top bar with two tabs: **Items** (active) | **Stock Movements**
- Action button (top-right): **"+ Add Item"** (manager only)

**Filters bar (below tabs):**
- Search input — placeholder: "Search by name, SKU, supplier…"
- Category dropdown — All / Reagent / Kit / Consumable
- Status toggle — All / Active / Inactive
- **"Low Stock"** quick-filter badge/toggle — highlights items where quantity on hand is at or below reorder level
- "Expiring Soon" quick-filter toggle

**Items table columns:**
| Column | Notes |
|---|---|
| Name | Bold, clickable → detail page |
| SKU | Monospace, greyed out if not set |
| Category | Pill badge — Reagent (blue), Kit (purple), Consumable (amber) |
| Unit | e.g., "pcs", "ml", "box" |
| Qty on Hand | Number; turns **red** if ≤ reorder level, **amber** if within 20% above reorder level |
| Reorder Level | Shown as threshold |
| Supplier | Plain text, dash if empty |
| Expiry Date | Formatted date; turns red if within 30 days or past |
| Status | Active (green dot) / Inactive (grey dot) |
| Actions | "Restock" button (manager), "···" menu → Edit / Adjust / Deactivate / Delete |

**Empty state:** Illustration + "No inventory items yet. Add your first item to start tracking stock." + "Add Item" button.

**Low stock alert banner:** If any items are below reorder level, show a dismissable amber banner at top: "X items are running low on stock. Review them →"

---

### 2.2 Add / Edit Inventory Item — Drawer or Modal

**Trigger:** "+ Add Item" button or "Edit" from row menu

**Form fields:**
- Name * (text input)
- SKU (text input, optional — auto-uppercased)
- Category * (select: Reagent / Kit / Consumable)
- Unit * (text input — e.g., box, vials, ml)
- Reorder Level * (number input, default 0)
- Unit Cost (number input, default 0 — currency formatted)
- Supplier (text input, optional)
- Expiry Date (date picker, optional)
- Status (toggle: Active / Inactive — shown only on Edit)

**Footer:** Cancel | Save

---

### 2.3 Inventory Item Detail Page (`/inventory/items/:itemId`)

**Layout:** Two-column — left (item info + actions), right (stock movement history)

**Left panel — Item Card:**
- Item name (heading)
- SKU badge (if set)
- Category pill
- Status badge

**Stock summary (3 stat cards in a row):**
- **Qty on Hand** — large number, coloured (red/amber/green based on reorder level)
- **Reorder Level** — threshold
- **Unit Cost** — formatted currency

**Additional info:**
- Unit
- Supplier
- Expiry Date (with warning if soon / expired)

**Action buttons (manager only):**
- **"Restock"** (primary) — opens Restock modal
- **"Adjust"** (secondary) — opens Adjust modal
- **"Edit"** (tertiary) — opens Edit drawer

---

### 2.4 Restock Modal

**Trigger:** "Restock" button on detail page or item row

**Title:** Restock — [Item Name]

**Form fields:**
- Quantity to add * (positive number)
- Unit Cost (number, optional — updates item's unit cost)
- Supplier (text, optional — updates item's supplier)
- Expiry Date (date, optional)
- Note (textarea, max 500 chars, optional)

**Preview:** "Current stock: 24 → After restock: 24 + 12 = **36**"

**Footer:** Cancel | Confirm Restock

---

### 2.5 Adjust Stock Modal

**Trigger:** "Adjust" button or "Adjust" from row "···" menu

**Title:** Adjust Stock — [Item Name]

**Form fields:**
- Adjustment type (radio):
  - Manual Correction (positive or negative)
  - Write Off Expired (negative only)
- Quantity Change * (signed number — negative reduces, positive adds)
- Reason * (textarea, 2–500 chars, required)

**Preview:** "Current stock: 24 → After adjustment: **22**" (live-updated as user types; shows red if result < 0)

**Validation:** Block submit if result would go below 0.

**Footer:** Cancel | Confirm Adjustment

---

### 2.6 Stock Movements Page (`/inventory/movements` or tab)

**Tab:** Stock Movements (second tab on Inventory page)

**Filters:**
- Item selector (search/autocomplete)
- Movement type: All / Restock / Consumption / Adjustment / Expired
- Date range picker

**Table columns:**
| Column | Notes |
|---|---|
| Date & Time | Formatted timestamp |
| Item | Linked to item detail |
| Type | Pill — Restock (green), Consumption (red), Adjustment (blue), Expired (grey) |
| Change | "+12" (green) or "−3" (red) with unit |
| After | Stock level after this event |
| Reference | "Sample collection – CBC" or "Manual" or "Restock" |
| Phase | "Collection" / "Analysis" (only for consumption type) |
| Recorded By | Staff member name |

**Empty state:** "No stock movements yet."

---

## 3. Test Order Flow

> **Key design principle:** Order creation is a **3-step wizard**. Sample collection is **Step 2** — it happens as part of creating the order, not after. By the time an order appears in the orders list, samples have already been collected and inventory has already been deducted for collection-phase materials.

---

### 3.1 Test Orders — List Page (`/test-orders`)

**Who can see it:** Manager, Receptionist (create + view), Scientist (view their assigned items)

**Page layout:**
- Title: **"Test Orders"**
- Action button (top-right): **"+ New Order"** (Manager / Receptionist)

**Filters bar:**
- Search patient by name or code
- Status tabs: All / Sample Collected / In Progress / Completed / Cancelled
- Priority filter: All / Routine / Urgent / STAT
- Date range picker

> Note: Orders never appear with status "Pending" in this list because sample collection is completed during the creation wizard. An order only lands in the list once the wizard finishes.

**Orders table:**
| Column | Notes |
|---|---|
| Order # | Auto-generated reference, monospace |
| Patient | Name + patient code |
| Tests | Count of test items, e.g., "3 tests" |
| Priority | Pill — Routine (grey), Urgent (amber), STAT (red) |
| Status | Pill — see statuses below |
| Total Price | Formatted currency |
| Date | Order date |
| Actions | "View" button; "Cancel" (manager/receptionist only) |

**Status pills:**
- Sample Collected — cyan (initial state after wizard)
- In Progress — amber
- Completed — green
- Cancelled — grey/strikethrough

---

### 3.2 New Test Order — 3-Step Wizard (Full Page)

**Trigger:** "+ New Order" button
**Route:** `/lab/test-orders/new?patientId=...` or initiated from a patient profile

**Step indicator at the top** shows 3 steps with current progress:
`① Select Tests  →  ② Collect Samples  →  ③ Assign Professionals`

A **patient banner** persists across all 3 steps showing: patient name, code, age, gender.

---

#### Step 1 — Select Tests & Parameters

**Left area — Test catalog browser:**
- Search input (by test name or code)
- Category filter tabs: All / Haematology / Biochemistry / Microbiology / Serology / Parasitology / Endocrinology / etc.
- Test cards in a grid or list, each showing:
  - Test name + code
  - Category pill
  - Turnaround time
  - Sample type
  - Price
  - Checkbox to select the test

**When a test is selected:**
- Card expands to show its parameter list
- All parameters checked by default
- Each parameter row: name, type (numeric/text/select), reference range, price
- User can uncheck individual parameters to exclude them from the order
- At least one parameter must remain selected per test

**Running total bar (sticky bottom):**
- "X tests selected · Y parameters · Total: ₦12,500"

**Validation:** At least 1 test selected, each selected test has ≥ 1 parameter.

**Footer navigation:** Next → (advances to Step 2)

---

#### Step 2 — Collect Samples *(the collection phase)*

This step collects sample details and logs collection-phase material consumption **for every selected test**.

**Layout:** One card per selected test

**Per-test card fields:**
- Test name (header of card)
- Sample Type * (pre-filled from catalog default, editable — e.g., "Whole Blood")
- Container Type * (dropdown — EDTA Tube / SST Tube / Plain Tube / Urine Cup / Swab / Sputum Container / Citrate Tube / Heparin Tube / etc.)
- Volume (optional, in mL)
- Sample Condition * (select — Acceptable / Hemolyzed / Lipemic / Insufficient Volume / Clotted)
- Collected By (text — defaults to logged-in staff member's name)
- Collection Time (datetime — defaults to now, editable)

**Collection Materials section (shown per test, only if the test has collection-phase materials defined in its catalog):**
- Sub-header: "Collection Materials"
- One row per material:
  - Material name
  - Current stock (e.g., "48 pcs available") — turns amber/red if at or near reorder level
  - Quantity input * (number, min 0.0001, default 1)
  - Inline warning if entered quantity > available stock: "Insufficient stock — only 3 remaining"
- If no collection-phase materials: subtle greyed note "No collection materials required"

**Validation:** Sample Type, Container Type, and Sample Condition must be filled for all tests. No material quantity may exceed available stock.

**Footer navigation:** ← Back | Next →

---

#### Step 3 — Assign Professionals

This step assigns a scientist to each test item and sets order-level priority.

**Top of page:**
- Priority selector (applies to whole order): Routine / Urgent / STAT
- Notes field (textarea, optional)

**Per-test assignment card:**
- Test name
- Sample type (read-only summary from Step 2)
- Assign To * (search dropdown — active scientists and managers in this lab)
- Urgent flag (checkbox — override the order-level priority for this specific test)
- Notes (textarea, optional — special instructions for the scientist)

**Right sidebar — Order Summary (sticky):**
- Patient name + code
- Priority
- List of tests with: assigned professional, parameter count, subtotal
- Grand total

**Validation:** Every test must have an assigned professional.

**Footer navigation:** ← Back | **Place Order** (primary CTA)

---

#### Completion Screen

Shown after "Place Order" is tapped and the API confirms success.

**Content:**
- Large checkmark / success illustration
- "Order Created Successfully"
- Order # (bold, monospace, copyable)
- Summary card:
  - Patient name + code
  - Date & time
  - Total amount
  - List of tests: test name · sample type · assigned professional · priority flag if urgent
- Two buttons:
  - "View Order" → goes to the order detail page
  - "New Order for Another Patient" → resets wizard with patient selector

---

### 3.3 Test Order Detail Page (`/test-orders/:orderId`)

Orders here already have samples collected. The lifecycle continues with assignment → start test → complete.

**Layout:** Full page — header card at top, items table below

**Top section — Order header card:**
- Order # (bold, monospace)
- Patient name + code (linked to patient profile)
- Priority badge
- Status badge
- Date
- Total price
- Notes (if set)
- Sample collected by + collected at (always shown — collected during creation)

**Bottom section — Test Items table:**

Each row = one test item:
| Column | Notes |
|---|---|
| Test Name | Expandable row |
| Sample Type | Collected during wizard |
| Sample Condition | Acceptable / Hemolyzed / etc. |
| Status | Pill (Sample Collected / Assigned / In Progress / Completed) |
| Assigned To | Scientist name |
| Test Started | Timestamp or "—" |
| Actions | Context-aware (see 3.4) |

**Expanding a row** reveals:
- Parameter list (name, type, reference range)
- Collection materials consumed (from wizard Step 2)
- Analysis materials consumed (from Start Test action)

---

### 3.4 Item-Level Actions (post-creation lifecycle)

After an order is created (samples already collected), progress is driven per item:

| Item Status | Available Action | Who |
|---|---|---|
| Sample Collected | **Assign to Scientist** | Manager |
| Assigned | **Start Test** | Assigned scientist only |
| In Progress | **Mark Complete** | Assigned scientist or manager |
| Completed | View Result | All |

---

### 3.5 Assign to Scientist — Modal

**Trigger:** "Assign" button on an item row (manager only)

**Title:** Assign — [Test Name]

**Fields:**
- Scientist selector * (search dropdown — active scientists and managers)
- Optional: workload indicator next to each name ("3 active tests")

**Footer:** Cancel | Assign

---

### 3.6 Start Test — Modal

**Trigger:** "Start Test" button (assigned scientist only)

**Title:** Start Test — [Test Name]

**Analysis Materials section (if this test has analysis-phase materials in its catalog):**
- Sub-header: "Analysis Materials"
- One row per material:
  - Material name
  - Current stock — turns amber/red if at or near reorder level
  - Quantity input * (required, min 0.0001, default 1)
  - Inline warning if quantity exceeds available stock
- If no analysis-phase materials: "No analysis materials required for this test."

**Footer:** Cancel | Start Test

**On confirm:**
- Item status → In Progress
- testStartedAt stamped
- Analysis-phase stock automatically deducted
- Order status → In Progress

---

### 3.7 Mark Complete — Confirm Dialog

**Trigger:** "Mark Complete" button on an in-progress item

Simple confirmation: "Mark [Test Name] as complete? This will allow results to be recorded."

- Cancel | Mark Complete

**On confirm:**
- Item status → Completed
- If all items on the order are completed → order status → Completed

---

## 4. Visual Design Notes

### Status Colour System (consistent across inventory + orders)
| Status | Colour |
|---|---|
| Active / Completed / Restocked | Green |
| Pending / Routine | Blue |
| Sample Collected / Assigned | Cyan / Teal |
| In Progress / Urgent | Amber |
| STAT / Low Stock / Expired | Red |
| Inactive / Cancelled / Expired | Grey |

### Material Consumption Inline Feedback
Whenever a modal that consumes stock is confirmed:
- Show a brief toast: "Sample collected. 2 materials consumed from inventory."
- If a material drops below its reorder level after consumption, show an amber alert: "EDTA Tube is now below reorder level (8 remaining)."

### Low Stock Indicators
- On the Inventory items list, rows with qty ≤ reorder level get a red left border or a red "Low" badge
- On the Collect Sample and Start Test modals, if any material's current stock is at or below reorder level, show an amber warning next to the qty input

### Role-Based Visibility Summary
| Action | Manager | Receptionist | Scientist |
|---|---|---|---|
| View Inventory | ✓ | ✓ | ✓ |
| Add / Edit / Delete Item | ✓ | — | — |
| Restock | ✓ | — | — |
| Adjust Stock | ✓ | — | — |
| Create Order (wizard steps 1–3 incl. sample collection) | ✓ | ✓ | — |
| Assign Scientist (post-creation) | ✓ | — | — |
| Start Test (analysis materials) | ✓ (any) | — | ✓ (assigned only) |
| Mark Complete | ✓ | — | ✓ (assigned only) |
| Cancel Order | ✓ | ✓ | — |
