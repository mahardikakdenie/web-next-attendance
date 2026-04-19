# [BE] Implement Live Payroll System: Profiles, Slips, and Admin Management

## 📝 Overview
Tugas ini adalah untuk mengganti data mock pada komponen `@src/components/profile-update/MyPayrollTab.tsx` dan halaman Admin Payroll dengan data riil dari backend. Fitur ini mencakup manajemen profil keuangan karyawan (Bank, BPJS, NPWP), tampilan slip gaji bulanan, dan otomasi generate payroll oleh Admin.

## 👤 User Stories
1. **Sebagai Karyawan**, saya ingin melihat detail bank dan nomor asuransi saya di tab Payroll.
2. **Sebagai Karyawan**, saya ingin melihat rincian gaji bulanan saya (Earnings vs Deductions) secara akurat.
3. **Sebagai Admin/HR**, saya ingin mengelola besaran gaji pokok karyawan dan melakukan generate payroll masal setiap bulannya.

---

## 🛠 Technical Requirements

### 1. Database Schema Requirements

#### Table: `user_payroll_profiles` (Master Data)
Menyimpan konfigurasi keuangan "default" untuk setiap karyawan.
- `user_id`: UUID/BigInt (Foreign Key ke users, Unique)
- `bank_name`: String (e.g., "BCA", "Mandiri")
- `bank_account_number`: String
- `bank_account_holder`: String
- `bpjs_health_number`: String (Optional)
- `bpjs_employment_number`: String (Optional - untuk JHT/JP)
- `npwp_number`: String (Optional)
- `ptkp_status`: Enum ("TK/0", "K/0", "K/1", dll.)
- `basic_salary`: Decimal/BigInt
- `fixed_allowance`: Decimal/BigInt (Total tunjangan tetap)

#### Table: `payroll_records` (Monthly Slips)
Menyimpan snapshot hasil kalkulasi bulanan.
- `user_id`: UUID/BigInt
- `period`: Date (Hari pertama bulan tersebut, e.g., 2026-04-01)
- **Earnings Snapshot:** basic_salary, fixed_allowance, variable_allowance, overtime_pay.
- **Deductions Snapshot:** pph21_amount, bpjs_health_employee, bpjs_jht_employee, bpjs_jp_employee, unpaid_leave_deduction.
- `net_salary`: Decimal (Total Take Home Pay)
- `status`: Enum ("draft", "published", "paid")

---

### 2. API Endpoints

#### A. User Side (Self Service)
- **GET /api/v1/my-payroll/profile**
  - Mengambil data Bank, BPJS, dan NPWP untuk tampilan Summary Cards.
- **GET /api/v1/my-payroll/slips?period=YYYY-MM**
  - Mengambil breakdown detail gaji untuk bulan tertentu.

#### B. Admin Side (Management)
- **GET /api/v1/admin/users/:id/payroll-profile**
  - Mengambil data profil payroll karyawan tertentu.
- **PUT /api/v1/admin/users/:id/payroll-profile**
  - Update Gaji Pokok, Tunjangan Tetap, Info Bank, dan Status PTKP.
- **POST /api/v1/admin/payroll/generate**
  - Payload: `{ "period": "2026-04" }`
  - Aksi: Menghitung attendance, overtime, dan pajak untuk semua karyawan di periode tersebut.

---

### 3. API Response Structure (Reference for Slips)
```json
{
  "success": true,
  "data": {
    "id": 10,
    "user": {
      "full_name": "John Doe",
      "ptkp_status": "K/1",
      "bank_name": "BCA",
      "bank_account_number": "123456789"
    },
    "breakdown": {
      "earnings": {
        "basic_salary": 8000000,
        "fixed_allowances": 1000000,
        "variable_allowances": 500000,
        "overtime_pay": 250000,
        "gross_income": 9750000
      },
      "deductions": {
        "pph21_amount": 150000,
        "bpjs_health_employee": 80000,
        "bpjs_jht_employee": 160000,
        "bpjs_jp_employee": 80000,
        "unpaid_leave_deduction": 0,
        "total_deductions": 470000
      }
    },
    "net_salary": 9280000,
    "status": "Published"
  }
}
```

---

## ✅ Acceptance Criteria (AC)
- [ ] Tab "My Payroll" tidak lagi menggunakan data statis (`mockResult`).
- [ ] Dropdown "Period" pada slip gaji berfungsi mengirim query param `period=YYYY-MM` ke API.
- [ ] Admin dapat mengubah Gaji Pokok karyawan dan tersimpan di database.
- [ ] Tombol "Generate" memicu proses kalkulasi di backend dan memperbarui list payroll.
- [ ] Angka mata uang diformat menggunakan `Intl.NumberFormat('id-ID')`.
- [ ] Penanganan state loading dan error (jika slip gaji bulan tertentu belum ada).

## 📌 Notes
- Perhitungan pajak (**PPh 21**) menggunakan skema **TER** terbaru dan **BPJS** dilakukan sepenuhnya di Backend.
- Jika status payroll masih **Draft**, jangan tampilkan di sisi Karyawan (hanya Admin).
