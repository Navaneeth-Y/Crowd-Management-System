# CrowdPulse — Crowd Management System

An Angular 17 standalone Single Page Application (SPA) built for the Kloudspot Crowd Management assessment. The dashboard brings together crowd analytics, occupancy monitoring, visitor entry/exit records, and real-time alert interfaces.

## Live Demo

- **Live Application:** https://kscrowdmanagement.netlify.app/
- **GitHub Repository:** https://github.com/Navaneeth-Y/Crowd-Management-System

## Features

- **Authentication:** Login integrated with `POST /api/auth/login`, JWT-based authentication, protected routes, and an HTTP interceptor.
- **Site Selection:** Site selector backed by `GET /api/sites`.
- **Crowd Analytics:** Dashboard integration for footfall, dwell time, occupancy, and demographics.
- **Entry/Exit Records:** Visitor records with server-side pagination and client-side search on the currently loaded page.
- **Live Monitoring:** Socket.IO service for `live_occupancy` and `alert` events.
- **Responsive UI:** Layout designed for desktop and smaller screens.
- **Maintainable Architecture:** Separate TypeScript, HTML, and SCSS files for components, with dedicated services, models, guards, and interceptors.

## Technology Stack

- Angular 17
- TypeScript
- HTML5 and SCSS
- RxJS and Angular HttpClient
- Socket.IO client
- JWT authentication
- REST APIs
- Netlify deployment
- Git and GitHub

## Prerequisites

- Node.js version compatible with Angular CLI 17. Node.js 18.13+ or 20.9+ is recommended.
- npm

## Run Locally

Clone the repository:

```bash
git clone https://github.com/Navaneeth-Y/Crowd-Management-System.git
cd Crowd-Management-System
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

If the project does not define an `npm start` script, use:

```bash
npx ng serve
```

Open http://localhost:4200 in your browser.

## API Configuration

The API base URL is configured in:

`src/environments/environment.ts`

The assessment API base URL is:

`https://hiring-dev.internal.kloudspot.com`

The application uses the authentication and analytics endpoints defined by the assessment API. Protected endpoints require a valid JWT.

### Analytics Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | Authenticate a user |
| `GET /api/sites` | Retrieve available sites |
| `/api/analytics/footfall` | Retrieve entry-event counts |
| `/api/analytics/dwell` | Retrieve dwell-time metrics |
| `/api/analytics/occupancy` | Retrieve occupancy data |
| `/api/analytics/demographics` | Retrieve demographic data |

Analytics requests use `siteId`, `fromUtc`, and `toUtc`, with date ranges represented as epoch milliseconds.

### Date Filters

The date controls are interpreted in the browser's local timezone and converted to epoch milliseconds using `Date.getTime()`. The API stores timestamps in UTC. The site's timezone is displayed as metadata; site-specific local-time date selection may require additional implementation if required by the assessment.

### Real-Time Events

The Socket.IO service is intended to handle the `live_occupancy` and `alert` events.

The exact connection URL, authentication handshake, payload schemas, and room/subscription requirements should match the backend's actual contract. The backend documentation also mentions Server-Sent Events (SSE); no alternative SSE endpoint should be assumed without confirmation.

## Known API Contract Limitations

- The supplied entry/exit schema does not define a gender field, although the assessment brief mentions gender in the visitor table. The UI does not fabricate missing values.
- The exact invalid-login error response is not fully specified. The login page handles common `errorMessage` and `message` fields and provides a generic fallback.
- The API contract does not define percentage comparisons or change indicators, so the dashboard avoids inventing comparison values.
- Simulator start/stop controls are not exposed unless their intended frontend behavior is confirmed.
- Footfall represents entry events, not unique visitors.

## Project Structure

The application follows a feature-based Angular structure. UI components maintain separate TypeScript, HTML, and SCSS files.

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   │   └── components/
│   │   └── entries/
│   ├── layout/
│   └── shared/
│       └── components/
├── assets/
├── environments/
├── _redirects
├── index.html
├── main.ts
└── styles.scss
```

- `core/guards/` — route protection
- `core/interceptors/` — authentication headers for HTTP requests
- `core/services/` — authentication and Socket.IO services
- `features/auth/` — login UI and authentication models
- `features/dashboard/` — dashboard, analytics, and supporting components
- `features/entries/` — entry/exit records and related API integration
- `layout/` — application layout components
- `shared/components/` — reusable loading and error components
- `environments/` — API and environment configuration

## Build

Create a production build:

```bash
npm run build
```

The production build was verified locally. The Netlify deployment also includes a redirect rule so Angular client-side routes continue to work when refreshed directly.

## Security

- Never commit passwords, JWTs, access tokens, or other secrets.
- Use assessment credentials only for authorized testing.
- Keep authentication and API error handling appropriate for the deployed environment.

## Assessment Deliverables

- **Source Code:** https://github.com/Navaneeth-Y/Crowd-Management-System
- **Live Demo:** https://kscrowdmanagement.netlify.app/

