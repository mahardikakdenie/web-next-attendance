# Frontend Task: Payslip Display & Dynamic Payroll Calculator UI

## 📌 Context
The backend payroll engine has been updated to fully support dynamic calculations based on **Run Type** (`Regular`, `THR`, `Bonus`, `All`) and **Calculation Method** (`Gross`, `Net`). 

We need the Frontend team to build/update the **Payroll Calculator Modal** and the **Employee Payslip Document** to reflect these changes accurately. The backend payload for calculation requests has also been standardized to `snake_case`.

---

## 🎯 API Contract Updates (CRITICAL)

### 1. `POST /v1/payroll/calculate` (Calculator)
⚠️ **BREAKING CHANGE:** All payload keys must now be in `snake_case`. Do not use camelCase.

**Request Payload:**
```json
{
  "user_id": 1,                     // Required to fetch baseline profile
  "run_type": "Regular",            // "Regular", "THR", "Bonus", "All"
  "method": "Gross",                // "Gross" or "Net"
  "attendance_days": 20,            // Required for proration
  "working_days_in_month": 22,      // Required for proration
  "overtime_hours": 5.5,            // Optional
  "unpaid_leave_days": 1,           // Optional
  "basic_salary": 0,                // Optional (Overrides DB if > 0)
  "fixed_allowances": 0,            // Optional (Overrides DB if > 0)
  "incentives": 500000,             // Optional
  "bonus": 0,                       // Optional
  "thr": 0                          // Optional
}
```

### 2. Standardized Response (`breakdown` object)
Both the `/calculate` endpoint and the `/my-slips` endpoint return this structure:
```json
{
  "net_salary": 9500000,
  "breakdown": {
    "earnings": {
      "basic_salary": 8000000,
      "fixed_allowances": 1500000,
      "variable_allowances": 400000,
      "overtime_pay": 250000,
      "incentives": 0,
      "bonus": 0,
      "thr": 0,
      "tax_allowance": 125000,      // ONLY appears if Method = "Net"
      "bpjs_allowance": 85000,      // ONLY appears if Method = "Net"
      "gross_income": 10360000
    },
    "deductions": {
      "pph21_amount": 125000,
      "unpaid_leave_deduction": 350000,
      "bpjs_health_employee": 80000,
      "bpjs_jht_employee": 160000,
      "bpjs_jp_employee": 80000,
      "total_deductions": 795000
    }
  }
}
```

---

## 🎨 UI/UX Recommendations: The Payslip (Slip Gaji)

### 1. Two-Column Layout
The payslip should strictly follow a two-column design:
- **Left Column: EARNINGS (Penghasilan)**
- **Right Column: DEDUCTIONS (Potongan)**

### 2. Handling the "Net" Method (Gross-Up)
When `method === 'Net'`, the company pays the employee's tax and BPJS. In the payslip, this must be displayed clearly:
- **Under Earnings:** Automatically show the `tax_allowance` (Tunjangan PPh 21) and `bpjs_allowance` (Tunjangan BPJS).
- **Under Deductions:** Show the `pph21_amount` and employee BPJS deductions. 
- *UX Note:* They will mathematically cancel each other out, resulting in the employee receiving their exact requested Net Salary, but legally both must be printed on the slip.

### 3. Handling Different `run_type`s
The UI must be dynamic based on the run type:
- **`Regular`**: Show Basic Salary, Allowances, Overtime, BPJS, Tax. Hide THR and Bonus if they are 0.
- **`THR`**: 
  - **Hide** Attendance Proration, Meal/Transport Allowances, and Overtime.
  - **Show** Only THR Amount and Tax (PPh 21). BPJS is usually not deducted from THR.
- **`Bonus`**: Similar to THR, focus only on the Bonus amount and Tax.
- **`All`**: Show everything (Regular + THR + Bonus).

---

## 🧮 UI/UX Recommendations: The Payroll Calculator Modal (Admin)

When Admin is testing calculations before generating the payroll:

1. **Stateful Inputs:** 
   - Provide a dropdown for `Run Type`. If Admin selects `THR`, automatically disable/gray-out the "Overtime" and "Attendance" input fields, as they are irrelevant.
2. **Method Toggle:** 
   - Provide a prominent toggle/switch for `Gross` vs `Net`. 
   - Add a tooltip explaining: *"Net (Gross-up) will automatically calculate tax allowances to ensure the employee receives exactly the inputted amounts."*
3. **Live Preview:** 
   - Use a debounce (e.g., 500ms) on the input fields to hit the `/calculate` API.
   - Display a mini "mock payslip" next to the form that updates in real-time, showing the resulting `net_salary` and `pph21_amount` based on their inputs.

---

## ✅ Success Criteria
- [ ] API requests to `/calculate` strictly use `snake_case`.
- [ ] Payslip UI handles `tax_allowance` gracefully when Method is `Net`.
- [ ] Calculator Modal disables irrelevant fields when Run Type is `THR` or `Bonus`.
