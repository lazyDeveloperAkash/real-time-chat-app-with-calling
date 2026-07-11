# Technology Choices — Why We Chose What We Chose

> A comprehensive breakdown of every technology in our stack, why we picked it, and what we considered as alternatives. Written for developers who want to understand the reasoning behind each decision.

---

## Table of Contents

- [Language: TypeScript](#language-typescript)
- [Frontend Framework: Next.js](#frontend-framework-nextjs)
- [UI Component Library: shadcn/ui](#ui-component-library-shadcnui)
- [Icon Library: Lucide React](#icon-library-lucide-react)
- [State Management: Zustand + TanStack Query](#state-management-zustand--tanstack-query)
- [Form Handling & Validation: React Hook Form + Zod](#form-handling--validation-react-hook-form--zod)
- [Styling: Tailwind CSS](#styling-tailwind-css)
- [Backend Framework: Express.js](#backend-framework-expressjs)
- [Database: PostgreSQL](#database-postgresql)
- [ORM: Prisma](#orm-prisma)
- [Real-Time: Socket.IO](#real-time-socketio)
- [Caching & Pub/Sub: Redis](#caching--pubsub-redis)
- [Authentication: JWT (Access + Refresh Tokens)](#authentication-jwt-access--refresh-tokens)
- [Image Storage: ImageKit](#image-storage-imagekit)
- [Email: Nodemailer](#email-nodemailer)
- [Toast/Notifications: Sonner](#toastnotifications-sonner)
- [WebRTC: Native Browser API](#webrtc-native-browser-api)

---

## Language: TypeScript

### Chosen: TypeScript
### Considered: JavaScript (current), Flow

| Criteria | TypeScript | JavaScript | Flow |
|----------|-----------|------------|------|
| Type Safety | ✅ Full compile-time checking | ❌ Runtime errors only | ⚠️ Gradual typing |
| IDE Support | ✅ Best-in-class autocomplete, refactoring | ⚠️ Limited inference | ⚠️ Requires plugins |
| Ecosystem | ✅ 95%+ npm packages have types | ✅ Universal | ❌ Declining ecosystem |
| Learning Curve | ⚠️ Slight overhead | ✅ None | ⚠️ Moderate |
| Community | ✅ Industry standard (2024+) | ✅ Universal | ❌ Meta-internal mostly |
| Refactoring Safety | ✅ Compiler catches breaking changes | ❌ Manual verification | ⚠️ Partial |

**Why TypeScript wins:**
- At **million-user scale**, runtime type errors become exponentially costly. TypeScript catches them at build time.
- Our codebase already has bugs from implicit type coercion (inverted boolean checks in controllers, undefined variable references). TypeScript would have caught every single one.
- Shared types between frontend and backend (Zod schemas, Socket event types) eliminate an entire class of API contract bugs.
- Every major company (Google, Microsoft, Airbnb, Stripe) has migrated to TypeScript for production codebases.

---

## Frontend Framework: Next.js

### Chosen: Next.js (App Router)
### Considered: Vite + React, Remix, Create React App

| Criteria | Next.js | Vite + React | Remix | CRA |
|----------|---------|-------------|-------|-----|
| SSR/SSG | ✅ Built-in | ❌ Requires setup | ✅ Built-in | ❌ None |
| File-based Routing | ✅ App Router | ❌ Manual (react-router) | ✅ File-based | ❌ Manual |
| Image Optimization | ✅ next/image | ❌ Manual | ❌ Manual | ❌ Manual |
| SEO | ✅ Metadata API | ⚠️ React Helmet | ✅ Meta exports | ❌ Poor |
| Deployment | ✅ Vercel, self-host | ✅ Any static host | ✅ Various | ✅ Any static host |
| Bundle Size | ✅ Automatic code splitting | ✅ Tree-shaking | ✅ Route-based splitting | ❌ Large bundles |
| Learning Curve | ⚠️ Moderate (App Router) | ✅ Simple | ⚠️ Moderate | ✅ Simple |

**Why Next.js wins:**
- We're already on Next.js, so **zero migration cost** for the framework itself.
- **Route Groups** `(auth)` and `(dashboard)` organize our app perfectly — auth pages vs protected dashboard.
- **Server Components** for the layout and initial data fetch reduce client-side JavaScript.
- **Middleware** for auth guards before routes even render.
- **Incremental Static Regeneration** for content that rarely changes (user profiles, group info).
- **Why not Vite?** Vite is excellent for SPAs, but we benefit from Next.js's server-side capabilities, especially for SEO on public pages and initial page load performance.

---

## UI Component Library: shadcn/ui

### Chosen: shadcn/ui
### Considered: Material UI (MUI), Ant Design, Chakra UI, Headless UI, Radix UI (raw), Mantine

| Criteria | shadcn/ui | MUI | Ant Design | Chakra UI | Mantine |
|----------|----------|-----|------------|-----------|---------|
| Customizability | ✅ Own the code | ⚠️ Theme overrides | ⚠️ Less tokens | ⚠️ Theme-based | ⚠️ Props-based |
| Bundle Size | ✅ Copy what you need | ❌ Heavy (~300KB) | ❌ Very heavy | ⚠️ Moderate | ⚠️ Moderate |
| Tailwind Compatible | ✅ Built for Tailwind | ❌ CSS-in-JS (Emotion) | ❌ Less/CSS Modules | ❌ CSS-in-JS | ❌ CSS Modules |
| Accessibility | ✅ Radix primitives | ✅ Good | ⚠️ Moderate | ✅ Good | ✅ Good |
| Design Quality | ✅ Modern, clean | ⚠️ Google Material (dated) | ⚠️ Enterprise-style | ✅ Clean | ✅ Modern |
| Vendor Lock-in | ✅ None (you own the code) | ⚠️ Tied to MUI | ⚠️ Tied to Ant | ⚠️ Tied to Chakra | ⚠️ Tied to Mantine |
| TypeScript | ✅ First-class | ✅ Good | ✅ Good | ✅ Good | ✅ Good |

**Why shadcn/ui wins:**
- **You own the code.** Components are copied into your project, not installed from `node_modules`. You can modify any component without fighting the library.
- **Built on Radix UI primitives** — the gold standard for accessible, unstyled components. We get WAI-ARIA compliance for free.
- **Tailwind CSS native** — works perfectly with our existing Tailwind setup. No CSS-in-JS runtime overhead.
- **Zero bundle bloat** — only include components you actually use. MUI adds ~300KB even if you use one button.
- **Beautiful defaults** — the components look modern and professional out of the box, and the dark theme is excellent for a chat app.
- **Form integration** — first-class support for React Hook Form + Zod validation (exactly what we need).

---

## Icon Library: Lucide React

### Chosen: Lucide React
### Considered: react-icons (current), Heroicons, Phosphor Icons, Tabler Icons, Font Awesome

| Criteria | Lucide React | react-icons | Heroicons | Font Awesome |
|----------|-------------|-------------|-----------|--------------|
| Tree-shaking | ✅ Per-icon imports | ⚠️ Imports entire icon set | ✅ Per-icon | ❌ Full font file |
| Bundle Impact | ✅ ~1KB per icon | ❌ Can be 500KB+ | ✅ Small | ❌ 200KB+ font |
| Icon Count | ✅ 1400+ icons | ✅ 40,000+ (many sets) | ⚠️ ~300 icons | ✅ 2000+ |
| shadcn Integration | ✅ Default for shadcn/ui | ❌ Not integrated | ⚠️ Manual | ❌ Not integrated |
| Consistency | ✅ Uniform 24px design | ❌ Mixed styles | ✅ Consistent | ⚠️ Multiple styles |
| Customization | ✅ SVG props (size, color, stroke) | ⚠️ Limited | ✅ SVG props | ⚠️ Limited |

**Why Lucide wins:**
- **Official icon library for shadcn/ui** — components are designed to work with Lucide sizing and stroke width.
- **Tree-shakeable** — `import { Send } from 'lucide-react'` imports only that one icon (~1KB). Our current `react-icons` setup can accidentally import entire icon packs.
- **Consistent design language** — all icons follow the same 24×24 grid with 2px stroke width. `react-icons` mixes icons from 5+ different design systems (Io, Fa, Ci, Md) creating visual inconsistency.
- Every icon is an SVG component with full props support (`size`, `color`, `strokeWidth`, `className`).

---

## State Management: Zustand + TanStack Query

### Chosen: Zustand (client state) + TanStack Query (server state)
### Considered: Redux Toolkit, React Context (current), Jotai, Recoil, SWR

| Criteria | Zustand + TanStack Query | Redux Toolkit + RTK Query | React Context | Jotai |
|----------|-------------------------|--------------------------|---------------|-------|
| Boilerplate | ✅ Minimal | ❌ Slices, actions, reducers | ✅ Minimal | ✅ Minimal |
| Server State | ✅ TanStack Query (best-in-class) | ⚠️ RTK Query (good) | ❌ Manual fetching | ❌ Manual |
| Caching | ✅ Auto caching + stale-while-revalidate | ✅ RTK Query cache | ❌ None | ❌ None |
| Optimistic Updates | ✅ Built-in | ✅ Built-in | ❌ Manual | ❌ Manual |
| Bundle Size | ✅ ~2KB + ~13KB | ❌ ~40KB+ | ✅ 0KB (built-in) | ✅ ~3KB |
| DevTools | ✅ Both have devtools | ✅ Redux DevTools | ❌ None | ⚠️ Jotai DevTools |
| Re-render Performance | ✅ Selector-based subscriptions | ✅ Selector-based | ❌ All consumers re-render | ✅ Atomic |
| Works Outside React | ✅ Zustand works anywhere | ⚠️ Requires store access | ❌ React only | ❌ React only |
| TypeScript | ✅ Excellent | ✅ Good | ⚠️ Manual typing | ✅ Good |
| Learning Curve | ✅ Very low | ⚠️ Moderate | ✅ Low | ✅ Low |

**Why this combination wins:**

**Zustand for Client State:**
- Our current Context provider has **20+ functions** crammed into one provider, causing every component to re-render on any state change. Zustand uses **selector-based subscriptions** — components only re-render when the specific slice they use changes.
- **Works outside React** — perfect for updating state from Socket.IO event handlers (which run outside the React tree).
- **3KB gzipped** — vs Redux Toolkit's 40KB+. For a chat app where every KB matters for initial load.
- `const activeChat = useChatStore(state => state.activeChat)` — no providers, no reducers, no actions. Just a hook.

**TanStack Query for Server State:**
- Our current code manually manages loading states, error states, and data fetching in every single function (23 async functions in UserProvider). TanStack Query handles all of this automatically.
- **Automatic caching** — fetch message history once, serve from cache on subsequent visits. Reduces API calls by 80%+.
- **Background refetching** — stale data is shown instantly while fresh data loads in the background.
- **Optimistic updates** — when a user sends a message, it appears instantly (before the server confirms). If the server fails, it rolls back automatically.
- **Infinite queries** — perfect for loading message history with "load more" pagination.
- **Mutation retries** — if a message send fails due to a network glitch, TanStack Query retries automatically.

**Why not Redux?**
- Redux is excellent for complex, highly interconnected state (think Figma, Spotify). For a chat app, the state is clearly separable into "server data" (TanStack Query) and "UI state" (Zustand). Redux adds unnecessary complexity.
- The current codebase imports `react-redux` but doesn't even use it — it was likely tried and abandoned in favor of Context.

---

## Form Handling & Validation: React Hook Form + Zod

### Chosen: React Hook Form + Zod (via @hookform/resolvers)
### Considered: Formik + Yup, native HTML validation, Vest, Valibot

| Criteria | React Hook Form + Zod | Formik + Yup | Native HTML | Valibot |
|----------|----------------------|-------------|-------------|---------|
| Performance | ✅ Uncontrolled (minimal re-renders) | ❌ Controlled (re-renders on every keystroke) | ✅ No re-renders | ✅ Depends on form lib |
| Bundle Size | ✅ ~9KB + ~13KB | ❌ ~44KB + ~23KB | ✅ 0KB | ✅ ~6KB |
| TypeScript Inference | ✅ Full type inference from schema | ⚠️ Manual types | ❌ None | ✅ Good |
| Shared Schemas (FE+BE) | ✅ Same Zod schema works on Express | ⚠️ Yup is frontend-focused | ❌ N/A | ⚠️ Newer ecosystem |
| shadcn Integration | ✅ Built-in `<Form>` component | ❌ Custom wrapper | ❌ N/A | ❌ Manual |
| Validation UX | ✅ Live, on-blur, on-submit modes | ✅ Similar | ⚠️ Browser-dependent | ✅ Similar |

**Why this combination wins:**
- **Zod schemas are shared between frontend and backend.** Define `signupSchema` once in `packages/shared/`, use it for form validation on the client AND request validation on the server. Single source of truth.
- **React Hook Form uses uncontrolled components** — the form doesn't re-render on every keystroke. In our current code, every `onChange` triggers a state update that re-renders the entire form. With RHF, only the submitted values cause renders.
- **shadcn/ui's `<Form>` component** is built specifically for React Hook Form + Zod. It renders validation errors inline with beautiful styling out of the box.
- **Zod over Yup:** Zod is TypeScript-first with full type inference. `z.infer<typeof schema>` gives you the TypeScript type automatically. Yup was designed for JavaScript and TypeScript support was added later.

---

## Styling: Tailwind CSS

### Chosen: Tailwind CSS (keeping current)
### Considered: Vanilla CSS, CSS Modules, styled-components, Emotion

| Criteria | Tailwind CSS | Vanilla CSS | CSS Modules | styled-components |
|----------|-------------|------------|------------|-------------------|
| Development Speed | ✅ Very fast | ⚠️ Slower | ⚠️ Moderate | ⚠️ Moderate |
| Bundle Size | ✅ Purged (only used classes) | ⚠️ Can grow | ✅ Scoped | ❌ Runtime overhead |
| shadcn Compatibility | ✅ Required by shadcn/ui | ❌ Different approach | ❌ Different approach | ❌ Different approach |
| Consistency | ✅ Design tokens built-in | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| Dark Mode | ✅ `dark:` prefix | ⚠️ Manual media queries | ⚠️ Manual | ⚠️ Manual |
| Responsive | ✅ `md:`, `lg:` prefixes | ⚠️ Manual media queries | ⚠️ Manual | ⚠️ Manual |

**Why Tailwind stays:**
- Already in use, and **shadcn/ui requires it**. No reason to change.
- We'll upgrade Tailwind config to include shadcn's CSS variables for theming (dark mode, custom colors).
- `tailwind-merge` will be added to handle class conflicts when composing components.

---

## Backend Framework: Express.js

### Chosen: Express.js (keeping current)
### Considered: Fastify, NestJS, Hono, Koa

| Criteria | Express.js | Fastify | NestJS | Hono |
|----------|-----------|---------|--------|------|
| Ecosystem | ✅ Largest (10,000+ middleware packages) | ⚠️ Growing | ✅ Large | ⚠️ Newer |
| Performance | ⚠️ Moderate | ✅ 2x faster | ⚠️ Overhead from decorators | ✅ Very fast |
| Socket.IO Support | ✅ First-class | ✅ Plugin | ✅ Gateway | ⚠️ Manual |
| Learning Curve | ✅ Beginner-friendly | ✅ Similar to Express | ❌ Complex (Angular-like) | ✅ Simple |
| TypeScript | ⚠️ @types/express | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Maturity | ✅ 14+ years | ✅ 8+ years | ✅ 7+ years | ⚠️ 3 years |

**Why Express stays:**
- **Beginner-friendly** — this is meant to be a learning project. Express's simplicity makes the architecture learnable.
- **Socket.IO integration** is trivial with Express — they share the same HTTP server.
- **Every tutorial, guide, and Stack Overflow answer** is Express-first. Debugging is easier.
- With TypeScript + proper middleware patterns, Express is perfectly capable at scale. Netflix, PayPal, and Uber use it.
- **Why not NestJS?** NestJS adds Angular-like decorators, dependency injection, and modules. For a beginner-friendly project, this adds too much complexity without proportional benefit.
- **Why not Fastify?** Fastify is faster, but our bottleneck will be database queries and WebSocket handling, not HTTP request parsing. The 2x throughput difference is irrelevant when 90% of time is spent in I/O.

---

## Database: PostgreSQL

### Chosen: PostgreSQL
### Considered: MongoDB (current), MySQL, CockroachDB, Cassandra, ScyllaDB

| Criteria | PostgreSQL | MongoDB | MySQL | Cassandra |
|----------|-----------|---------|-------|-----------|
| Data Integrity | ✅ ACID, FK constraints | ⚠️ No foreign keys | ✅ ACID | ⚠️ Eventual consistency |
| Relational Queries | ✅ JOINs, CTEs, window functions | ❌ $lookup (slow) | ✅ JOINs | ❌ Denormalized |
| Schema Validation | ✅ Strong schemas | ⚠️ Optional validation | ✅ Strong schemas | ✅ Schemas |
| JSON Support | ✅ JSONB (indexed) | ✅ Native | ⚠️ JSON type | ❌ Limited |
| Full-Text Search | ✅ Built-in (tsvector) | ✅ Atlas Search | ⚠️ Basic | ❌ Not built-in |
| Scaling | ✅ Read replicas, partitioning | ✅ Sharding | ✅ Read replicas | ✅ Distributed |
| Message Partitioning | ✅ Table partitioning by date | ⚠️ Sharding by collection | ⚠️ Partitioning | ✅ Native |
| Cost at Scale | ✅ Free (open source) | ⚠️ Atlas pricing | ✅ Free | ✅ Free |

**Why PostgreSQL wins:**
- **Chat apps are inherently relational.** Users have friends. Messages have senders and receivers. Groups have members. These relationships are best expressed with foreign keys and JOINs, not MongoDB's `$lookup` aggregation (which is slow and doesn't enforce referential integrity).
- **ACID transactions** — when a user sends a message, we need to: (1) create the message, (2) update the conversation's last message, (3) update unread counts. This must be atomic. PostgreSQL guarantees this; MongoDB doesn't without explicit transactions.
- **Our current MongoDB issues:**
  - No foreign key constraints — orphaned messages when users are deleted
  - `$lookup` for chat queries is 10x slower than PostgreSQL JOINs
  - Schema-less nature led to inconsistent data (some users have `friend`, others have `friends`)
- **At billions of messages scale:** PostgreSQL table partitioning by `created_at` month keeps queries fast. Each partition is its own table that can be independently indexed, vacuumed, or archived.

**Why not Cassandra?**
- The image suggests "PostgreSQL + NoSQL/Cassandra." Cassandra is designed for massive write-heavy workloads with eventual consistency. For our scale (millions of users, not billions), PostgreSQL with proper indexing and partitioning handles billions of messages efficiently. Cassandra adds operational complexity (managing a cluster, data modeling with denormalization) that isn't justified until you're at Discord/WhatsApp scale (billions of messages per day).

---

## ORM: Prisma

### Chosen: Prisma
### Considered: Drizzle ORM, TypeORM, Knex.js, Sequelize, raw SQL

| Criteria | Prisma | Drizzle ORM | TypeORM | Knex.js | Sequelize |
|----------|--------|------------|---------|---------|-----------|
| Type Safety | ✅ Auto-generated types | ✅ Schema-defined types | ⚠️ Decorators | ❌ Manual | ❌ Manual |
| DX (Developer Experience) | ✅ Best-in-class | ✅ Very good | ⚠️ Complex | ⚠️ SQL-like | ⚠️ Verbose |
| Migrations | ✅ Auto-generated | ✅ Push + generate | ✅ Auto-generated | ⚠️ Manual | ✅ Auto-generated |
| Query Builder | ✅ Intuitive API | ✅ SQL-like API | ⚠️ QueryBuilder pattern | ✅ SQL-like | ⚠️ ORM pattern |
| Relations | ✅ Declarative in schema | ✅ Schema-defined | ✅ Decorator-based | ❌ Manual JOINs | ✅ Model-defined |
| Prisma Studio | ✅ Visual DB browser | ❌ None | ❌ None | ❌ None | ❌ None |
| Edge Runtime | ⚠️ Prisma Accelerate | ✅ Works in edge | ❌ No | ❌ No | ❌ No |
| Learning Curve | ✅ Very low | ⚠️ Moderate (SQL knowledge needed) | ❌ Complex | ⚠️ SQL knowledge | ⚠️ Moderate |

**Why Prisma wins:**
- **Auto-generated TypeScript types** from the schema. Change the schema, run `prisma generate`, and every query in your codebase gets updated types. No manual `interface` definitions.
- **Beginner-friendly.** `prisma.user.findMany({ include: { friends: true } })` is readable English. Drizzle's `db.select().from(users).leftJoin(...)` requires SQL knowledge.
- **Prisma Migrate** auto-generates SQL migrations from schema changes. You modify `schema.prisma`, run `prisma migrate dev`, and it creates the migration file automatically.
- **Prisma Studio** — visual database browser for debugging. Run `npx prisma studio` and browse your data in a web UI.
- **Why not Drizzle?** Drizzle is faster and lighter, but Prisma's DX is significantly better for a beginner-friendly project. Drizzle requires you to think in SQL; Prisma abstracts it away. At our scale, the performance difference is negligible (both generate optimized SQL).

---

## Real-Time: Socket.IO

### Chosen: Socket.IO (keeping current)
### Considered: ws (raw WebSockets), Ably, Pusher, Server-Sent Events (SSE), GraphQL Subscriptions

| Criteria | Socket.IO | ws (raw) | Ably/Pusher | SSE |
|----------|----------|---------|-------------|-----|
| Auto Reconnection | ✅ Built-in | ❌ Manual | ✅ Built-in | ❌ Manual |
| Rooms/Namespaces | ✅ Built-in | ❌ Manual | ✅ Channels | ❌ N/A |
| Fallback Transport | ✅ HTTP long-polling fallback | ❌ WebSocket only | ✅ Various | ✅ HTTP |
| Binary Data | ✅ Supported | ✅ Native | ✅ Supported | ❌ Text only |
| Redis Adapter | ✅ Official adapter | ❌ Manual | N/A (hosted) | ❌ Manual |
| Scaling | ✅ Redis Pub/Sub adapter | ❌ Build your own | ✅ Managed | ⚠️ Limited |
| TypeScript | ✅ Generic events | ✅ Basic types | ✅ SDKs | ✅ Basic |
| Cost | ✅ Free (self-hosted) | ✅ Free | ❌ $$$$ at scale | ✅ Free |

**Why Socket.IO stays:**
- **Already in use** — minimal migration effort. Just add TypeScript types.
- **`@socket.io/redis-adapter`** provides horizontal scaling out of the box. Plug in Redis, and Socket.IO handles cross-server message routing automatically.
- **Rooms** are perfect for group chats — `socket.join(groupId)` and `io.to(groupId).emit(...)`.
- **Auto-reconnection with exponential backoff** — critical for mobile users with flaky connections.
- **Why not raw WebSockets?** Raw `ws` gives you a pipe. You'd need to build reconnection, rooms, namespaces, acknowledgements, binary encoding, and heartbeats yourself. Socket.IO gives all of this for free.
- **Why not Ably/Pusher?** At million-user scale, hosted services become extremely expensive ($1000+/month). Self-hosted Socket.IO + Redis costs the price of your servers.

---

## Caching & Pub/Sub: Redis

### Chosen: Redis (ioredis client)
### Considered: Memcached, KeyDB, Valkey, in-memory (current)

| Criteria | Redis | Memcached | In-Memory (Map) |
|----------|-------|-----------|----------------|
| Pub/Sub | ✅ Built-in | ❌ Not available | ❌ Single process |
| Data Structures | ✅ Strings, Lists, Sets, Sorted Sets, Hashes | ❌ Key-Value only | ✅ JS objects |
| Persistence | ✅ RDB + AOF | ❌ Volatile only | ❌ Lost on restart |
| Clustering | ✅ Redis Cluster | ✅ Memcached pool | ❌ Single process |
| Multi-server | ✅ Shared state | ✅ Shared cache | ❌ Process-local |
| Socket.IO Adapter | ✅ Official support | ❌ None | ❌ Default adapter |

**Why Redis wins:**
- **The current app stores online users in an in-memory `Map()`**. This means:
  - If the server restarts, all online status is lost
  - If you run 2+ servers, each has its own Map — users appear offline to servers they're not connected to
  - There's no way to queue offline messages
- Redis solves all three problems:
  - **Persistence** — online status survives restarts
  - **Shared state** — all servers read/write the same Redis instance
  - **Pub/Sub** — Socket.IO's Redis adapter routes messages between servers
  - **Lists** — perfect for offline message queues (`RPUSH`, `LRANGE`, `DEL`)
  - **Sets** — perfect for online user tracking (`SADD`, `SREM`, `SISMEMBER`)

---

## Authentication: JWT (Access + Refresh Tokens)

### Chosen: Custom JWT (keeping current pattern, improved)
### Considered: NextAuth.js (Auth.js), Clerk, Supabase Auth, Passport.js, session-based auth

| Criteria | Custom JWT | NextAuth.js | Clerk | Session-based |
|----------|-----------|-------------|-------|--------------|
| Control | ✅ Full control | ⚠️ Opinionated | ⚠️ Hosted | ✅ Full control |
| WebSocket Auth | ✅ Token in handshake | ⚠️ Session-based | ⚠️ Requires proxy | ⚠️ Cookie-based |
| Stateless | ✅ No server-side session store | ⚠️ DB sessions | N/A | ❌ Server-side store |
| Learning Value | ✅ Understand auth deeply | ⚠️ Abstracted | ⚠️ Abstracted | ✅ Understand auth |
| Multi-device | ✅ Each device gets own tokens | ⚠️ Session per device | ✅ Built-in | ⚠️ Session per device |
| Cost | ✅ Free | ✅ Free | ❌ $25+/mo | ✅ Free |

**Why custom JWT stays:**
- **WebSocket authentication** requires sending a token in the Socket.IO handshake. JWT is perfect for this — stateless, verifiable, and doesn't require a database lookup on every connection.
- **Learning value** — this is a beginner-friendly project. Understanding JWT, refresh tokens, and token rotation is a fundamental skill.
- **The current implementation is already solid** (access + refresh token pattern with cookie storage). We just need to add TypeScript types and fix the token expiry parsing.
- **Improvement:** We'll add token rotation (each refresh generates a new refresh token), token family tracking, and proper `httpOnly` + `secure` + `sameSite` cookie settings.

---

## Image Storage: ImageKit

### Chosen: ImageKit (keeping current)
### Considered: Cloudinary, AWS S3 + CloudFront, UploadThing, Supabase Storage

| Criteria | ImageKit | Cloudinary | AWS S3 | UploadThing |
|----------|---------|-----------|--------|-------------|
| Image Optimization | ✅ On-the-fly URL transforms | ✅ URL transforms | ❌ Manual | ⚠️ Basic |
| CDN | ✅ Global CDN built-in | ✅ CDN built-in | ⚠️ CloudFront (separate) | ✅ Built-in |
| Presigned URLs | ✅ Client-side upload | ✅ Client-side upload | ✅ Presigned URLs | ✅ Direct upload |
| Free Tier | ✅ 20GB bandwidth/month | ⚠️ 25 credits/month | ⚠️ 5GB storage | ✅ 2GB |
| Price at Scale | ✅ Affordable | ⚠️ Expensive at scale | ✅ Very cheap | ⚠️ Moderate |
| React SDK | ✅ Official SDK | ✅ Official SDK | ⚠️ Generic AWS SDK | ✅ React hooks |

**Why ImageKit stays:**
- Already integrated and working. Migration would add risk with zero feature benefit.
- **Improvement:** Switch from server-side upload (current: file → Express → ImageKit) to **client-side presigned URL upload** (client → ImageKit directly). This removes the file from server memory, enables larger uploads, and is the recommended pattern for scale.
- ImageKit's URL-based transformations (`?tr=w-100,h-100`) for thumbnails in the chat list, full-size in the viewer. No need to store multiple sizes.

---

## Email: Nodemailer

### Chosen: Nodemailer (keeping current)
### Considered: Resend, SendGrid, AWS SES, Postmark

| Criteria | Nodemailer | Resend | SendGrid | AWS SES |
|----------|-----------|--------|----------|---------|
| Cost | ✅ Free (use Gmail SMTP) | ✅ 100/day free | ⚠️ 100/day free | ✅ Very cheap |
| Setup | ✅ Simple | ✅ Very simple | ⚠️ Dashboard config | ⚠️ AWS setup |
| Deliverability | ⚠️ Gmail limits | ✅ High | ✅ High | ✅ High |
| Templates | ❌ Manual HTML | ✅ React Email | ✅ Templates | ⚠️ SES templates |

**Why Nodemailer stays:**
- Already working for OTP emails. For a beginner project, the simplicity is valuable.
- **Recommendation for production:** When scaling beyond 500 emails/day, switch to **Resend** (by the creator of React Email). It has a beautiful API, React-based email templates, and doesn't require SMTP configuration.

---

## Toast/Notifications: Sonner

### Chosen: Sonner (via shadcn/ui)
### Considered: react-toastify (current), react-hot-toast, shadcn's built-in toast

| Criteria | Sonner | react-toastify | react-hot-toast |
|----------|--------|---------------|----------------|
| Bundle Size | ✅ ~5KB | ⚠️ ~18KB | ✅ ~5KB |
| Design | ✅ Beautiful, modern | ⚠️ Dated look | ✅ Clean |
| shadcn Integration | ✅ Official component | ❌ Separate | ❌ Separate |
| Animation | ✅ Smooth, springy | ⚠️ Basic slide | ✅ Smooth |
| Stacking | ✅ Visual stacking | ⚠️ List stacking | ✅ Visual stacking |
| Promise toasts | ✅ Built-in | ⚠️ Manual | ✅ Built-in |

**Why Sonner wins:**
- **shadcn/ui's recommended toast solution.** The `<Sonner>` component is a pre-configured wrapper available via `npx shadcn@latest add sonner`.
- **Promise-based toasts** — `toast.promise(sendMessage(), { loading: 'Sending...', success: 'Sent!', error: 'Failed' })`. Perfect for async operations.
- Visually superior to react-toastify with smaller bundle size.

---

## WebRTC: Native Browser API

### Chosen: Native RTCPeerConnection
### Considered: PeerJS (current/attempted), simple-peer, LiveKit, Agora

| Criteria | Native WebRTC | PeerJS | LiveKit | Agora |
|----------|-------------|--------|---------|-------|
| Control | ✅ Full control | ⚠️ Abstracted | ⚠️ SDK-based | ⚠️ SDK-based |
| Signaling | ✅ Custom (Socket.IO) | ✅ PeerServer | ✅ Built-in | ✅ Built-in |
| Cost | ✅ Free | ✅ Free | ⚠️ Self-host or paid | ❌ $$$$ |
| Learning Value | ✅ Learn WebRTC deeply | ⚠️ Abstracted | ⚠️ Abstracted | ⚠️ Abstracted |
| Group Calls | ⚠️ SFU needed at scale | ❌ Mesh only | ✅ SFU built-in | ✅ SFU built-in |
| Bundle Size | ✅ Browser-native (0KB) | ⚠️ ~50KB | ❌ ~200KB | ❌ ~300KB |

**Why Native WebRTC wins:**
- **Zero additional dependencies** — `RTCPeerConnection` is a browser API.
- **Socket.IO as signaling server** — we already have the WebSocket infrastructure. WebRTC signaling (SDP exchange, ICE candidates) just needs a message relay, which Socket.IO provides.
- **Learning value** — understanding WebRTC (ICE, STUN/TURN, SDP, media tracks) is invaluable.
- **The current PeerJS code is broken** — it mixes PeerJS and native WebRTC APIs incorrectly. A clean native implementation will be more maintainable.
- **STUN/TURN servers:** We'll use Google's free STUN server (`stun:stun.l.google.com:19302`) for NAT traversal. For production, a TURN server (like `coturn`) handles restrictive firewalls.

---

## Summary: The Complete Stack

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                        │
│                                                  │
│  Next.js 14/15 (TypeScript)                      │
│  ├── shadcn/ui + Lucide React (UI)               │
│  ├── Tailwind CSS (Styling)                      │
│  ├── Zustand (Client State)                      │
│  ├── TanStack Query (Server State)               │
│  ├── React Hook Form + Zod (Forms)               │
│  ├── Socket.IO Client (Real-time)                │
│  └── Native WebRTC (Calls)                       │
│                                                  │
├─────────────────────────────────────────────────┤
│                    SERVER                        │
│                                                  │
│  Express.js (TypeScript)                         │
│  ├── Zod (API Validation)                        │
│  ├── Prisma (ORM)                                │
│  ├── Socket.IO + Redis Adapter (Real-time)       │
│  ├── JWT (Authentication)                        │
│  ├── ImageKit (Media Storage)                    │
│  ├── Nodemailer (Email)                          │
│  └── bcrypt (Password Hashing)                   │
│                                                  │
├─────────────────────────────────────────────────┤
│                 INFRASTRUCTURE                   │
│                                                  │
│  PostgreSQL (Primary Database)                   │
│  Redis (Cache + Pub/Sub + Offline Queue)         │
│  Nginx (Load Balancer, Sticky Sessions)          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

> *"The best technology is the one that solves your problem with the least complexity."*
>
> Every choice above prioritizes: **beginner-friendliness**, **type safety**, **scalability**, and **minimal bundle size** — in that order.
