# Skill Tournaments System

A fullstack microservices system for skill-based tournaments built with NestJS, React, Kafka, NATS, and PostgreSQL.

> `docker compose up --build` — starts everything.

---

## Table of Contents

- [Architecture](#architecture)
- [Kafka vs NATS](#kafka-vs-nats)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [Tests](#tests)
- [Tech Stack](#tech-stack)
- [Assumptions](#assumptions)

---

## Architecture

```
┌──────────────┐    HTTP      ┌───────────┐    Kafka     ┌─────────────────┐    NATS     ┌───────────────┐
│   Frontend   │ ──────────▶  │  Gateway  │ ──────────▶  │   Tournament    │ ──────────▶ │     User      │
│   (React)    │ ◀──────────  │  Service  │ ◀──────────  │    Service      │ ◀────────── │   Service     │
│   Port 80    │              │  Port 3000│              │   Port 3001     │             │  (Hardcoded)  │
└──────────────┘              └───────────┘              └─────────────────┘             └───────────────┘
                                   │                          │
                              ┌─────────┐              ┌─────────┐
                              │  JWT    │              │PostgreSQL│
                              │  Auth   │              │   DB    │
                              └─────────┘              └─────────┘
```

| Service | Port | Transport | Role |
|---------|------|-----------|------|
| **Frontend** | `80` | HTTP | React dashboard with Refine.dev, Material UI, React Query, Redux Toolkit |
| **Gateway** | `3000` | HTTP + Kafka | REST API, request validation, JWT auth |
| **Tournament Service** | `3001` | Kafka + NATS | Business logic, PostgreSQL storage, user validation via NATS |
| **User Service** | — | NATS | Hardcoded player data, no database |

| Infrastructure | Port | Purpose |
|----------------|------|---------|
| **Kafka** | `9092` | Message broker (Gateway ↔ Tournament Service) |
| **Zookeeper** | `2181` | Kafka coordination |
| **NATS** | `4222` | Messaging (Tournament Service ↔ User Service) |
| **PostgreSQL** | `5433` | Tournament data storage |

---

## Kafka vs NATS

The system uses two message brokers, each chosen for its strengths:

**Kafka** (Gateway ↔ Tournament Service) — Durable message queuing with guaranteed delivery. Suitable for commands (`tournament.join`) and queries that need reliable request/response patterns. Supports horizontal scaling via consumer groups.

| Pattern | Purpose |
|---------|---------|
| `tournament.join` | Join a player to a tournament |
| `tournament.list` | List tournaments (paginated) |
| `tournament.my-tournaments` | Get player's tournaments |
| `tournament.details` | Get tournament with players |
| `auth.login` | Authenticate a player |

**NATS** (Tournament Service ↔ User Service) — Lightweight, low-latency request/reply. Ideal for simple in-memory lookups where persistence is not needed.

| Pattern | Purpose |
|---------|---------|
| `user.get` | Validate player exists |
| `user.login` | Authenticate player |
| `user.list` | List all players |

---

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Run

```bash
docker compose up --build
```

Starts all services. Seed data (10 tournaments, 14 player entries) is loaded on first start.

| Resource | URL |
|----------|-----|
| **Dashboard** | http://localhost |
| **API** | http://localhost:3000 |

### Stop

```bash
docker compose down        # stop services
docker compose down -v     # stop + remove data
```

---

## Project Structure

```
├── docker-compose.yml
├── backend/
│   ├── gateway/                       # REST API Gateway
│   │   └── src/
│   │       ├── auth/                  # JWT auth (controller, service, strategy, guard)
│   │       ├── tournament/            # Tournament endpoints + DTO validation
│   │       └── kafka/                 # Kafka client config
│   │
│   ├── tournament-service/            # Business Logic Service
│   │   ├── start.sh                   # Entrypoint: wait → seed → start
│   │   └── src/
│   │       ├── tournament/            # Kafka message handlers + service logic
│   │       ├── entities/              # TypeORM entities (Tournament, TournamentPlayer)
│   │       └── seed.ts                # Database seeding
│   │
│   └── user-service/                  # User Lookup Service
│       └── src/
│           └── user/                  # NATS handlers + hardcoded user data
│
└── frontend/                          # React Dashboard
    ├── Dockerfile                     # Multi-stage: build → Nginx
    ├── nginx.conf                     # SPA routing + API proxy
    └── src/
        ├── components/                # Sidebar, header, skeletons, error boundary
        ├── hooks/                     # useTournaments, useMyTournaments, useJoinTournament, useTournamentDetails, useLogin
        ├── pages/                     # LoginPage, TournamentList, MyTournaments
        ├── store/                     # Redux slices (auth, UI)
        ├── providers/                 # Refine.dev data provider
        └── utils/                     # API fetch wrapper with auth
```

---

## API Reference

All `/tournaments/*` endpoints require `Authorization: Bearer <token>`.

### `POST /auth/login`

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "playerId": "player-1" }'
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "player-1", "name": "Alice Johnson", "balance": 1000, "country": "US" }
}
```

### `POST /tournaments/join`

Finds a matching open tournament or creates one. `playerId` is derived from JWT if omitted.

```bash
curl -X POST http://localhost:3000/tournaments/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "gameType": "chess", "tournamentType": "daily", "entryFee": 10 }'
```

| Field | Type | Validation |
|-------|------|------------|
| `gameType` | string | Required |
| `tournamentType` | string | Required |
| `entryFee` | number | Required, >= 0 |
| `playerId` | string | Optional (from JWT) |

### `GET /tournaments`

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/tournaments?gameType=chess&tournamentType=daily&page=1&limit=5"
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `gameType` | — | Filter by game |
| `tournamentType` | — | Filter by type |
| `page` | `1` | Page number |
| `limit` | `10` | Items per page |

Returns `{ data: [...], total, page, limit, totalPages }`.

### `GET /tournaments/my-tournaments`

`playerId` derived from JWT. Optional query param: `?playerId=player-1`.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/tournaments/my-tournaments"
```

### `GET /tournaments/:id`

Returns tournament with player list.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/tournaments/<tournament-id>
```

---

## Frontend

Single-page application built with React 18 (JavaScript library for UIs), Refine.dev, Material UI, and TypeScript.

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Player selection dropdown, JWT login |
| Tournaments | `/tournaments` | Browse, filter, join, create & join, view details |
| My Tournaments | `/my-tournaments` | Player's joined tournaments |

### State Management

| Concern | Tool |
|---------|------|
| Server state (tournaments, mutations) | React Query |
| UI state (filters, selected player) | Redux Toolkit |
| Auth state (token, user) | Redux Toolkit + localStorage |

### Custom Hooks

`useTournaments` · `useMyTournaments` · `useTournamentDetails` · `useJoinTournament` · `useLogin`

### UI Features

- Skeleton loaders, error alerts, empty states
- Join confirmation dialog with success animation
- Create & Join form dialog (game type, tournament type, entry fee) to find or create a tournament
- Tournament details drawer with player list
- Game type / tournament type filters with pagination
- Responsive layout (collapsible sidebar, mobile drawers)

---

## Data Model

### User (hardcoded — no database)

| ID | Name | Balance | Country |
|----|------|---------|---------|
| `player-1` | Alice Johnson | 1000 | US |
| `player-2` | Bob Smith | 500 | UK |
| `player-3` | Charlie Brown | 750 | DE |
| `player-4` | Diana Prince | 1200 | FR |
| `player-5` | Eve Wilson | 300 | JP |

### Tournament (PostgreSQL)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `gameType` | string | chess, poker, backgammon, go |
| `tournamentType` | string | daily, weekly, monthly |
| `entryFee` | decimal(10,2) | |
| `status` | string | Default: `"open"` |
| `maxPlayers` | int | Default: `8` |
| `createdAt` | timestamp | |

### TournamentPlayer (PostgreSQL)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `tournamentId` | UUID | FK → Tournament |
| `playerId` | string | |
| `joinedAt` | timestamp | |

Unique constraint on `(tournamentId, playerId)` prevents duplicate joins.

---

## Authentication

JWT-based. All tournament endpoints require a Bearer token.

**Flow:** Login page → `POST /auth/login` → Gateway validates user via Kafka → Tournament Service checks user via NATS → JWT signed and returned → stored in Redux + localStorage → sent on all subsequent requests → `playerId` extracted from token automatically.

| Property | Value |
|----------|-------|
| Algorithm | HS256 |
| Expiration | 24 hours |
| Auto-logout | On 401 response |

---

## Tests

Each service has unit tests:

```bash
cd backend/user-service && npm test
cd backend/gateway && npm test
cd backend/tournament-service && npm test
```

| Service | Coverage |
|---------|----------|
| **Gateway** | Auth (login, token, errors), Tournament controller (validation, JWT fallback, filters) |
| **Tournament Service** | Service (creation, joining, duplicates, pagination), Controller (message patterns) |
| **User Service** | Controller (get, login, list), Service (findById, findAll) |

---

## Tech Stack

### Backend

| Technology | Role |
|------------|------|
| **NestJS** | Progressive Node.js framework for server-side applications |
| **Apache Kafka** | Durable message broker (Gateway ↔ Tournament Service) |
| **NATS** | Lightweight messaging (Tournament Service ↔ User Service) |
| **PostgreSQL 16** | Relational database |
| **TypeORM** | Object-relational mapper |
| **Passport.js + JWT** | Authentication strategy |
| **class-validator** | DTO validation |

### Frontend

| Technology | Role |
|------------|------|
| **React 18** | JavaScript library for building user interfaces |
| **TypeScript** | Typed superset of JavaScript |
| **Vite** | Next-generation frontend build tooling |
| **Refine.dev** | React framework for building internal tools, admin panels & dashboards |
| **Material UI 5** | React component library implementing Google's Material Design |
| **Emotion** | CSS-in-JS library for high-performance style composition |
| **React Query** | Async state management — data fetching, caching & synchronization |
| **Redux Toolkit** | Official toolset for efficient Redux state management |

### Infrastructure

| Technology | Role |
|------------|------|
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Static file serving + API reverse proxy |

---

## Assumptions

1. When a player joins, the system finds a matching open tournament or creates a new one if none exists.
2. Default max players per tournament: 8.
3. Duplicate joins prevented by database unique constraint on `(tournamentId, playerId)`.
4. Users are hardcoded — login is simplified to player ID selection.
5. TypeORM `synchronize: true` for auto schema creation (development only).
6. Gateway uses synchronous request/response over Kafka with a 10-second timeout.
7. JWT secret is hardcoded for simplicity. In production, use environment variables.
