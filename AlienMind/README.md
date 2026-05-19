# AllienMind

AllienMind is a starter full-stack platform for peer mock interviews, mentor-style paid interviews, candidate progression, and company hiring discovery.

It combines ideas from LinkedIn, Zoom, and interview-preparation platforms:

- Candidates register, log in, build profiles, and join mock interviews.
- Interviewers set rank, skills, price, availability, and rate candidates after interviews.
- Candidates control whether recorded interviews and results are visible.
- Companies search candidates by skills and level.
- Interview sessions expose a Zoom-style room model with voice transcript placeholders.

## Stack

- Backend: Spring Boot 3, Java 17, Spring Web, Spring Data JPA, PostgreSQL
- Frontend: React, Vite, TypeScript
- Database: Local PostgreSQL

## Local PostgreSQL

Create this database in your local PostgreSQL:

```sql
CREATE DATABASE allienmind;
```

Default backend database settings are in `backend/src/main/resources/application.yml`:

- URL: `jdbc:postgresql://localhost:5432/allienmind`
- User: `postgres`
- Password: `admin`

You can override them with environment variables:

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/allienmind"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="admin"
```

## Run Backend

Maven does not need to be installed globally. Use the included local wrapper script:

```powershell
.\start-backend-local.cmd
```

API base URL: `http://localhost:8080/api`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Or from the project root:

```powershell
.\start-frontend-local.cmd
```

Frontend URL: `http://localhost:5173`

## Current Scope

This is an MVP scaffold. Authentication is intentionally simple for development and should be replaced with Spring Security + JWT/OAuth before production. Video calls and real-time voice transcription are modeled in the domain/API and shown in the UI, ready to connect to WebRTC, Daily, Twilio, Zoom SDK, or LiveKit.
