 ---
    2 name: "🏖️ [FE] Integrasi: Leave Request System (Pengajuan Cuti)"
    3 about: Panduan detail integrasi UI/UX untuk karyawan dalam mengajukan cuti, izin, atau sakit.
    4 title: "[FE] Integrasi Form Pengajuan Cuti (Leave Request)"
    5 labels: frontend, user-module, leaves
    6 assignees: ''
    7 ---
    8
    9 # 🏖️ Leave Request UI Guide
   10
   11 Task ini bertujuan untuk mengimplementasikan form pengajuan cuti bagi semua pengguna (Employee,
      HR, Admin, Superadmin). Berdasarkan Standard Operating Procedure (SOP), **seluruh level jabatan
      wajib mengajukan cuti melalui sistem ini** tanpa terkecuali.
   12
   13 ---
   14
   15 ## 🖼️ 1. Layout Concept: Request Form
   16 Form ini biasanya berada di halaman Dashboard Karyawan atau halaman khusus "My Leaves".
   17
   18 ### Field List:
   19 | Field | Type | Required | Note |
   20 | :--- | :--- | :--- | :--- |
   21 | `leave_type_id` | Select/Dropdown | Yes | Ambil dari daftar jenis cuti (Leave Types). |
   22 | `start_date` | Date | Yes | Tanggal mulai cuti (Format: YYYY-MM-DD). |
   23 | `end_date` | Date | Yes | Tanggal berakhir cuti (Format: YYYY-MM-DD). |
   24 | `reason` | Textarea | Yes | Alasan pengambilan cuti. |
   25 | `delegate_id` | Select/Dropdown | No | ID User pengganti (Delegasi) selama karyawan cuti. |
   26
   27 ---
   28
   29 ## 📡 2. Integrasi API
   30
   31 ### A. Fetch Leave Balances (Sisa Cuti)
   32 Sebelum user mengajukan cuti, sangat disarankan menampilkan sisa cuti (Balance) mereka agar
      mereka tahu berapa banyak kuota yang tersisa.
   33 - **Method**: `GET`
   34 - **URL**: `/api/v1/leaves/balances`
   35
   36 ### B. Submit Leave Request
   37 Endpoint untuk mengirimkan pengajuan cuti.
   38 - **Method**: `POST`
   39 - **URL**: `/api/v1/leaves/request`
   40 - **Payload**:
  {
    "leave_type_id": 1,
    "start_date": "2026-12-24",
    "end_date": "2026-12-26",
    "reason": "Liburan akhir tahun bersama keluarga",
    "delegate_id": 5
    1
    2 ---
    3
    4 ## 🔐 3. Aturan Bisnis & Logika Keamanan
    5 1. **Universal Access**: Endpoint ini **TIDAK DIBATASI** oleh role tertentu. Karyawan biasa, HR,
      hingga Superadmin diwajibkan menggunakan endpoint yang sama jika ingin mengambil cuti.
    6 2. **Balance Validation**: Backend secara otomatis akan memvalidasi apakah sisa cuti karyawan
      mencukupi untuk rentang tanggal yang diajukan. Jika kuota tidak cukup, API akan me-return HTTP
      `400 Bad Request`.
    7 3. **Pending Status**: Semua pengajuan cuti akan masuk dengan status `PENDING` terlebih dahulu
      dan memotong kuota sementara, hingga disetujui (`APPROVED`) atau ditolak (`REJECTED`) oleh
      Manager/HR.
    8 4. **Auto Notification**: Backend akan secara otomatis mengirimkan email kepada Approval Manager
      (Atasan) dan User Delegate (jika diisi) setelah form di-submit.
    9
   10 ---
   11
   12 ## 🚀 Checklist Integrasi Frontend
   13 - [ ] Buat Form Pengajuan Cuti dengan field sesuai spesifikasi payload.
   14 - [ ] Validasi di sisi FE: `start_date` tidak boleh lebih besar dari `end_date`.
   15 - [ ] Tampilkan informasi kuota/sisa cuti karyawan sebelum form di-submit.
   16 - [ ] Tampilkan notifikasi (Toast) berhasil atau gagal dengan menangkap pesan error dari
      response backend (terutama untuk kasus kuota tidak cukup).
   17 - [ ] Refresh daftar riwayat cuti (`GET /api/v1/leaves`) di halaman tersebut secara otomatis
      setelah pengajuan berhasil.
   18
   19 ---
   20 **Focus Scope**: ✅ Leave Request Form | ✅ Balance Validation Handling
   21 **Target API**: `/api/v1/leaves/request` & `/api/v1/leaves/balances`
