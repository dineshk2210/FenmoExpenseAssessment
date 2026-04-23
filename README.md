# 💰 Expense Tracker

A full-stack personal expense tracker with **Java (Spring Boot)** backend and **React** frontend.

🔗 **Live Demo:** [fenmo-expense-assessment.vercel.app](https://fenmo-expense-assessment.vercel.app)

---

## Features

- **User Authentication** — Register/Login with JWT, passwords hashed with BCrypt
- **Create Expenses** — Amount, category, description, date with validation
- **View & Filter** — Filter by category, sort by date/amount/recently added
- **Pagination** — 10 expenses per page
- **Per-Category Summary** — Total spending + breakdown by category
- **Delete Expenses** — Remove entries with one click
- **Idempotency** — Safe retries on network failures, double-clicks
- **Multi-User** — Each user only sees their own expenses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Java 17, Spring Boot 3, Spring Security, JPA |
| Database | PostgreSQL (Neon) |
| Auth | JWT (jjwt) + BCrypt |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

---

## Local Development

### Prerequisites

- Java 17+ (`java --version`)
- Node.js 18+ (`node --version`)
- PostgreSQL running locally

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on **http://localhost:4000**. Configure database in `src/main/resources/application.properties`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173**.

### Run Tests

```bash
cd backend
./mvnw test
```

---

## API Endpoints

### Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account (`name`, `email`, `password`) |
| POST | `/auth/login` | Login (`email`, `password`) → returns JWT |

### Expenses (Requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/expenses` | Create expense (supports `idempotencyKey`) |
| GET | `/expenses` | List expenses (paginated) |
| DELETE | `/expenses/{id}` | Delete an expense |

**GET /expenses query params:**

| Param | Description |
|---|---|
| `category` | Filter by category |
| `sort` | `recent`, `oldest`, `date_desc`, `date_asc`, `amount_desc`, `amount_asc` |
| `page` | Page number (default: 0) |
| `size` | Page size (default: 10) |

---

## Design Decisions

### Money as Integer Cents

Amounts stored as `amount_cents` (Long) to avoid floating-point precision issues. The API accepts/returns decimal values and converts internally.

### Idempotency

Client sends an `idempotencyKey` with each POST. The backend stores it in a UNIQUE column. Duplicate requests return the existing record instead of creating duplicates. Handles double-clicks, network retries, and browser refreshes.

### JWT Authentication

Stateless auth with 24-hour token expiry. Passwords hashed with BCrypt. Each expense is tied to a `userId` — users can only see and delete their own data.

### PostgreSQL

Production-grade relational database. Hosted on Neon (free tier) for deployment. Schema auto-managed by Hibernate (`ddl-auto=update`).

### Environment-Based Config

All sensitive config (DB credentials, JWT secret, CORS origins) read from environment variables with local defaults for development.

---

## Project Structure

```
expense-tracker/
├── backend/                          # Spring Boot
│   ├── src/main/java/com/expensetracker/
│   │   ├── controller/               # REST endpoints (Auth, Expenses)
│   │   ├── dto/                      # Request/Response objects
│   │   ├── model/                    # JPA entities (User, Expense)
│   │   ├── repository/              # Spring Data JPA
│   │   └── security/                # JWT + Spring Security config
│   ├── src/test/                     # Integration tests
│   └── Dockerfile                    # For Render deployment
└── frontend/                         # React + Vite
    └── src/
        ├── pages/                    # HomePage, LoginPage, RegisterPage, DashboardPage
        ├── components/               # Form, List, Filters, Summary, Toast, Pagination
        ├── api.js                    # API client with auth
        └── App.jsx                   # Router setup
```

---

## Deployment

| Service | Purpose | URL |
|---|---|---|
| **Vercel** | Frontend hosting | [vercel.com](https://vercel.com) |
| **Render** | Backend hosting | [render.com](https://render.com) |
| **Neon** | PostgreSQL database | [neon.tech](https://neon.tech) |

### Environment Variables

**Backend (Render):**
- `SPRING_DATASOURCE_URL` — JDBC PostgreSQL connection string
- `SPRING_DATASOURCE_USERNAME` — DB username
- `SPRING_DATASOURCE_PASSWORD` — DB password
- `JWT_SECRET` — Secret key for signing tokens (min 32 chars)
- `CORS_ORIGIN` — Comma-separated allowed origins
- `PORT` — Server port (default: 4000)

**Frontend (Vercel):**
- `VITE_API_URL` — Backend URL (no trailing slash)
