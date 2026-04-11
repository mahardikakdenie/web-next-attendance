# SaaS Project Architecture & Mandates

## 1. Multi-Tenant Hierarchy
Aplikasi ini adalah sistem SaaS Multi-tenant. Seluruh developer dan AI harus mematuhi hirarki role berikut:

### A. Platform Level (Global)
- **Role: SUPERADMIN**
  - Pemilik platform SaaS (Owner of the system).
  - **Dual-Nature Role**: Selain mengelola sistem global, Superadmin juga bertindak sebagai **Owner** pada tenant tempat ia terdaftar (`tenant_id`).
  - Memiliki akses ke **SEMUA** menu: Platform Admin, Management, Payroll, dan Organization Settings.
  - Mengelola Tenant (Organisasi), Subscriptions, dan Akun Administrator Global.

### B. Tenant Level (Organization)
- **Role: ADMIN**
  - Pemilik/Manager Tenant (Owner of the company).
  - Mengelola setting organisasi, metode verifikasi, dan memiliki kontrol penuh atas HR & Finance di perusahaannya.
- **Role: HR**
  - Pengelola operasional SDM dalam satu tenant.
  - Mengelola absensi, cuti, lembur, dan directory karyawan.
- **Role: FINANCE**
  - Pengelola penggajian (Payroll) dan pajak dalam satu tenant.
- **Role: EMPLOYEE (USER)**
  - Pengguna akhir. Melakukan absensi, pengajuan cuti, dan melihat slip gaji sendiri.

## 2. Technical Standards
- **No `any` data type**: Gunakan interface yang terdokumentasi di `@/types/*`.
- **UI Aesthetic**: Menggunakan konsep **Floating App Shell** (rounded 40px, bg-slate-50, glassmorphism).
- **Icons**: Gunakan `lucide-react`.
- **Charts**: Gunakan `apexcharts`.
- **State Management**: Zustand untuk Auth dan Global State.
- **ESLint Compliance**: Selalu jalankan `npm run lint` sebelum menyelesaikan tugas.

## 3. Data Flow
- Data dari API yang bersifat nested (seperti relation `user` dalam `attendance`) harus di-flatten saat tahap *fetching* di View untuk memudahkan pencarian dan rendering di `DataTable`.
- Gunakan `secureRequest` dari `@/lib/axios.ts` untuk semua komunikasi backend.
