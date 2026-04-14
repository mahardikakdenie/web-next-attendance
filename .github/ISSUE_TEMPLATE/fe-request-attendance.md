 WriteFile Writing to .github\ISSUE_TE...n-integration.md                                    │
│                                                                                                │
│  1 ---                                                                                         │
│  2 name: "✍️ [FE] Integrasi: Request Attendance (Koreksi Absensi)"                             │
│  3 about: Panduan integrasi UI/UX untuk fitur pengajuan koreksi absensi bagi karyawan dan      │
│    persetujuan bagi HR/Admin.                                                                  │
│  4 title: "[FE] Integrasi Fitur Request Attendance Correction"                                 │
│  5 labels: frontend, user-module, attendance                                                   │
│  6 assignees: ''                                                                               │
│  7 ---                                                                                         │
│  8                                                                                             │
│  9 # ✍️ Request Attendance Correction UI Guide                                                 │
│ 10                                                                                             │
│ 11 Task ini bertujuan untuk mengimplementasikan fitur pengajuan koreksi absensi (misal: lupa   │
│    absen masuk/pulang) dan dashboard persetujuan untuk level HR/Admin.                         │
│ 12                                                                                             │
│ 13 ---                                                                                         │
│ 14                                                                                             │
│ 15 ## 🖼️ 1. Layout Concept                                                                     │
│ 16                                                                                             │
│ 17 ### A. Form Pengajuan (Karyawan)                                                            │
│ 18 Berada di dashboard absen atau halaman riwayat absen.                                       │
│ 19 - **Fields**:                                                                               │
│ 20     - `attendance_id`: (Hidden/Optional) ID absen yang ingin dikoreksi (jika ada).          │
│ 21     - `date`: DatePicker (Format: YYYY-MM-DD).                                              │
│ 22     - `clock_in_time`: TimePicker (Format: HH:mm:ss).                                       │
│ 23     - `clock_out_time`: TimePicker (Format: HH:mm:ss).                                      │
│ 24     - `reason`: Textarea (Alasan koreksi).                                                  │
│ 25                                                                                             │
│ 26 ### B. Dashboard Approval (HR/Admin)                                                        │
│ 27 Tabel khusus untuk melihat daftar pengajuan koreksi yang masuk.                             │
│ 28 - **Columns**: Nama Karyawan, Tanggal, Jam Masuk Baru, Jam Pulang Baru, Alasan, Status.     │
│ 29 - **Actions**: Tombol **Approve** (Warna Hijau) & **Reject** (Warna Merah). Saat klik aksi, │
│    muncul modal untuk mengisi `admin_notes`.                                                   │
│ 30                                                                                             │
│ 31 ---                                                                                         │
│ 32                                                                                             │
│ 33 ## 📡 2. Integrasi API                                                                      │
│ 34                                                                                             │
│ 35 ### A. Submit Request Correction (Employee)                                                 │
│ 36 - **Method**: `POST`                                                                        │
│ 37 - **URL**: `/api/v1/attendance/corrections`                                                 │
│ 38 - **Payload**:                                                                              │
│ 39 ```json                                                                                     │
│ 40 {                                                                                           │
│ 41   "attendance_id": "uuid-optional",                                                         │
│ 42   "date": "2026-04-12",                                                                     │
│ 43   "clock_in_time": "08:00:00",                                                              │
│ 44   "clock_out_time": "17:00:00",                                                             │
│ 45   "reason": "Lupa clock out karena buru-buru"                                               │
│ 46 }                                                                                           │
│ 47 ```                                                                                         │
│ 48                                                                                             │
│ 49 ### B. Fetch Corrections List                                                               │
│ 50 - **Method**: `GET`                                                                         │
│ 51 - **URL**: `/api/v1/attendance/corrections?status=PENDING`                                  │
│ 52 - **Behavior**: Jika login sebagai karyawan biasa, hanya akan muncul data miliknya sendiri. │
│    Jika Admin/HR, akan muncul semua data satu tenant.                                          │
│ 53                                                                                             │
│ 54 ### C. Approve/Reject (HR/Admin)                                                            │
│ 55 - **Method**: `POST`                                                                        │
│ 56 - **URL**: `/api/v1/attendance/corrections/{id}/approve` (atau `/reject`)                   │
│ 57 - **Payload**:                                                                              │
│ 58 ```json                                                                                     │
│ 59 {                                                                                           │
│ 60   "admin_notes": "Disetujui setelah konfirmasi dengan atasan langsung."                     │
│ 61 }                                                                                           │
│ 62 ```                                                                                         │
│ 63                                                                                             │
│ 64 ---                                                                                         │
│ 65                                                                                             │
│ 66 ## 🔐 3. Aturan Bisnis & Logika                                                             │
│ 67 1. **Auto-Update**: Saat HR menekan **Approve**, Backend secara otomatis akan mengupdate    │
│    tabel `attendances` yang bersangkutan atau membuat record absen baru jika sebelumnya tidak  │
│    ada.                                                                                        │
│ 68 2. **Future Date Blocker**: User dilarang mengajukan koreksi untuk tanggal di masa depan.   │
│ 69 3. **Status Lock**: Pengajuan yang sudah `APPROVED` atau `REJECTED` tidak dapat diubah lagi │
│    statusnya.                                                                                  │
│ 70                                                                                             │
│ 71 ---                                                                                         │
│ 72                                                                                             │
│ 73 ## 🚀 Checklist Integrasi Frontend                                                          │
│ 74 - [ ] Implementasi Form Pengajuan Koreksi.                                                  │
│ 75 - [ ] Implementasi Dashboard Review untuk Admin/HR.                                         │
│ 76 - [ ] Tampilkan status pengajuan (Badge: Orange untuk Pending, Green untuk Approved, Red    │
│    untuk Rejected).                                                                            │
│ 77 - [ ] Handle error response dari BE (misal: "request is already processed").                │
│ 78                                                                                             │
│ 79 ---                                                                                         │
│ 80 **Focus Scope**: ✅ Correction Form | ✅ Admin Approval Dashboard | ✅ Attendance Table     │
│    Sync                                                                                        │
│ 81 **Target API**: `/api/v1/attendance/corrections`
