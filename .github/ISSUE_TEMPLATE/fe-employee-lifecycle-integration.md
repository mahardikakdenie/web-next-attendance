---
name: "📋 [FE] Integrasi: Employee Lifecycle (Onboarding/Offboarding)"
about: Panduan implementasi UI Checklist untuk proses masuk dan keluar karyawan.
title: "[FE] Integrasi Employee Lifecycle Checklist"
labels: frontend, hr-ops, user-module
assignees: ''
---

# 📋 Employee Lifecycle Checklist UI Guide

Task ini bertujuan untuk mengimplementasikan antarmuka checklist operasional bagi HR untuk mengelola proses **Onboarding** (karyawan baru) dan **Offboarding** (karyawan keluar).

---

## 🖼️ 1. Layout Concept: Lifecycle Dashboard
Tampilkan checklist ini di dalam halaman detail karyawan atau tab khusus "Lifecycle".

- **Progress Bar**: Tampilkan persentase penyelesaian (misal: 3/10 tugas selesai).
- **Tab Switching**: Pisahkan antara tugas "Onboarding" dan "Offboarding".
- **Visual Feedback**: Gunakan warna hijau atau coretan (strikethrough) untuk tugas yang sudah `is_completed: true`.

---

## 📝 2. Data Structure (Checklist Item)
Backend mengirimkan list tugas dengan struktur berikut:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | ID Unik Tugas (Gunakan untuk PATCH). |
| `task_name` | String | Nama aktivitas (misal: "Laptop Handover"). |
| `category` | Enum | `ONBOARDING` atau `OFFBOARDING`. |
| `is_completed` | Boolean | Status centang. |
| `completed_at` | DateTime | Waktu penyelesaian (nullable). |

---

## 📡 3. Integrasi API

### A. Fetch Employee Lifecycle
Ambil daftar tugas milik karyawan tertentu.
- **Method**: `GET`
- **URL**: `/api/v1/hr/employees/{user_id}/lifecycle`
- **Response Sample**:
```json
{
  "status": "success",
  "data": {
    "employee_id": 5,
    "status": "ONBOARDING",
    "tasks": [
      {
        "id": "uuid-task-1",
        "task_name": "Email Setup",
        "category": "ONBOARDING",
        "is_completed": true,
        "completed_at": "2026-04-12T10:00:00Z"
      },
      {
        "id": "uuid-task-2",
        "task_name": "ID Card Printing",
        "category": "ONBOARDING",
        "is_completed": false
      }
    ]
  }
}
```

### B. Update Task Status (Check/Uncheck)
Update status penyelesaian tugas.
- **Method**: `PATCH`
- **URL**: `/api/v1/hr/employees/{user_id}/lifecycle/tasks/{task_id}`
- **Payload**:
```json
{
  "is_completed": true
}
```

---

## 🔐 4. Access Control
- Fitur ini memerlukan Base Role: `SUPERADMIN`, `ADMIN`, atau `HR`.
- Tombol centang harus di-disable jika user yang login hanya memiliki role `EMPLOYEE`.

---
**Focus Scope**: ✅ Lifecycle Tabs | ✅ Progress Tracking | ✅ Toggle Completion
**Target API**: `/api/v1/hr/employees/:id/lifecycle`
