# Implementation Plan: Performance Management Module

## 1. Background & Motivation
Sebagai platform HCM (Human Capital Management) yang komprehensif, sistem *Attendance* dan *Payroll* saat ini sangat solid dalam menghitung kuantitas (waktu) dan nilai kompensasi. Namun, sistem belum memiliki kapabilitas untuk mengukur **kualitas kerja** karyawan. Modul *Performance Management* akan mengisi celah ini, memungkinkan HR dan Manajer untuk menetapkan target (KPI/OKR), mengevaluasi pencapaian, dan memberikan *feedback* terstruktur yang nantinya dapat diintegrasikan dengan modul *Payroll* (untuk perhitungan bonus/insentif) dan *Career Development*.

## 2. Scope & Impact
*   **Target Audience:** Seluruh karyawan (untuk *self-review* dan melihat OKR), Manajer (untuk evaluasi tim), dan HR/Admin (untuk mengatur siklus evaluasi).
*   **Core Capabilities:**
    *   Goal Setting (OKR / KPI Framework).
    *   Performance Appraisal Cycles (Review Tahunan/Semesteran).
    *   360-Degree Feedback.
    *   Continuous Feedback & Notes (1-on-1 tracking).
*   **Integration Points:**
    *   **Payroll:** Hasil appraisal dapat dikonversi menjadi *multiplier* untuk insentif/bonus tahunan.
    *   **Attendance & Activity:** Keterlambatan dan *log* aktivitas akan menjadi salah satu metrik penilaian (Data kuantitatif vs kualitatif).

## 3. Proposed Solution Architecture

### 3.1. Backend Changes (Database & API)
*   **New Models:**
    *   `PerformanceCycle`: Mewakili periode penilaian (misal: "Q1 2026", "Tahunan 2026"). Memiliki status `DRAFT`, `ACTIVE`, `CLOSED`.
    *   `Goal` (KPI/OKR): Target yang diberikan ke karyawan atau departemen. Menyimpan nilai target dan *current progress*.
    *   `Appraisal`: Penilaian akhir karyawan dalam sebuah *Cycle*. Menyimpan *Self-Review Score*, *Manager Score*, dan *Final Rating*.
    *   `Feedback`: Komentar kualitatif dari *peer* atau manajer (360-degree).
*   **New Endpoints:**
    *   `GET /api/v1/performance/goals/me`
    *   `GET /api/v1/performance/goals/user/{userId}`
    *   `POST /api/v1/performance/goals`
    *   `PUT /api/v1/performance/goals/{id}/progress`
    *   `GET /api/v1/performance/cycles`
    *   `GET /api/v1/performance/appraisals/cycle/{cycleId}`

### 3.2. Frontend Implementation
*   **Admin/HR Dashboard (`src/views/performance/AdminIndex.tsx`):**
    *   Manajemen *Performance Cycles* (Buka/Tutup siklus).
*   **Manager Dashboard (`src/views/performance/ManagerGoals.tsx`):**
    *   Daftar bawahan langsung (diambil dari `manager_id` di tabel *User*).
    *   Form evaluasi untuk memberikan *scoring* dan *feedback*.
*   **User/Employee Portal (`src/views/performance/UserGoals.tsx`):**
    *   Tampilan OKR/KPI pribadi dengan *progress bar*.
    *   Form *Self-Assessment* saat siklus aktif.

## 4. Phased Implementation Plan

### Phase 1: Foundation (Goal Setting) - [DONE]
*   [x] (Frontend) Service layer `performance.ts`.
*   [x] (Frontend) `UserGoalsSection` di Dashboard.
*   [x] (Frontend) `ManagerGoalsView` untuk assignment target.

### Phase 2: Appraisal Cycle (Evaluasi Inti) - [NEXT]
*   [ ] (Backend) Implementasi model `PerformanceCycle` dan `Appraisal`.
*   [ ] (Frontend) HR/Admin Panel untuk membuat siklus baru.
*   [ ] (Frontend) Form *Self-Review* untuk karyawan.
*   [ ] (Frontend) Form *Manager Review* dan *Approval Workflow*.
