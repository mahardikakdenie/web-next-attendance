---
name: "📅 [FE] Integrasi: Holiday & Corporate Calendar CRUD"
about: Panduan detail integrasi UI/UX untuk pengelolaan kalender hari libur dan acara perusahaan.
title: "[FE] Integrasi Holiday Calendar CRUD"
labels: frontend, hr-ops, enhancement
assignees: ''
---

# 📅 Holiday Calendar Management UI Guide

Task ini bertujuan untuk mengimplementasikan modul CRUD Kalender Libur yang digunakan untuk operasional absensi dan payroll.

---

## 🖼️ 1. Layout Concept: Holiday Calendar
Gunakan visualisasi **Full Calendar** atau **List View** yang dikelompokkan berdasarkan bulan.

- **Actions**: Tombol "Add Holiday", Edit (ikon pensil), dan Delete (ikon sampah).
- **Data Points**: Tanggal, Nama Hari Libur, Tipe (National/Company/Mandatory), dan Status Paid (Berbayar).

---

## 📝 2. Form: Create/Update Holiday
Modal form untuk input data hari libur.

### Field List:
| Field | Type | Required | Note |
| :--- | :--- | :--- | :--- |
| `date` | Date | Yes | Format YYYY-MM-DD |
| `name` | String | Yes | Nama libur (max 100 char) |
| `type` | Enum | Yes | `National Holiday`, `Company Event`, `Mandatory Leave`, `Other` |
| `is_paid` | Boolean | Yes | Default: true. Jika true, karyawan tetap dihitung jam kerja. |

---

## 📡 3. Integrasi API

### A. Fetch Holidays
- **Method**: `GET`
- **URL**: `/api/v1/hr/calendar?year=2026`
- **Note**: Selalu kirim query parameter `year` untuk performa optimal.

### B. Create Holiday
- **Method**: `POST`
- **URL**: `/api/v1/hr/calendar`
- **Payload**:
```json
{
  "date": "2026-08-17",
  "name": "Independence Day",
  "type": "National Holiday",
  "is_paid": true
}
```

### C. Update Holiday
- **Method**: `PUT`
- **URL**: `/api/v1/hr/calendar/{uuid}`
- **Payload**:
```json
{
  "name": "Independence Day Celebration",
  "is_paid": true
}
```

### D. Delete Holiday
- **Method**: `DELETE`
- **URL**: `/api/v1/hr/calendar/{uuid}`

---

## 🔐 4. Business Rules & Logic
1.  **Uniqueness**: Backend akan menolak (400 Bad Request) jika ada dua hari libur di tanggal yang sama dalam satu tenant.
2.  **Attendance Blocker**: Secara otomatis, sistem absensi tidak akan mengizinkan karyawan Clock-in/Clock-out pada tanggal yang terdaftar di sini (kecuali diizinkan khusus).
3.  **Role Access**: Fitur ini hanya dapat diakses oleh user dengan Base Role `SUPERADMIN`, `ADMIN`, atau `HR`.

---
**Focus Scope**: ✅ Calendar View | ✅ Holiday Form | ✅ CRUD Integration
**Target API**: `/api/v1/hr/calendar`
