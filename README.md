# Attendance App

Attendance App is a web-based attendance dashboard built with Next.js, React, TypeScript, Tailwind CSS, and Zustand. It provides a modern frontend for login, dashboard monitoring, attendance history, and browser-assisted check-in/check-out flows with selfie capture and face verification.

## Overview

This project uses the App Router and route groups to separate authenticated admin pages from public login pages. It also includes a local API proxy layer under `src/app/api` so the frontend can call the backend through same-origin routes instead of hitting the upstream API directly from the browser.

The current UI focuses on:

- user login flow
- dashboard summary cards
- attendance list and filters
- clock in / clock out flow
- selfie capture with camera access
- face recognition helper utilities
- geolocation-aware attendance status

## Main Features

### 1. Authentication

- login form with client-side loading state
- auth state management with Zustand
- current-user fetch after login
- logout helper for session cleanup

### 2. Dashboard

- greeting and daily attendance summary
- live clock card for clock in / clock out
- recent attendance preview
- quick info panel for work rules and location
- responsive layout for desktop and mobile

### 3. Attendance Flow

- browser camera access through a modal
- selfie capture before attendance submission
- face descriptor matching via `face-api.js`
- location retrieval using browser geolocation

### 4. API Integration

- Axios client configured to call local `/api` routes
- catch-all proxy route for backend requests
- image proxy route for remote image fetching

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Axios
- face-api.js
- Sonner
- Lucide React

## Project Structure

```text
src/
  app/
    (admin)/             Authenticated route group
    login/               Public login route
    api/                 Next.js API proxy routes
  components/
    attendance/          Attendance-specific UI
    dashboard-user/      Dashboard widgets
    layouts/             App shell components
    ui/                  Reusable UI primitives
  lib/
    axios.ts             Shared API client
    faceRecognition.ts   Face model loading and matching helpers
  service/
    auth.service.ts      Auth API calls
  store/
    auth.store.ts        Auth session state
  views/
    attendances/         Attendance page composition
    dashboard/           Dashboard page composition
    login/               Login page composition
```

## Routes

### Public

- `/login` - login page

### Admin / Authenticated UI

- `/` - dashboard page inside the `(admin)` route group
- `/attendances` - attendance list page

### Internal API

- `/api/[...path]` - proxy to backend API
- `/api/image` - image proxy endpoint

## Environment Variables

Create a local `.env` file before running the app.

```env
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Notes

- `API_URL` is used by the Next.js catch-all proxy route in `src/app/api/[...path]/route.ts`.
- `NEXT_PUBLIC_API_URL` exists in `.env.example`, but the current Axios setup calls the local `/api` route directly, so `API_URL` is the more important value right now.
- Adjust the backend URL to match your API server.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` and set your backend API base URL.

### 3. Run the development server

```bash
npm run dev
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Browser Requirements

Some attendance features depend on browser APIs and will work best in modern browsers.

- camera access is required for selfie capture
- geolocation access is required for location-based attendance status
- face recognition models must be available under `/public/models` for `face-api.js`

If camera, geolocation, or models are unavailable, attendance verification will not work correctly.

## How Authentication Works

1. User submits credentials from the login form.
2. The frontend sends the request through the local API proxy.
3. After login, the app requests the current user profile.
4. Zustand stores the authenticated user and loading state.
5. Subsequent requests can include the session token through the configured client flow.

## Development Notes

- This repo uses the App Router.
- Admin pages are grouped under `src/app/(admin)`.
- Public login pages are separated under `src/app/login`.
- The UI is already responsive, especially the main layout and sidebar shell.
- Current attendance and dashboard data appear to be a mix of live integration and placeholder UI content.

## Known Gaps

- README setup assumes a compatible backend API is already available.
- `.env.example` currently documents `NEXT_PUBLIC_API_URL` only; the server proxy also needs `API_URL`.
- Some dashboard widgets still use static sample values.

## Next Improvements

- document backend API contract and required endpoints
- add screenshots or GIFs for login and attendance flows
- document expected response payloads for auth and attendance APIs
- add deployment instructions for staging and production

## License

No license has been defined in this repository yet.
