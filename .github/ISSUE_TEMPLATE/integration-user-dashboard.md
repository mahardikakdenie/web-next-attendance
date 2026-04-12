# 📋 [FE-TASK] User Dashboard API Integration

## 🎯 Konteks Tugas
Menghubungkan seluruh komponen statis/mock-data di User Dashboard dengan endpoint API dari Backend Golang.

---

## 🛠️ Implementation Checklist
### 1. Modul Kehadiran Harian (Core)
- [x] **`ClockCard.tsx` (POST Absensi):**
  - Mengirim payload: `type`, `latitude`, `longitude`, `media_url`.
  - Handle pesan error spesifik: "Hari Libur", "Jadwal OFF", "Out of Radius".
- [x] **`TodayStatusCard.tsx` (GET Status):**
  - Render status (Tepat Waktu/Terlambat), waktu Clock In/Out, dan Working Duration.

### 2. Modul Cuti & Lembur
- [x] **`LeaveBalanceCard.tsx` (GET Saldo Cuti):**
  - Integrasi saldo asli dan indikator progress bar.
- [x] **`LeaveRequestCard.tsx` (POST Form Cuti):**
  - Submit form dengan loading state dan toast feedback.
- [x] **`OvertimeRequestCard.tsx` (POST Form Lembur):**
  - Integrasi pengajuan lembur dengan validasi jam.

### 3. Modul Riwayat & Ringkasan
- [x] **`RecentAttendance.tsx` & `WeeklySummary.tsx`:**
  - Menampilkan 5 log terakhir dari riwayat asli server.
- [x] **`RecentlyActivity.tsx` & `QuickInfoCard.tsx`:**
  - Menampilkan aktivitas dan notifikasi real-time.

---

## 🚦 Acceptance Criteria (AC)
- [x] State synchronization (Auto-refresh setelah absen via `useRefresh`).
- [x] UI Skeleton Loading pada saat initial fetch.
- [x] Zero "any" type usage in dashboard components.

---
**Status**: ✅ FRONTEND INTEGRATION COMPLETE
