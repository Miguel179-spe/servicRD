# Servicios RD

A service listings marketplace for the Dominican Republic where users can browse, post, and manage service listings (electricians, plumbers, AC techs, etc.) with photo uploads, WhatsApp contact, category filtering, and user authentication.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Drizzle ORM + PostgreSQL
- Frontend: React 19 + Vite + Wouter + TanStack Query
- Auth: Replit Auth (OIDC/PKCE) via `@workspace/replit-auth-web`
- Storage: GCS object storage via `@workspace/object-storage-web`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- UI: shadcn/ui + Tailwind CSS v4 + Framer Motion

## Where things live

- `lib/db/src/schema/` — DB schema: `auth.ts` (sessions + users), `listings.ts`
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/` — Express API server
  - `routes/` — listings, categories, auth, storage, health
  - `middlewares/authMiddleware.ts` — session-based auth middleware
  - `lib/auth.ts` — OIDC session helpers
  - `lib/objectStorage.ts` — GCS presigned URL helpers
- `artifacts/servicios-rd/src/` — React frontend
  - `pages/` — home, listing-detail, post-listing, my-listings, edit-listing
  - `components/` — navbar, listing-card, gallery-modal, image-uploader

## Architecture decisions

- Contract-first API: OpenAPI spec defined first, then Orval generates React Query hooks and Zod schemas — no manual type duplication
- Auth via Replit OIDC with session cookies stored in PostgreSQL (sessions table)
- Images stored in GCS via presigned upload URLs — client uploads directly to GCS, server only issues the URL
- Object paths stored as full `/api/storage/objects/{path}` URLs in DB for direct `<img src>` use
- Dark-first design (navy/indigo palette) — no light mode toggle needed for MVP
- Categories are hardcoded in the API (no DB table needed — they don't change dynamically)

## Product

- **Browse listings**: Home page with category sidebar + search — filter by category or keyword
- **Listing detail**: Full page with cover image, gallery, description, contact info, and WhatsApp CTA
- **Post a service**: Auth-gated form with photo upload (cover + gallery up to 8 images)
- **My listings**: Manage your own published services (edit, delete)
- **WhatsApp contact**: Direct link to contact service providers via WhatsApp

## User preferences

- Spanish UI (Dominican Republic market)
- Dark navy/indigo color theme

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` before editing frontend
- `pnpm --filter @workspace/db run push` must be run after changing DB schema files
- Root `pnpm overrides` set `react` and `react-dom` to `19.1.0` (required for Uppy v5 compat)
- Object storage routes: `POST /api/storage/uploads/request-url` → get presigned URL, then PUT file directly to GCS

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
