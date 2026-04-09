---
name: Frontend Production Readiness Audit
about: Checklist tugas krusial Frontend (Next.js/UI) sebelum rilis ke production
title: "[FE-AUDIT] Production Readiness & UI/UX Gaps"
labels: frontend, ui/ux, security, performance, critical
assignees: ''
---

# 📋 ISSUE: Frontend Production Readiness Audit & Feature Gaps
**Project:** Attendance & Payroll SaaS (Next.js Frontend)
**Status:** Pre-Alpha / MVP Development
**Objective:** Mengidentifikasi celah kritikal di sisi Klien (Frontend) yang harus diselesaikan sebelum aplikasi digunakan secara komersial oleh pengguna akhir (Karyawan, HR, Finance, Superadmin).

---

## 🎨 1. Arsitektur Multi-Tenant UI & State Management
Karena ini adalah SaaS, UI harus bisa beradaptasi dengan konteks *Tenant* yang sedang aktif tanpa me-*refresh* halaman.

- [ ] **Tenant Context Switcher:** Buat komponen UI bagi `Superadmin` untuk berpindah tampilan antar *Tenant* (Perusahaan) dengan mulus. Pastikan `TenantID` tersimpan rapi di *Global State* (Zustand).
- [ ] **Dynamic Branding / White-labeling:** Persiapkan struktur agar aplikasi bisa memuat Logo dan *Primary Color* yang berbeda berdasarkan *Tenant* yang sedang login.
- [ ] **Data Masking di DOM:** Pastikan data sensitif pribadi (PII) seperti NIK KTP atau Nomor Rekening di halaman Profil/Payroll disensor secara visual (misal: `****-****-1234`) dan ada tombol "Show/Hide".

## 🔐 2. Keamanan Klien & Route Protection (Next.js)
File `src/store/auth.store.ts` dan logika *routing* harus diperkuat agar pengguna tidak bisa sembarangan mengakses halaman yang bukan wewenangnya.

- [ ] **Next.js Middleware Guard:** Terapkan perlindungan rute menggunakan `middleware.ts` Next.js untuk mencegah pengguna yang belum login masuk ke folder `(admin)`, atau karyawan biasa masuk ke rute `/payroll`. Jangan hanya mengandalkan pengecekan `if (isAdmin)` di dalam komponen.
- [ ] **Keamanan Penyimpanan Token:** Evaluasi `auth.store.ts`. Jika token akses saat ini disimpan di `localStorage`, segera buat mekanisme untuk memindahkannya ke *httpOnly Cookies* (melalui integrasi Next.js API Routes/NextAuth) guna mencegah kerentanan XSS.
- [ ] **Session Timeout & Auto-Logout UI:** Buat komponen modal *warning* yang memperingatkan pengguna jika sesi mereka akan segera habis karena tidak ada aktivitas (Idle).

## 📸 3. Modul Face Recognition & Perangkat Keras Browser
Berdasarkan folder `public/models`, modul pengenalan wajah (*face recognition*) di sisi klien sangat krusial dan membutuhkan optimasi tinggi agar tidak memberatkan *browser* pengguna.

- [ ] **Optimasi Muatan Model AI (Caching):** Pastikan file model `.bin` dan `.json` di-*cache* dengan benar oleh *Service Worker* atau *Browser Cache* agar tidak diunduh berulang kali yang menghabiskan kuota internet karyawan saat absen.
- [ ] **Anti-Spoofing / Liveness Detection UI:** Tambahkan instruksi interaktif pada komponen `CameraModal.tsx` yang meminta pengguna untuk berkedip atau menoleh, untuk memastikan yang absen adalah manusia asli, bukan sekadar foto 2D.
- [ ] **Penanganan Izin Perangkat (Permissions):** Buat UI *fallback* yang jelas jika pengguna menolak izin Kamera atau Lokasi (GPS), lengkap dengan panduan cara mengaktifkannya kembali di pengaturan browser.
- [ ] **Geofencing Visualizer:** Tambahkan integrasi peta kecil (misal: Leaflet/Mapbox) di halaman absen untuk menunjukkan lokasi karyawan saat ini dibandingkan dengan radius absensi kantor yang valid.

## ⚡ 4. Performa & Pengalaman Pengguna (UX)
Aplikasi harus terasa cepat, responsif, dan memberikan umpan balik (*feedback*) yang jelas kepada pengguna.

- [ ] **Mekanisme PWA & Offline Absen (Service Worker):** Implementasikan *Service Worker* dan `IndexedDB` agar karyawan tetap bisa menekan tombol *Clock In/Out* meskipun internet sedang terputus, dan tampilkan indikator "Menunggu Sinkronisasi" di antarmuka.
- [ ] **Virtualisasi Tabel Data Besar:** Jika `AttendanceTable` atau `PayrollView` memuat ratusan karyawan, pastikan tabel menggunakan teknik *Virtualization* (misal: `@tanstack/react-virtual`) atau *Server-Side Pagination* agar *browser* tidak *lag/freeze*.
- [ ] **React Error Boundaries:** Bungkus setiap bagian utama *layout* dengan *Error Boundary*. Jika ada satu komponen yang *crash* (misal gagal merender grafik), cegah agar seluruh halaman tidak berubah menjadi "layar putih" (Blank Page).
- [ ] **Zustand Form Persist:** Terapkan fungsionalitas penyimpanan draf sementara (Persist) pada form yang panjang (seperti `UpdateRequestForm` atau form pengajuan lembur). Jika pengguna tidak sengaja me-*refresh* tab, data ketikan mereka tidak hilang.

## 📱 5. Responsivitas & Aksesibilitas (a11y)
- [ ] **Audit Mobile View (Khusus Karyawan):** Pastikan tampilan Dashboard Karyawan, `ClockCard`, dan `CameraModal` berfungsi 100% sempurna di berbagai ukuran layar HP.
- [ ] **Loading Skeletons:** Ganti efek *spinner/loading* biasa dengan komponen *Skeleton Loader* pada halaman-halaman berat untuk menghindari *Cumulative Layout Shift* (CLS) saat data selesai dimuat dari API.
