# AGENTS.md - Development Guide

## Commands

### Backend (`backend/`)
```bash
npm run dev          # Start in development mode (watch)
npm run start        # Production build
npm run build        # Compile to dist/
npm run lint         # ESLint (0 errors, warnings only)
npm test             # Jest unit tests
npm run test:e2e     # End-to-end tests
npx tsc --noEmit     # Type-check only
npx prisma generate  # Generate Prisma client
npx prisma studio    # Database GUI
npm run prisma:seed  # Seed database
```

### Frontend (`frontend/`)
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (clean)
npx tsc --noEmit     # Type-check only
```

### Infrastructure
```bash
docker-compose up -d   # Start PostgreSQL + Redis
docker-compose down    # Stop services
docker-compose --build # Rebuild images
```

## Environment Setup

### Required Environment Variables

**Backend (`.env`):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mv_ecommerce"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
STRIPE_SECRET_KEY="sk_test_..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

## Coding Standards

- **TypeScript** strict mode enabled
- **ESLint** with Prettier formatting
- **NestJS** controllers → services → repositories pattern
- **Next.js** App Router convention with `layout.tsx` files
- UI components in `frontend/components/ui/` follow Shadcn pattern
- All API routes prefixed with `/api` (backend) or proxied via Next.js
- Swagger documentation at `http://localhost:4000/api/docs`

## Lint Notes

| Project | Errors | Warnings |
|---------|--------|----------|
| Backend | 0      | 38 (unused vars, require imports) |
| Frontend | 0     | 0        |

The backend's ESLint config uses `warn` for unused variables and require imports to accommodate the partially scaffolded codebase. Fix these when implementing the affected modules.
