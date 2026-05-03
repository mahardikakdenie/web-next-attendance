  ---

  📑 FE Integration Checklist: Payroll Module

  Dokumen ini berfungsi sebagai panduan verifikasi bagi tim Front-End untuk memastikan data yang
  dikirim dan ditampilkan sudah sesuai dengan logika Gross Up (Method Net) dan Multi-Run Type.

  1. Request Payload Verification (POST /calculate)

  Pastikan FE mengirimkan runType yang sesuai agar komponen gaji tidak bernilai 0.

  ┌──────────────┬───────────┬───────────┬─────────────────────────────────────────────────┐
  │ Skenario     │ runType   │ method    │ Komponen yang Akan Dihitung BE                  │
  ├──────────────┼───────────┼───────────┼─────────────────────────────────────────────────┤
  │ Gaji Bulanan │ "Regular" │ "Gross" / │ Gaji Pokok, Tunjangan, Lembur, Insentif. (THR & │
  │ Rutin        │           │ "Net"     │ Bonus diabaikan).                               │
  │ Hanya THR    │ "THR"     │ "Gross" / │ Hanya THR.                                      │
  │              │           │ "Net"     │                                                 │
  │ Hanya Bonus  │ "Bonus"   │ "Gross" / │ Hanya Bonus.                                    │
  │              │           │ "Net"     │                                                 │
  │ Gaji + THR + │ "All"     │ "Gross" / │ Semua komponen dihitung sekaligus.              │
  │ Bonus        │           │ "Net"     │                                                 │
  └──────────────┴───────────┴───────────┴─────────────────────────────────────────────────┘

  💡 Tips Penting:
   * Jika User memilih skema Net (Gross Up), pastikan method yang dikirim adalah "Net".
   * Jika ingin Backend menghitung THR otomatis (Gaji Pokok + Tunjangan Tetap), kirim "calculateThr":
     true dan "thr": 0.

  ---

  2. UI Display: Menangani Method Net (Gross Up)

  Jika method === "Net", tampilan slip gaji atau hasil kalkulasi harus menampilkan komponen
  "Tunjangan" tambahan agar balance.

  Data Mapping (Response):
  Gunakan path object berikut dari response API:
   * Tunjangan Pajak: data.breakdown.earnings.tax_allowance
   * Tunjangan BPJS: data.breakdown.earnings.bpjs_allowance
   * Total Pendapatan Bruto: data.breakdown.earnings.gross_income

  Logika Tampilan di UI:

   1 // Contoh Logika di FE
   2 if (response.method === 'Net') {
   3    // Tampilkan row "Tunjangan Pajak (Gross Up)" di sisi Earning
   4    // Tampilkan row "Tunjangan BPJS (Gross Up)" di sisi Earning
   5 }

  ---

  3. Verifikasi Logika "Slip Bertambah" (Net Method)

  Untuk memastikan FE sudah benar, lakukan test case berikut:

   1. Input: Gaji Pokok 10jt, Method Gross.
       * Hasil: Bruto 10jt, Pajak -500rb, THP 9.5jt.
   2. Input: Gaji Pokok 10jt, Method Net.
       * Hasil: Bruto 10.5jt, Pajak -500rb, THP 10jt.

  > Catatan untuk FE: Pada Method Net, nilai gross_income memang harus lebih tinggi dari Gaji Pokok
  karena sistem menambahkan tax_allowance ke dalamnya.

  ---

  4. Struktur JSON Reference

  Request (Contoh Komplit)

    1 {
    2   "userId": 123,
    3   "runType": "All",
    4   "method": "Net",
    5   "basicSalary": 10000000,
    6   "fixedAllowances": 2000000,
    7   "dailyMealAllowance": 50000,
    8   "dailyTransportAllowance": 30000,
    9   "incentives": 1000000,
   10   "bonus": 5000000,
   11   "thr": 0,
   12   "calculateThr": true,
   13   "attendanceDays": 20,
   14   "workingDaysInMonth": 22,
   15   "overtimeHours": 10,
   16   "ptkpStatus": "K/1"
   17 }

  Response Mapping
  ┌───────────────────┬────────────────────────────────────────────┐
  │ Label di UI       │ Path Response                              │
  ├───────────────────┼────────────────────────────────────────────┤
  │ Gaji Bersih (THP) │ data.net_salary                            │
  │ Total Potongan    │ data.breakdown.deductions.total_deductions │
  │ Total Pendapatan  │ data.breakdown.earnings.gross_income       │
  │ Pajak (PPh 21)    │ data.breakdown.deductions.pph21_amount     │
  └───────────────────┴────────────────────────────────────────────┘
  ---

  5. Troubleshooting (FAQ)

  Q: Saya sudah isi Bonus tapi di hasil Kalkulasi kok 0?
  A: Cek runType. Jika runType adalah "Regular", Backend sengaja mengabaikan field Bonus. Ubah ke
  "Bonus" atau "All".

  Q: Kenapa potongan pajak tetap ada padahal pakai Method Net?
  A: Itu benar. Method Net bukan "Bebas Pajak", tapi "Pajak Dibayarkan Perusahaan". Di slip tetap
  harus ada baris Potongan Pajak, tapi nilainya sudah ditutup oleh Tunjangan Pajak di sisi Pendapatan.

  ---
