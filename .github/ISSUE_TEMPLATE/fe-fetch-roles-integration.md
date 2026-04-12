---
name: "🔑 [FE] Integrasi: Fetch Roles & Permissions List"
about: Panduan mengambil daftar jabatan (Roles) dan daftar izin (Permissions) dari Backend.
title: "[FE] Integrasi API Fetch Roles"
labels: frontend, user-module, security
assignees: ''
---

# 🔑 Fetch Roles API Integration Guide

Task ini bertujuan untuk mengintegrasikan data jabatan (Roles) ke dalam UI, terutama untuk kebutuhan dropdown pada form "Tambah Karyawan" dan dashboard "Manajemen Role".

---

## 📡 1. Endpoint: Get All Roles
Mengambil daftar seluruh jabatan yang tersedia di tenant yang sedang aktif.

- **Method**: `GET`
- **URL**: `/api/v1/tenant-roles`
- **Query Params (Optional)**:
    - `include_permissions=true` (Boolean): Jika ingin mengambil list string permission di dalam setiap role.
- **Response Structure**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "description": "Tenant Owner",
      "base_role": "ADMIN",
      "is_system": true
    },
    {
      "id": 2,
      "name": "HR Manager",
      "description": "Mengelola SDM",
      "base_role": "HR",
      "is_system": false
    }
  ]
}
```

---

## 📝 2. Penggunaan di Frontend

### A. Form Karyawan (Dropdown)
Gunakan data dari endpoint ini untuk mengisi `options` pada komponen Select Role saat mendaftarkan karyawan baru.
- **Label**: `name`
- **Value**: `id`

### B. Badge UI
Gunakan field `base_role` untuk memberikan warna badge yang konsisten:
- `SUPERADMIN` / `ADMIN`: Merah/Cokelat
- `HR`: Biru
- `FINANCE`: Kuning/Emas
- `EMPLOYEE`: Hijau

---

## 🔐 3. Aturan Keamanan
1.  **Akses Terbatas**: Hanya user dengan role `admin` atau `superadmin` yang bisa memanggil endpoint ini.
2.  **System Roles**: Jika `is_system` bernilai `true`, Frontend disarankan untuk **mencegah penghapusan** role tersebut (tombol delete di-disable) karena itu adalah role bawaan sistem.

---

## 🛠️ 4. Endpoint Terkait: Get Role Detail
Jika ingin melihat detail satu role saja (misal untuk halaman Edit Role).
- **Method**: `GET`
- **URL**: `/api/v1/tenant-roles/{id}`

---
**Focus Scope**: ✅ Role List | ✅ Role Dropdown | ✅ BaseRole Mapping
**Target API**: `/api/v1/tenant-roles`
