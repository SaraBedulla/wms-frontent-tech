# WMS Frontend

React + Vite frontend for the Warehouse Management System.

## Requirements
- Node.js 18+
- Backend running on http://localhost:8080

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How it works

The Vite dev server proxies all `/api` requests to `http://localhost:8080`,
so no CORS configuration is needed during development.

## Default credentials

| Username | Password | Role             |
|----------|----------|------------------|
| admin    | admin123 | SYSTEM_ADMIN     |
| manager  | manager123 | WAREHOUSE_MANAGER |
| client1  | client123 | CLIENT           |

## Pages by role

### CLIENT
- Dashboard — order stats and recent orders
- My Orders — list with status filter tabs
- Order Detail — full order view with dynamic action buttons (Edit, Submit, Cancel)
- Create Order — item picker with live total summary
- Inventory — browse available items (read-only)

### WAREHOUSE_MANAGER
- Dashboard — pending approvals and stats
- All Orders — all client orders with status filter
- Order Detail — Approve / Decline (with reason modal) / Fulfill
- Inventory — full CRUD (create, edit, delete items)

### SYSTEM_ADMIN
- Dashboard — user count by role
- Users — full CRUD with role assignment and enable/disable

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Point your web server at it and proxy `/api` to the backend.
