# Backend Task: Smart Payroll Allowances Enhancements

## 📌 Context
The Smart Payroll Calculator v2 currently supports dynamic "Variable Allowances" (Tunjangan Tidak Tetap) and overrides for "Fixed Allowances" (Tunjangan Tetap) in the UI. We need backend enhancements to fully support storing these detailed breakdowns and providing configuration data to the frontend to improve the UX.

## 🎯 Required API Endpoints & Modifications

### 1. `POST /v1/payroll/calculate` (Update)
**Description:** The calculator payload already accepts `custom_variable_allowances` (an array of objects). The backend engine must process this array to calculate the total variable allowance AND return this detailed array back in the response so the frontend payslip can display the specific names (e.g., "Uang Makan", "Transport") instead of just a lumped sum.

**Current Payload Expectation:**
```json
{
  "user_id": 10,
  "method": "Net",
  "run_type": "Regular",
  "variable_allowance": 1500000, // The sum (FE currently sends this)
  "custom_variable_allowances": [  // BE needs to parse and save this detail
    { "name": "Uang Makan", "amount": 1000000 },
    { "name": "Uang Transport", "amount": 500000 }
  ]
}
```

### 2. `POST /v1/payroll/records` (Save Payroll - Update)
**Description:** When saving the final payroll record, the database must store the detailed `custom_variable_allowances` array (likely as JSONB in the `payroll_records` table) so that historically generated PDF slips can retain the specific allowance names.

### 3. `GET /v1/settings/allowance-presets` (NEW)
**Description:** To improve the UI, we want to provide HR with a dropdown of common allowance names instead of forcing them to type "Uang Makan" every time. 
**Authentication:** Required (Admin/HR)

**Expected Response:**
```json
{
  "meta": { "code": 200, "status": "success" },
  "data": [
    { "id": 1, "name": "Uang Makan", "type": "variable" },
    { "id": 2, "name": "Uang Transport", "type": "variable" },
    { "id": 3, "name": "Tunjangan Internet / Komunikasi", "type": "variable" },
    { "id": 4, "name": "Tunjangan Jabatan", "type": "fixed" }
  ]
}
```

---

## 🛠️ Actions Required
1. Update the `calculate` engine to echo back the `custom_variable_allowances` array if provided, so the preview slip can render individual line items.
2. Update the `payroll_records` schema to store the detailed allowance breakdown as JSONB.
3. Create a simple endpoint or system setting to manage the preset allowance names for the frontend ComboBox.
