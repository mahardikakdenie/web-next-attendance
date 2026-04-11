# Backend Task: Custom Tenant Roles & Hierarchical Access Control (RBAC 2.0)

## 1. Background
Klien (Level COO/Admin Tenant) membutuhkan fleksibilitas untuk membuat role kustom di dalam organisasi mereka sendiri (misal: "HR Manager", "HR Supervisor"). Role kustom ini harus mewarisi sifat dasar dari *Base Role* sistem namun memiliki izin (*Permissions*) dan jangkauan supervisi (*Hierarchy*) yang bisa diatur secara mandiri per Tenant.

---

## 2. Database Schema Changes (New & Updated Entities)

### A. Table: `roles` (Update or Separate)
Tambahkan kolom berikut untuk mendukung kustomisasi per tenant:
- `tenant_id` (Integer, Nullable): Jika NULL, berarti System Role (Global). Jika terisi, berarti role kustom milik tenant tersebut.
- `base_role` (Enum): `['ADMIN', 'HR', 'FINANCE', 'EMPLOYEE']`. Digunakan untuk identifikasi perilaku dasar sistem.
- `is_system` (Boolean): Default `false`. Jika `true`, role tidak boleh dihapus/diedit (contoh: Role Owner).

### B. Table: `permissions` (Static Master Data)
Daftar izin granular yang tersedia di platform.
- `id` (String/UUID): Contoh: `attendance.view`, `payroll.approve`, `analytics.dna`.
- `module` (String): Contoh: `attendance`, `payroll`, `analytics`.
- `action` (String): `view`, `create`, `edit`, `delete`, `approve`, `export`.

### C. Table: `role_permissions` (Mapping)
Menghubungkan Role (baik System maupun Custom) dengan Permissions.
- `role_id` (FK)
- `permission_id` (FK)

### D. Table: `role_hierarchy` (New)
Mendefinisikan siapa yang bisa mengelola siapa.
- `id` (UUID)
- `tenant_id` (FK)
- `parent_role_id` (FK): Role yang mensupervisi.
- `child_role_id` (FK): Role yang disupervisi (bawahan).

---

## 3. API Endpoint Requirements

### A. Role Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/tenant-roles` | List semua role (System + Custom) milik tenant ybs. | Admin, Superadmin |
| `POST` | `/v1/tenant-roles` | Create role baru. Payload: `name`, `description`, `base_role`, `permissions[]`. | Admin, Superadmin |
| `PATCH` | `/v1/tenant-roles/{id}` | Update metadata role atau update daftar permissions. | Admin, Superadmin |
| `DELETE` | `/v1/tenant-roles/{id}` | Hapus role kustom (Role `is_system: true` harus ditolak). | Admin, Superadmin |

### B. Hierarchy & Approval Scope
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/tenant-roles/{id}/hierarchy` | Melihat daftar role yang berada di bawah supervisi role ini. | Admin, Superadmin |
| `POST` | `/v1/tenant-roles/hierarchy` | Menyimpan relasi supervisi. Payload: `parent_role_id`, `child_role_ids[]`. | Admin, Superadmin |

---

## 4. Logic Business & Middleware Rules

### 1. The "Dual-Nature" Superadmin Logic
- **Superadmin** memiliki `tenant_id`. 
- Saat mengakses resource global (Tenant List, Subscriptions), gunakan hak akses Platform.
- Saat mengakses resource internal (Attendance, Payroll miliknya sendiri), perlakukan Superadmin sama seperti role **ADMIN** (Owner) pada tenant tersebut. Bypass semua pengecekan izin khusus.

### 2. Permission-Based Access (Middleware)
Buat middleware yang mengecek izin spesifik, bukan hanya nama role.
- **Bad logic**: `if (user.role == 'HR')`
- **Good logic**: `if (user.hasPermission('attendance.edit'))`

### 3. Hierarchical Data Scoping
Saat user dengan role kustom (misal: "HR Supervisor") mengambil data:
- Backend harus mengecek table `role_hierarchy`.
- User hanya boleh melihat data karyawan yang memiliki role di dalam `child_role_id` miliknya.
- Filter ini berlaku pada API: `GET /v1/attendances`, `GET /v1/leaves`, `GET /v1/employees`.

### 4. Approval Authorization
Pada endpoint `POST /v1/leaves/{id}/approve`:
- Cek apakah `requester.role_id` terdaftar sebagai bawahan dari `approver.role_id` di table `role_hierarchy`.
- Jika tidak, kembalikan `403 Forbidden`.

---

## 5. Metadata for Frontend
Pastikan endpoint `/v1/auth/me` mengembalikan:
- `permissions[]`: Array string ID permission (untuk toggle UI).
- `is_owner`: Boolean (true jika role adalah ADMIN atau SUPERADMIN).
- `tenant_settings`: Detail koordinat dan radius (sudah ada).

---
**Prepared by:** Gemini CLI Agent (Acting as Architecture Consultant)
**Target:** Backend Engineering Team
