# Habit Circle

Habit Circle is a habit-tracking web app with a social twist. Users create or join
small groups called **circles**, add habits, check in each day, and see a shared
progress table and leaderboard to keep each other accountable.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT + bcrypt

## Project Structure

```
habit-circle/
├── frontend/   # React app
└── backend/    # Express API + MySQL connection
```

## Prerequisites

- Node.js (v18+)
- MySQL server running locally

## Setup

### 1. Database

Create the database in MySQL:

```sql
CREATE DATABASE habit_circle_db;
```

Then create the required tables: `users`, `circles`, `circle_members`, `habits`,
and `checkins` (matching the columns used in `backend/routes`).

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=habit_circle_db
PORT=5000
JWT_SECRET=your_secret_key
```

Start the server:

```bash
npm start
```

The API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` (default Vite port).

## Features

- Sign up / log in (JWT-based auth)
- Create habits and check in daily
- Automatic streak tracking, with undo
- Create, browse, and join circles
- Circle progress table and leaderboard
- Rename/delete a circle (creator only)

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register` | Create a new account |
| `POST /api/auth/login` | Log in and get a JWT |
| `GET /api/habits/mine` | Get the logged-in user's habits |
| `POST /api/habits` | Create a habit |
| `POST /api/checkins` | Check in a habit for today |
| `GET /api/checkins/streak/:habitId` | Get current streak for a habit |
| `DELETE /api/checkins/:habitId` | Undo today's check-in |
| `POST /api/circles` | Create a circle |
| `GET /api/circles/mine` | Get circles the user belongs to |
| `GET /api/circles/all` | Browse all circles |
| `POST /api/circles/:circleId/join` | Join a circle |
| `GET /api/circles/:circleId/progress` | Get a circle's daily progress |

## Notes

- All protected routes require an `Authorization` header with the JWT from login.
- The frontend stores the token and user info in `localStorage`.
