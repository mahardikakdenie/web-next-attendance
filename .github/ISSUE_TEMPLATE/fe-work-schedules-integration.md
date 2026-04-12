---
name: "🕒 [FE] Integrasi: Work Shifts & Weekly Rostering (V2)"
about: Panduan detail integrasi UI/UX untuk pengelolaan Shift kerja dan Plotting Jadwal Mingguan karyawan.
title: "[FE] Integrasi Work Schedules & Roster System"
labels: frontend, hr-ops, schedules
assignees: ''
---

# 🕒 Work Schedules & Rostering UI Guide

Task ini mencakup implementasi manajemen shift dan grid penjadwalan mingguan (Roster) yang dinamis.

---

## 🏗️ 1. Modul: Shift Templates
Sebelum mengatur jadwal, Admin harus membuat template shift.

- **Endpoint**: `GET /api/v1/hr/shifts`
- **Tampilan**: Gunakan komponen **Color-coded Cards**.
- **Data Penting**:
    - `startTime` & `endTime` (Format: `HH:mm`).
    - `color`: String CSS class (misal: `bg-emerald-500`) untuk konsistensi visual di Grid Roster.

---

## 📅 2. Modul: Weekly Roster Grid (Penjadwalan)
Ini adalah fitur utama untuk plotting jadwal karyawan dalam satu minggu.

- **Endpoint**: `GET /api/v1/hr/roster?start_date=2026-04-13&end_date=2026-04-19`
- **Layout Requirement**:
    - Tampilkan tabel dengan baris = **Karyawan** dan kolom = **Senin s/d Minggu**.
    - Isi cell adalah **Dropdown** yang berisi daftar Shift.
    - Jika cell bernilai `"off"`, tandai dengan warna abu-abu (Libur).

### Struktur Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Bagus Fikri",
      "department": "Engineering",
      "weeklyRoster": {
        "monday": "uuid-shift-pagi",
        "tuesday": "uuid-shift-pagi",
        "wednesday": "off",
        "thursday": "uuid-shift-pagi",
        "friday": "uuid-shift-pagi",
        "saturday": "off",
        "sunday": "off"
      }
    }
  ]
}
```

---

## 💾 3. Menyimpan Jadwal (Bulk Save)
Gunakan satu tombol "Save Roster" untuk mengirim seluruh perubahan dalam grid.

- **Endpoint**: `POST /api/v1/hr/roster/save`
- **Payload Structure**:
```json
{
  "start_date": "2026-04-13",
  "assignments": [
    {
      "user_id": 1,
      "roster": {
        "monday": "uuid-shift-pagi",
        "tuesday": "uuid-shift-pagi",
        "wednesday": "off",
        "thursday": "uuid-shift-pagi",
        "friday": "uuid-shift-pagi",
        "saturday": "off",
        "sunday": "off"
      }
    }
  ]
}
```
> **Note**: `start_date` harus selalu hari Senin dari minggu yang sedang diatur.

---

## ⚙️ 4. Aturan Bisnis di FE
1.  **Shift Overlap**: Pastikan jam pulang tidak lebih awal dari jam masuk (Backend sudah validasi, tapi bagus jika ada pre-check di FE).
2.  **OFF State**: Pilihan `"off"` wajib ada di setiap dropdown hari untuk menandakan hari libur karyawan.
3.  **Color Sync**: Gunakan field `color` dari template shift untuk mewarnai background cell di grid roster agar HR mudah membedakan shift secara visual.

---

## 🔐 5. Role & Permissions
- Modul ini hanya boleh diakses oleh: `SUPERADMIN`, `ADMIN`, dan `HR`.
- Gunakan permission `hr.manage` (atau sesuai mapping terbaru) untuk memproteksi tombol Save.

---
**Focus Scope**: ✅ Shift CRUD | ✅ Weekly Grid Roster | ✅ Bulk Save Logic
**Target API**: `/api/v1/hr/shifts` & `/api/v1/hr/roster`
