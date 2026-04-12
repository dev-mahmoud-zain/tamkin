# Technology Stack

## Backend (tamkin-backend)

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js
- **Database**: PostgreSQL (via TypeORM 0.3.x)
- **Testing**: Jest 30.x with Supertest for e2e tests
- **Code Quality**: ESLint, Prettier

### Backend Commands

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debug mode

# Building
npm run build              # Compile TypeScript to dist/

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier

# Production
npm run start:prod         # Run compiled production build
```

## Frontend (tamkin-frontend)

- **Framework**: Next.js 16.x (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.x
- **Styling**: Tailwind CSS 4.x
- **Code Quality**: ESLint with Next.js config

### Frontend Commands

```bash
# Development
npm run dev                # Start development server

# Building
npm run build              # Build for production

# Production
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
```

## Infrastructure

- **Reverse Proxy**: Nginx (Alpine)
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 16 Alpine

### Nginx Configuration

- Frontend served at root path `/`
- Backend API proxied at `/api`
- Health check endpoint at `/health`
- WebSocket support enabled
- Proper headers for proxying (X-Real-IP, X-Forwarded-For, etc.)

### Docker Commands

```bash
# Local Development Environment
docker-compose up -d
docker-compose down

# Production Environment
docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down

# Test Environment
docker-compose --env-file .env.test -f docker-compose.test.yml up -d
docker-compose -f docker-compose.test.yml down
```

### Environment Ports

**Local:**

- Nginx (Main Entry): http://localhost:3080
- PostgreSQL: localhost:5434

**Production:**

- Nginx (Main Entry): http://localhost:8080
- PostgreSQL: localhost:5433

**Test:**

- Nginx (Main Entry): http://localhost:8000
- PostgreSQL: localhost:5432

Note: Nginx acts as a reverse proxy. Frontend is served at `/` and backend API at `/api`.

## Code Style

### Backend Prettier Config

- Single quotes
- Trailing commas (all)

### TypeScript Configuration

- Backend: ES2023 target, NodeNext modules, decorators enabled
- Frontend: ES2017 target, strict mode, Next.js plugins
- Both use path aliases and skip lib checks
