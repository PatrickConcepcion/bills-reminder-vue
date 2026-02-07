# Project Overview

This frontend is a Vue 3 + TypeScript single-page application for a bill reminder system. It provides authenticated user flows (login/register/logout), a protected dashboard, and bill management UX (list, create, update, delete, and mark-as-paid) integrated with the backend API.

# Installation & Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create environment variables from the example file:

```bash
cp .env.example .env
```

3. Confirm the API base URL in `.env` points to the backend (default):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Note: you may need to change this if you are using another port for the backend.

4. Start the frontend in development mode:

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

# Tech Stack Used

- Framework and language: Vue 3, TypeScript
- Build tooling: Vite, Vue TSC
- State management: Pinia
- Routing: Vue Router
- HTTP client: Axios (Chosen for interceptor support which works best for refresh token logic)
- Styling: Tailwind CSS
- Validation: Zod
- Testing: Jest, ts-jest

# Security and Testing Approach

## Security Approach

- Cookie-based auth requests are sent with `withCredentials: true`.
- Axios interceptor handles `401` responses with refresh-token retry logic and forces logout when refresh fails or is invalid.
- Protected routes are enforced through router guards (`requiresAuth` / `guestOnly`).
- Form payloads are validated with Zod before API calls.
- Backend field-level validation errors are mapped to form fields in a consistent way (`useZodErrors` + API error shape handling).
- Validation happens both on blur of input field and on submit of the actual form.

## Testing Approach

- Run tests with:

```bash
npm test
```

- Current automated coverage focuses on date and bill bucketing logic used by dashboard groupings:
  - overdue/upcoming/paid classification
  - timezone-safe due-date handling
  - date key helper behavior
