# SaaS Project Architecture & Mandates

## 1. Multi-Tenant Hierarchy
Aplikasi ini adalah sistem SaaS Multi-tenant. Seluruh developer dan AI harus mematuhi hirarki role berikut. 

**PENTING: Base Role Architecture (Backend Sync)**
Tabel `roles` di Backend menggunakan konstanta `BASE_ROLE` berikut:
- `SUPERADMIN`
- `ADMIN`
- `HR`
- `FINANCE`
- `EMPLOYEE`

### A. Platform Level (SaaS Headquarters - Tenant ID: 1)
- **Role: SUPERADMIN (Base Role: SUPERADMIN)**
  - Pemilik platform SaaS (Owner of the system).
  - **Dual-Nature Role**: Selain mengelola sistem global, Superadmin juga bertindak sebagai **Owner** pada tenant tempat ia terdaftar (Pasti di `tenant_id: 1`).
  - Memiliki akses ke **SEMUA** menu: Platform Admin, Management, Payroll, dan Organization Settings.
  - Mengelola Tenant (Organisasi), Subscriptions, dan Akun Administrator Global.
- **Custom Platform Roles (e.g., Customer Service)**
  - Superadmin dapat membuat role kustom di dalam Tenant 1 (misal: "CS Staff" dengan Base Role `EMPLOYEE`) yang diberi tugas spesifik untuk mengelola *Support Desk* dan *Trial Requests* dari luar.

### B. Tenant Level (Client Organizations - Tenant ID > 1)
- **Role: ADMIN (Base Role: ADMIN)**
  - Pemilik/Manager Tenant (Owner of the company).
  - Mengelola setting organisasi, metode verifikasi, dan memiliki kontrol penuh atas HR & Finance di perusahaannya.
- **Role: HR (Base Role: HR)**
  - Pengelola operasional SDM dalam satu tenant.
  - Mengelola absensi, cuti, lembur, dan directory karyawan.
- **Role: FINANCE (Base Role: FINANCE)**
  - Pengelola penggajian (Payroll) dan pajak dalam satu tenant.
- **Role: EMPLOYEE (Base Role: EMPLOYEE)**
  - Pengguna akhir. Melakukan absensi, pengajuan cuti, dan melihat slip gaji sendiri.

## 2. Technical Standards
- **No `any` data type**: Gunakan interface yang terdokumentasi di `@/types/*`.
- **UI Aesthetic**: Menggunakan konsep **Floating App Shell** (rounded 40px, bg-slate-50, glassmorphism).
- **Global UI Components**: Selalu prioritaskan penggunaan komponen UI global dari `@/components/ui/*`. 
  - **PENTING**: Gunakan komponen `Avatar` dari `@/components/ui/Avatar.tsx` untuk semua tampilan foto profil, inisial user, atau logo organisasi. Jangan gunakan `next/image` secara langsung untuk avatar guna menghindari error properti width/height dan inkonsistensi styling.
- **Icons**: Gunakan `lucide-react`.
- **Charts**: Gunakan `apexcharts`.
- **State Management**: Zustand untuk Auth dan Global State.
- **ESLint Compliance**: Selalu jalankan `npm run lint` sebelum menyelesaikan tugas.

## 3. Data Flow
- Data dari API yang bersifat nested (seperti relation `user` dalam `attendance`) harus di-flatten saat tahap *fetching* di View untuk memudahkan pencarian dan rendering di `DataTable`.
- Gunakan `secureRequest` dari `@/lib/axios.ts` untuk semua komunikasi backend.
