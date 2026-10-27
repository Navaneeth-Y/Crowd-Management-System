# CrowdPulse — Crowd Management UI

Angular 17 standalone SPA scaffold for the Kloudspot Crowd Management assessment.

## Included

- Login page connected to `POST /api/auth/login`.
- JWT stored in `sessionStorage`, protected routes, and an HTTP interceptor that sends `Authorization: Bearer <token>`.
- Site selector backed by `GET /api/sites`.
- Dashboard calls for footfall, dwell, occupancy, and demographics.
- Entry/exit log table with server-side pagination and client-side search on the currently loaded page.
- Responsive UI with separate TypeScript, HTML, and SCSS files.
- Socket.IO service scaffold listening for `live_occupancy` and `alert`.

## Requirements

- Node.js version compatible with Angular CLI 17 (Node.js 18.13+ or 20.9+ recommended).
- npm.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## API configuration

The API base URL is configured in `src/environments/environment.ts`:

```ts
apiBaseUrl: 'https://hiring-dev.internal.kloudspot.com'
```

The app assumes the API response contracts supplied in the assessment Swagger notes. A valid JWT is required for protected endpoints.

### Date filters

The date controls are interpreted in the browser's local timezone and converted to epoch milliseconds with `Date.getTime()` for `fromUtc` and `toUtc`. The API stores its timestamps in UTC. The site timezone returned by the backend is displayed as metadata; if the assessment requires date selection in each site's local timezone, implement that explicitly after confirming the expected UX.

### Real-time events — needs backend confirmation

`src/app/core/services/socket.service.ts` is scaffolded for event names `live_occupancy` and `alert`, based on the example supplied in the assessment material. The actual Socket.IO URL, handshake authentication format, event payload schemas, and any room/subscription messages have not been confirmed. Therefore `socketUrl` is deliberately blank in `environment.ts`; real-time connection will remain disabled until the backend contract is known.

The backend docs mention SSE too, but no SSE endpoint or event schema has been provided. This project does not invent an SSE URL or use SSE without that contract.

## Known API contract gaps

- The entry/exit record schema provided for `/api/analytics/entry-exit` does not contain a gender field, although the assessment brief mentions gender in the visitor table. The UI does not fabricate that field.
- Invalid-login error response shape was not provided. The login page handles common `errorMessage` / `message` shapes and shows a generic fallback.
- No API contract was provided for percentage comparisons / change indicators. The dashboard avoids inventing comparison values.
- Simulation start/stop endpoints are not exposed as buttons because it has not been confirmed that the frontend should control the simulator.
- The documented footfall metric counts entry events, not unique visitors.

## Build

```bash
npm run build
```

## Before submission

1. Confirm the real-time Socket.IO URL, auth handshake, event payloads, and whether SSE must be used.
2. Confirm how the backend expects site-local date ranges to be selected, if relevant.
3. Confirm whether entry/exit gender exists in actual API responses or a separate endpoint.
4. Run `npm install`, `npm run build`, and test against the assessment API with the provided test account.
5. Never commit JWTs or passwords. Use only assessment credentials locally.
6. Replace this README's setup details if deployment hosting needs extra configuration.


## Project organization

This project uses a conventional feature-based Angular structure. Each UI component has its own
`.component.ts`, `.component.html`, and `.component.scss` files. Layout pieces (header, sidebar,
footer, main layout), shared UI components, route guards, interceptors, models, and API services
are kept in their own folders.

- `src/app/layout/`: main layout, header, sidebar, footer
- `src/app/core/guards/`: route guards
- `src/app/core/interceptors/`: HTTP interceptors
- `src/app/core/services/`: authentication and socket service
- `src/app/shared/components/`: reusable loading and error components
- `src/app/features/dashboard/`: dashboard, analytics models and analytics service
- `src/app/features/dashboard/components/`: occupancy chart, demographics chart and live alerts UI
- `src/app/features/entries/`: entry/exit page, models and API service
- `src/app/features/auth/`: login page and authentication models

Note: the live event URL remains intentionally unconfigured because a real Socket.IO/SSE endpoint
and its authentication contract were not supplied. Analytics endpoints are historical/read-only.
The project has not been verified with `npm install` or `ng build` in this environment; run those
commands locally and resolve any environment-specific compiler errors before submission.
