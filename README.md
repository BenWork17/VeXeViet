# VeXeViet Platform

Vietnamese bus ticket booking platform - Monorepo

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS + Shadcn/ui
- **Testing:** Vitest, Playwright

## Project Structure

```
vexeviet-platform/
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configurations
├── docs/                 # Documentation
└── infrastructure/       # Docker & DevOps configs
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker Desktop

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

### Docker Development

```bash
# Start all services
make dev-up

# Stop all services
make dev-down

# View logs
make logs
```

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all workspaces
- `pnpm test` - Run all tests
- `pnpm format` - Format code with Prettier

## Documentation

See [docs/](./docs) folder for detailed documentation.

## Current Phase

**PI 1 - Iteration 1-1:** Foundation & Infrastructure Setup

## License

Proprietary - VeXeViet Platform