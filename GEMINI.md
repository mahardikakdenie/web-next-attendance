# GEMINI.md - Attendance Management System (Enterprise Edition 2026)

## Project Overview
A high-performance Attendance and People Analytics platform built with **Next.js 15+** and **Tailwind CSS 4**. The system features a "Floating App Shell" architecture and robust biometric verification using `face-api.js`. It supports multi-tenant operations with Role-Based Access Control (RBAC) for Admin, HR, Finance, and General Users.

## Building and Running
- **Install Dependencies:** `npm install`
- **Development Mode:** `npm run dev` (Uses Next.js Turbopack)
- **Production Build:** `npm run build`
- **Linting:** `npm run lint`

## Architecture & Flow
- **Framework:** Next.js 15 (App Router)
- **State Management:** Zustand
- **Styling:** Tailwind CSS 4 (Custom rounded corners `rounded-[40px]`)
- **API Client:** Axios with secure interceptors (`src/lib/axios.ts`)
- **Biometrics:** `face-api.js` for facial recognition and GPS-based geo-fencing.

## Key Modules
- **Attendance:** Biometric + GPS verification flow.
- **Analytics:** ApexCharts integration for workforce insights.
- **Payroll:** Indonesian compliance support (TER PPh 21, BPJS).
- **Billing:** Tenant-level subscription management and invoice tracking.

## Development Conventions
- **UI Components:** Prefers custom UI components in `src/components/ui`.
- **Permissions:** Uses `<Can permission="...">` guard for role-based rendering.
- **Data Fetching:** React Query is used for server-state management.
- **Styling:** Adhere to the "2026 Aesthetic" (Glassmorphism, floating shells, soft shadows).

## Billing Integration (Tenant Settings)
- **Endpoint:** `/tenant-settings/billing`
- **Functionality:** 
  - Displays current plan status and upcoming billing summary.
  - Lists billing history (invoices) with PDF download support.
  - Allows plan upgrades through a toggleable pricing grid.
- **API Services:** `getMySubscription`, `getInvoices`, `upgradePlan` in `src/service/subscription.ts`.

---
*Last Updated: May 9, 2026*
