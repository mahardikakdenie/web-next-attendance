---
name: "[FE-TASK] User Dashboard API Integration"
about: Checklist tugas integrasi API Backend ke komponen UI di halaman User Dashboard
title: "[FE-TASK] Integrasi API User Dashboard Components"
labels: frontend, api-integration, enhancement
assignees: ''
---

# 📋 ISSUE: Integrasi API pada User Dashboard (Frontend)
**Module:** User Dashboard Frontend (`src/views/dashboard/UserDashboard.tsx` & `src/components/dashboard-user/*`)
**Status:** Slicing UI Selesai / Integrasi Sebagian
**Objective:** Menghubungkan seluruh komponen statis/mock-data di User Dashboard dengan endpoint API dari Backend Golang yang sudah diperbarui.

---

## 🎯 Konteks Tugas
UI User Dashboard (menggunakan *Bento Grid*) sudah terbentuk dengan baik, dan beberapa komponen utama (seperti `ClockCard` dan `TodayStatusCard`) sudah mulai dikonfigurasi dengan fungsi *fetching*. Tugas ini adalah untuk memastikan **semua** komponen di dashboard ini terhubung penuh dengan API Backend, menggunakan struktur data asli, serta menangani status *loading* dan *error* secara *graceful* (mulus) agar UX tetap terjaga.

## 🛠️ Checklist Integrasi Komponen FE
Pastikan komponen-komponen berikut di folder `src/components/dashboard-user/` selesai diintegrasikan:

### 1. Modul Kehadiran Harian (Core)
- [ ] **`ClockCard.tsx` (POST Absensi):**
  - Pastikan POST request menggunakan `axiosClient` ke API absensi (misal: `/api/v1/attendances/clock`) mengirim payload lengkap: `type`, `latitude`, `longitude`, `media_url`.
  - Handle pesan error spesifik dari Backend dengan UI Toast (misal jika API menolak karena: "Anda di luar radius kantor" atau "Sudah mencapai batas absen hari ini").
- [ ] **`TodayStatusCard.tsx` (GET Status):**
  - Tarik data dari API ringkasan hari ini (misal: `/api/v1/attendances/today`).
  - Render *badge status* (Tepat Waktu/Terlambat), waktu *Clock In*, waktu *Clock Out*, dan kalkulasi *Working Duration* berdasarkan data API tersebut.

### 2. Modul Cuti & Lembur
- [ ] **`LeaveBalanceCard.tsx` (GET Saldo Cuti):**
  - Ganti *mock data* sisa cuti dengan hasil *fetch* dari API `/api/v1/leaves/balances`. Update angka dan indikator *progress bar* agar akurat sesuai sisa kuota.
- [ ] **`LeaveRequestCard.tsx` (POST Form Cuti):**
  - Integrasikan *submit form* pengajuan cuti ke API (misal: `/api/v1/leaves/request`).
  - Berikan efek *loading* (spinner) pada tombol *submit*, kosongkan *form* setelah sukses, dan panggil alert/toast konfirmasi sukses (200 OK).
- [ ] **`OvertimeRequestCard.tsx` (POST Form Lembur):**
  - Integrasikan pengajuan lembur ke API `/api/v1/overtimes/request`. Pastikan validasi form (*start time* & *end time*) ditangani sebelum me-request ke API.

### 3. Modul Riwayat & Ringkasan
- [ ] **`RecentAttendance.tsx` & `WeeklySummary.tsx` (GET Data Table/Chart):**
  - Tarik data log absensi dari `/api/v1/attendances/history?limit=5`.
  - Ganti tabel *hardcoded* dengan *map* data dari API.
- [ ] **`RecentlyActivity.tsx` & `QuickInfoCard.tsx` (GET Aktivitas):**
  - Ganti data pengumuman atau status *approval* terbaru dengan data nyata dari API aktivitas (misal: `/api/v1/activities/recent`).

---

## 🚦 Acceptance Criteria (AC) & Standar Kode
1. **Axios Instance:** Selalu gunakan instance `axiosClient` dari `src/lib/axios.ts` untuk melakukan request. Hal ini diwajibkan agar injeksi Token JWT (Authorization header) ditangani secara otomatis.
2. **Strict Typing:** Buat *Interface/Type* TypeScript untuk struktur *Response* API (di atas file komponen atau di `src/types/`). Hindari penggunaan tipe data `any`.
3. **UX Handling:** - **Wajib** menambahkan UI **Skeleton Loading** (menggunakan Tailwind `animate-pulse`) saat komponen pertama kali memuat data dari API.
   - Tidak boleh ada *blank screen* / UI rusak jika API gagal (misal: 500 Server Error). Tangkap dengan `catch` dan tampilkan kotak indikator pesan error di dalam kartu Bento Grid tersebut.
4. **State Refresh:** Setelah berhasil melakukan mutasi (misal: sukses menekan tombol *Clock In*), pastikan komponen lain yang mengandalkan data tersebut (seperti `TodayStatusCard` atau `RecentAttendance`) ikut memperbarui datanya secara otomatis.
