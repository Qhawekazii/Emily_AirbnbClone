# Airbnb Clone — API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication

### POST /api/users/register
Register a new user.

**Body:**
```json
{ "username": "John Doe", "email": "john@example.com", "password": "password123", "role": "user" }
```
**Response:** `201` — `{ user, token }`

---

### POST /api/users/login
Log in an existing user.

**Body:**
```json
{ "email": "john@example.com", "password": "password123" }
```
**Response:** `200` — `{ user, token }`

---

### GET /api/users/profile *(protected)*
Get the authenticated user's profile.

**Response:** `200` — User object (no password)

---

## Accommodations

### GET /api/accommodations
List all accommodations. Supports filtering and pagination.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| location | string | Filter by city (case-insensitive) |
| type | string | Filter by type (e.g. "Villa") |
| minPrice | number | Min price per night |
| maxPrice | number | Max price per night |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20, max: 50) |

**Response:** `200` — `{ accommodations: [...], pagination: { total, page, limit, pages } }`

---

### GET /api/accommodations/:id
Get a single accommodation by ID.

**Response:** `200` — Accommodation object

---

### POST /api/accommodations *(protected)*
Create a new listing. Supports image upload via `multipart/form-data` (field: `images`).

**Body:** All Accommodation fields (see model).

**Response:** `201` — `{ message, accommodation }`

---

### PUT /api/accommodations/:id *(protected)*
Update an existing listing.

**Response:** `200` — `{ message, accommodation }`

---

### DELETE /api/accommodations/:id *(protected)*
Delete a listing by ID.

**Response:** `200` — `{ message }`

---

## Reservations

### POST /api/reservations *(protected)*
Create a reservation.

**Body:**
```json
{ "accommodation": "<id>", "checkIn": "2024-08-01", "checkOut": "2024-08-08", "guests": 2 }
```
**Response:** `201` — `{ message, reservation }`

---

### GET /api/reservations/host *(protected)*
Get all reservations for the authenticated host's listings.

---

### GET /api/reservations/user *(protected)*
Get all reservations made by the authenticated user.

---

### GET /api/reservations *(admin only)*
Get all reservations in the system.

---

### DELETE /api/reservations/:id *(protected)*
Cancel a reservation. Only the guest or admin can cancel.

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad request / validation error |
| 401  | Unauthorized — missing or invalid token |
| 403  | Forbidden — insufficient role |
| 404  | Resource not found |
| 409  | Conflict (e.g. duplicate email) |
| 429  | Too many requests |
| 500  | Internal server error |
