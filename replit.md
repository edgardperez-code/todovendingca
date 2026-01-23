# Todo Vending CA

## Overview

A landing page and contact form for Todo Vending CA, a vending machine services company based in Lecheria, Anzoategui, Venezuela. The application showcases vending machine services including snacks, beverages, and coffee machines with features like free installation, maintenance, and restocking. The site is primarily in Spanish and serves as a marketing and lead generation platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **State Management**: TanStack React Query for server state
- **Animations**: Framer Motion for UI animations
- **Theme**: Custom light/dark theme support with CSS variables
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express 5 (ESM modules)
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Server**: HTTP server with Vite dev middleware in development, static file serving in production

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Current Storage**: In-memory storage (MemStorage class) for development
- **Database Ready**: Schema configured for PostgreSQL with Drizzle Kit migrations
- **Tables**: Users and ContactMessages defined in schema

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared (`shared/`) directories
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules
- **Schema Validation**: Zod schemas with drizzle-zod for form validation
- **Component Library**: shadcn/ui components in `client/src/components/ui/`

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: esbuild bundles server, Vite builds client to `dist/public`
- **Database Migrations**: `npm run db:push` using Drizzle Kit

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Drizzle Kit**: For schema migrations and database management

### UI Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **Lucide React**: Icon library
- **React Icons**: Additional icons (WhatsApp, Instagram)
- **Embla Carousel**: For carousel functionality
- **Vaul**: Drawer component

### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration for react-hook-form

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development banner