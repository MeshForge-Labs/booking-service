# Booking Service

Production-ready Node.js Express microservice for AKS: booking orchestration and inter-service communication. Uses JWT from auth-service, event-service for events and seat reserve, and notification-service for post-booking notify.

## Stack

- **Node.js 20** (LTS), **Express**
- **PostgreSQL** (dedicated booking_db), **pg**
- **Axios** for REST calls to auth-, event-, notification-services
- **Winston** (structured logging), **express-validator** (request validation)
- **Swagger** (OpenAPI 3), **Helmet**, **CORS**

## Project structure

```
booking-service/
├── src/
│   ├── app.js                 # Express app, health, Swagger, routes
│   ├── config/
│   │   ├── index.js           # Env-based config (no hardcoded URLs)
│   │   └── swagger.js         # OpenAPI spec
│   ├── controllers/
│   │   └── bookingController.js
│   ├── middleware/
│   │   ├── errorHandler.js    # Centralized error middleware
│   │   └── validate.js        # express-validator result handler
│   ├── models/
│   │   ├── db.js              # pg Pool
│   │   └── Booking.js
│   ├── routes/
│   │   ├── index.js
│   │   └── bookingRoutes.js
│   ├── services/
│   │   ├── authService.js     # Validate JWT via auth-service
│   │   ├── eventService.js    # Get event, reserve seats
│   │   ├── notificationService.js
│   │   └── bookingService.js  # Orchestration
│   └── utils/
│       ├── logger.js          # Winston
│       └── httpClient.js      # Axios with timeout
├── scripts/
│   └── init-db.sql            # Create bookings table
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── secret.example.yaml
├── Dockerfile
├── .dockerignore
└── package.json
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/bookings | Create booking (body: `{ "eventId": 1, "quantity": 2 }`). Validates JWT → event → reserve → insert → notify |
| GET | /api/bookings/:id | Get booking by UUID (owner or ADMIN) |
| GET | /health | Liveness |
| GET | /health/ready | Readiness (DB check) |
| GET | /api-docs | Swagger UI |

All API endpoints require `Authorization: Bearer <token>` (JWT from auth-service).

## Configuration (environment variables)

- **DATABASE_URL** – PostgreSQL connection string (booking_db)
- **AUTH_SERVICE_URL** – e.g. `http://auth-service:80`
- **EVENT_SERVICE_URL** – e.g. `http://event-service:80`
- **NOTIFICATION_SERVICE_URL** – e.g. `http://notification-service:80`
- **PORT** (default 8082), **NODE_ENV**, **LOG_LEVEL**, **DB_POOL_SIZE**, **HTTP_TIMEOUT_MS**

No hardcoded internal service URLs; use Secrets or ConfigMaps in AKS.

## Inter-service flow (POST /api/bookings)

1. **Validate JWT** – GET auth-service `/api/auth/validate` with `Authorization` header.
2. **Verify event** – GET event-service `/api/events/:eventId`.
3. **Reserve seats** – PUT event-service `/api/events/:eventId/reserve` with `{ "quantity": n }`.
4. **Insert booking** – Insert into `bookings` (transaction-safe with pg client).
5. **Notify** – POST notification-service (e.g. `/api/notifications`) with booking payload; non-blocking (fire-and-forget).

## Database

Run `scripts/init-db.sql` once against `booking_db` to create the `bookings` table.

## Build and run

```bash
npm install
# Set env vars (DATABASE_URL, AUTH_SERVICE_URL, EVENT_SERVICE_URL, NOTIFICATION_SERVICE_URL)
node src/app.js
# Or: npm run dev (with --watch)
```

## Docker and Kubernetes

```bash
docker build -t booking-service:1.0.0 .
kubectl apply -f k8s/secret.example.yaml   # Edit URLs and DB credentials
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Liveness: `/health`. Readiness: `/health/ready` (checks DB).
