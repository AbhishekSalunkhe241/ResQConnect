# ResQConnect — Post-Disaster Recovery & Coordination Platform

ResQConnect is a frontend demonstration for coordinating post-disaster recovery requests among citizens, relief organizations, volunteers, and an administrative desk. It is a portfolio and college mini project; it is not an emergency dispatch service. For immediate danger, contact local emergency services.

## Features

- Public information pages, demo login, and role switching for citizen, volunteer, NGO, and admin views.
- Citizen request intake with validation, saved drafts, request tracking, details, and notifications.
- Shared request workflow with verification, matching, volunteer assignment, progress updates, completion, and audit history.
- NGO operations view with rule-based request matching, inventory management, and bounded resource allocation.
- Admin review for accounts and requests, moderation, flags, audit logs, and overview metrics.
- Recovery hub directory and analytics with CSV export.
- Persistent light/dark theme toggle available from the navigation bars.

## Technology

React 19, React Router 7, Vite 6, Lucide React, and plain CSS. Shared state is implemented with React Context. The application persists demo requests, users, notifications, resources, audit logs, and recovery hubs in browser localStorage. Data is local to the browser and is not synchronized between devices or users.

## Project structure

- `src/main.jsx`, `src/App.jsx`: application entry and providers
- `src/routes/AppRoutes.jsx`: route definitions
- `src/context/`: demo authentication and shared application state/actions
- `src/data/`: initial mock data
- `src/pages/`: public pages and citizen, volunteer, NGO, admin, and analytics screens
- `src/components/`, `src/layouts/`: reusable UI and page layouts
- `src/index.css`, `src/App.css`: design tokens and styling

## Run locally

Requirements: Node.js 18+ and npm 9+.

```sh
npm install
npm run dev
```

Vite prints the local URL (usually http://localhost:5173). Production build and lint commands:

```sh
npm run build
npm run lint
npm run preview
```

## Demo roles and workflow

Open `/login` and use the built-in role shortcuts to switch between demo personas. Role switching is a frontend convenience only; there is no secure authentication or server-side authorization.

To demonstrate a recovery workflow, create a request as a citizen; review it in the NGO or admin view and move it through Submitted → Under Verification → Verified → Matched → Assistance In Progress → Completed. Assign an available volunteer from the NGO view or claim a verified, unassigned request in the volunteer view. Add progress notes and complete the task. The same browser's shared state powers the other dashboards and request notifications.

NGO matching uses deterministic rules over request priority, category, location, volunteer availability, and inventory fields. It is rule-based matching, not AI or machine learning. Resource allocations require a positive whole quantity, must fit available stock, and cannot repeat the same resource on one request.

## Data and reset

Demo data is initialized from `src/data/` and persisted in localStorage. The selected light/dark theme is stored separately in localStorage. Clearing site data in the browser removes the demo state. The admin dashboard also offers a mock-data reset; it overwrites the current demo state after confirmation. Avoid using that action if you want to retain browser demo records.

## Limitations and future work

- No backend, database, real-time synchronization, secure sign-in, or production access control.
- No live map or geolocation service; hub locations and demo coordinates are sample data.
- Notifications and audit records are browser-local demonstration data.
- A real deployment would need a trusted API, identity and authorization controls, durable storage, operational monitoring, and verified location and partner data.

## Verification status

The source lint check is available with `npm run lint`. The production build requires the Vite dependency to be installed. Build and end-to-end browser flows should be run in an environment with working npm dependencies and browser automation before presenting a release as verified.

## Academic note

Developed for a Computer Engineering Semester 5 mini project.
