# Near Nerd Operations Portal

A premium business expense management system for operational tracking and bill management.

## Project Overview

**Tech Stack:**
- Frontend: React 19 + Vite 8
- Database: Supabase (PostgreSQL)
- Hosting: Vercel
- Testing: Vitest + React Testing Library
- Styling: Vanilla CSS with custom design system

**Purpose:** Dashboard and management system for tracking operational expenses, bills, vendors, locations, and documents.

## Architecture

### Directory Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── BillManager.tsx
│   ├── LocationManager.tsx
│   ├── VendorManager.tsx
│   ├── CalendarView.tsx
│   ├── SettingsView.tsx
│   ├── DocumentManager.tsx
│   ├── SuperAdminDashboard.tsx
│   └── __tests__/       # Component tests
├── context/             # React Context (UserContext, ToastContext)
├── services/            # API calls and external integrations
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── schemas/             # Validation schemas (Yup)
├── constants/           # Design tokens and constants
└── main.tsx            # Entry point
```

### Key Components

- **Dashboard**: Main operational overview with expense summary
- **BillManager**: CRUD operations for bills with status tracking
- **LocationManager**: Manages operational locations
- **VendorManager**: Vendor information and categorization
- **CalendarView**: Payment date visualization
- **SuperAdminDashboard**: Tenant organization management
- **DocumentManager**: Document storage and retrieval

### State Management

- **UserContext**: Authentication and user session state
- **ToastContext**: Notification system
- Component-level state with React hooks

## Setup & Development

### Prerequisites

- Node 18+ 
- npm 9+
- Supabase account

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_db_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Development

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run tests
npm run test:ui  # Vitest UI
```

## Database Schema

Defined in `supabase_schema.sql`. Key tables:
- `users`: User authentication and metadata
- `bills`: Bill records with status tracking
- `vendors`: Vendor information
- `locations`: Operational locations
- `documents`: File storage metadata

## Code Quality

### Linting

ESLint configuration includes:
- React best practices (eslint-plugin-react-hooks)
- React Refresh support
- Strict TypeScript checking

```bash
npm run lint
```

### Testing

Vitest setup with React Testing Library. Tests located in `__tests__` directories adjacent to components.

```bash
npm test           # Run all tests
npm run test:ui    # Interactive UI
npm run test:coverage # Coverage report
```

### Type Safety

- TypeScript strict mode enabled
- Path aliases for cleaner imports (`@`, `@components`, `@services`, etc.)
- Type definitions in `src/types/`

## Build Optimization

### Code Splitting

Configured with manual chunks for vendors:
- `vendor-react`: React libraries
- `vendor-charts`: Recharts
- `vendor-supabase`: Supabase client
- `vendor-utils`: Utilities (date-fns, yup)
- `vendor`: Other node_modules

Individual chunk size warnings are suppressed (limit: 1000kb).

### Performance Tips

- Use dynamic imports for heavy components: `const Component = lazy(() => import('./Heavy'))`
- Memoize expensive computations: `useMemo`, `useCallback`
- Profile bundle size: `npm run build` shows gzip sizes

## Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel project settings
3. Deploy automatically on push to main

Rewrite configuration in `vercel.json` handles SPA routing.

### GitHub Actions

CI/CD pipeline (`/.github/workflows/ci.yml`) runs on push/PR:
- Linting check
- Production build
- Tests (when expanded)
- Artifacts upload

## Dependencies Management

### Core Dependencies

- `@supabase/supabase-js` — Database client
- `react`, `react-dom` — UI library
- `framer-motion` — Animations
- `recharts` — Data visualization
- `lucide-react` — Icons
- `date-fns` — Date manipulation
- `yup` — Schema validation

### Dev Dependencies

- `vite` — Build tool
- `vitest` — Test framework
- `@testing-library/react` — Component testing
- `eslint`, `@eslint/js` — Linting
- TypeScript types packages

Keep dependencies updated: `npm outdated` checks for updates. No outdated packages currently.

## Common Tasks

### Add a New Component

1. Create component file in `src/components/MyComponent.tsx`
2. Add corresponding test in `src/components/__tests__/MyComponent.test.tsx`
3. Export from component and use in App.tsx

### Connect to New Database Table

1. Define TypeScript types in `src/types/`
2. Create service file in `src/services/` with CRUD operations
3. Use service in component via `useEffect` and state

### Add Environment Variable

1. Add to `.env` and `.env.example`
2. Reference as `import.meta.env.VITE_*` in code
3. Restart dev server

## Debugging

### Console Logging

Keep logging minimal in production code. Use specific log messages.

### Supabase Queries

Test queries directly in Supabase SQL Editor or use Supabase Studio UI.

### React DevTools

Install React DevTools browser extension for component inspection and profiling.

## Security Considerations

- `.env` file is gitignored (never commit secrets)
- Supabase Row-Level Security (RLS) policies enforce data access
- VITE_* variables are exposed to client (safe for anon key)
- Service role key stays in backend only

## Future Improvements

- [ ] Add comprehensive test coverage (current: basic setup)
- [ ] Implement error boundary components
- [ ] Add Sentry for error tracking
- [ ] Optimize images and lazy load heavy components
- [ ] Add PWA capabilities
- [ ] Multi-tenant support enhancements
