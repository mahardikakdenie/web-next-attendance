
  ---

  📑 Panduan Integrasi: Skema Payroll Baru (v2.0)

  Dokumen ini menjelaskan perubahan pada modul Payroll untuk mendukung Tipe Kalkulasi dan Metode
  Pajak.

  ---

  🛠 1. Definisi Data (Enums)
  Gunakan mapping ini pada komponen Dropdown atau Select di UI.

  ┌──────────┬───────────┬─────────────────────┬────────────────────────────────────────────────┐
  │ Fitur    │ Key (API) │ Label UI            │ Deskripsi                                      │
  ├──────────┼───────────┼─────────────────────┼────────────────────────────────────────────────┤
  │ Run Type │ Regular   │ Gaji Reguler        │ Gaji bulanan standar (termasuk pph21 rutin).   │
  │          │ THR       │ THR                 │ Kalkulasi khusus Tunjangan Hari Raya saja.     │
  │          │ Bonus     │ Bonus               │ Kalkulasi khusus Bonus/Incentive saja.         │
  │          │ All       │ Gabungan            │ Menghitung semua komponen dalam satu slip.     │
  │ Method   │ Gross     │ Gross (Potong Gaji) │ Pajak PPh 21 dipotong dari gaji karyawan.      │
  │          │ Net       │ Net (Gross Up)      │ Perusahaan menanggung pajak (Tunjangan Pajak). │
  └──────────┴───────────┴─────────────────────┴────────────────────────────────────────────────┘
  ---

  🚀 2. Integrasi API (Tabbing UI)

  Berikut adalah detail endpoint yang perlu diperbarui. Anda bisa membaginya ke dalam 3 tab di
  Dashboard HR:

  [ Tab 1: Generate Payroll (Bulk) ]
  Digunakan untuk generate draft payroll satu departemen atau seluruh perusahaan.

   - Endpoint: POST /api/v1/payroll/generate
   - Payload Baru:

   1 {
   2   "period": "2026-04",
   3   "run_type": "Regular", // Opsi: Regular, THR, Bonus, All
   4   "method": "Gross"      // Opsi: Gross, Net
   5 }
   - UX Tip: Tambahkan modal konfirmasi sebelum generate yang menanyakan "Apakah Anda ingin menghitung
     THR saja atau Gaji Reguler?".

  ---

  [ Tab 2: Calculator (Stateless) ]
  Digunakan pada fitur 'Simulasi Payroll' agar admin bisa mencoba angka sebelum disimpan.

   - Endpoint: POST /api/v1/payroll/calculate
   - Payload:

    1 {
    2   "userId": 12,
    3   "runType": "THR",
    4   "method": "Net",
    5   "basicSalary": 10000000,
    6   "fixedAllowances": 2000000,
    7   "calculateThr": true,
    8   "attendanceDays": 20,
    9   "workingDaysInMonth": 22
   10 }
   - UX Tip: Gunakan loading skeleton saat kalkulasi karena sistem melakukan iterasi (Gross-Up) di
     sisi server (mungkin ada sedikit latency ~200ms).

  ---

  [ Tab 3: Save Individual ]
  Digunakan saat HR melakukan penyesuaian manual (override) untuk satu karyawan tertentu.

   - Endpoint: POST /api/v1/payroll/employee/:user_id/save
   - Payload: Sertakan field run_type dan method agar data yang tersimpan konsisten.

  ---

  📊 3. Perubahan Struktur Response (JSON)
  Backend sekarang mengirimkan field tambahan untuk detail slip gaji.

  Path: data.breakdown.earnings

    1 {
    2   "earnings": {
    3     "basic_salary": 10000000,
    4     "tax_allowance": 545000, // <--- BARU: Tampil jika Method = Net
    5     "thr": 0,
    6     "bonus": 0,
    7     "gross_income": 10545000
    8   },
    9   "run_type": "Regular", // <--- BARU
   10   "method": "Net"        // <--- BARU
   11 }

  ---

  🎨 4. Rekomendasi UI/UX

  A. Badge Status
  Tampilkan badge pada list payroll agar HR mudah membedakan tipe kalkulasi:
   - Regular -> Badge Blue
   - THR -> Badge Green
   - Bonus -> Badge Purple

  B. Tooltip Pajak
  Jika method adalah Net, berikan icon info (i) di sebelah kolom Pph21 Amount dengan tulisan: "Pajak
  ini ditanggung perusahaan (Gross-Up System)."

  C. Logic Validasi (FE)
   - Jika run_type adalah THR, field Overtime dan Variable Allowance (makan/transport) sebaiknya
     di-disable atau di-hide karena biasanya tidak masuk hitungan THR murni.
   - Jika runType adalah All, semua input field harus aktif.

  ---

  💡 Catatan untuk Dev:
  Pastikan Content-Type: application/json dan sertakan Bearer Token di Header. Jika ada error 400:
  Invalid Request, cek kembali penulisan PascalCase pada RunType di endpoint /calculate.

  ---
  Dokumentasi ini dibuat untuk API v2.1. Jika ada kendala, hubungi Tim Backend.
