# 🏗️ System Architecture & Tech Stack

## 🛠 Technology Stack

### Frontend (Learner & Instructor Experience)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + [Shadcn/UI](https://ui.shadcn.com/)
- **State Management**: React Context + Zustand (for complex local state)
- **Data Fetching**: SWR / React Query
- **Forms**: React Hook Form + Zod Validation
- **Media**: Video.js (or similar) for playback, PDF.js for documents

### Backend (API & Core Logic)
- **Framework**: [NestJS](https://nestjs.com/) (Modular Architecture)
- **Language**: TypeScript
- **Runtime**: Node.js v18+
- **API Style**: RESTful JSON API
- **Documentation**: Swagger / OpenAPI (Auto-generated)

### Data Layer
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM (Entity definitions, Relations, Migrations)
- **Caching**: Redis (Planned for sessions and high-read data)
- **File Storage**: Local Driver (Dev) / S3-compatible Object Storage (Prod)

### DevOps & Infrastructure
- **Monorepo Tool**: TurboRepo (Manages build pipeline)
- **Package Manager**: npm
- **Containerization**: Docker (for Database and Redis services)
- **CI/CD**: GitHub Actions (Planned)

---

## 🧩 System Architecture

### 1. Monorepo Structure
```
/apps
  /web       -> Next.js Frontend Application
  /api       -> NestJS Backend API
/packages
  /ui        -> Shared UI Components (future)
  /config    -> Shared TSConfig/ESLint settings
```

### 2. Database Schema (Key Entities)

#### User & Auth Domain
- `User`: Base user account (email, password_hash, role)
- `Role`: RBAC definitions (Admin, Instructor, Student, Mentor)

#### Course Domain
- `Course`: The main container (title, price, instructor_id)
- `Module`: Sections within a course (Chapter 1, Chapter 2)
- `Lesson`: Actual content units (Video, Text, Quiz)
- `Enrollment`: Links User <-> Course with progress tracking
- `LessonProgress`: Granular tracking (completed_at, score)

#### Innovation Domain (Upcoming)
- `Innovation`: Student project submission
- `InnovationReview`: Feedback and scoring record

### 3. Key Design Patterns

- **Service-Repository Pattern**: The API uses Services for business logic and Repositories (TypeORM) for data access. Controllers are thin.
- **Guard-Based Auth**: NestJS Guards (`JwtAuthGuard`, `RolesGuard`) protect endpoints.
- **DTO Validation**: All inputs are validated using `class-validator` DTOs to prevent bad data.
- **Component Composition**: Frontend uses small, reusable UI components (Buttons, Cards, Modals) to build complex pages.

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Docker (for database)
- Git

### Local Development Setup

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    npm install
    ```

2.  **Start Database**
    ```bash
    docker-compose up -d
    ```

3.  **Environment Setup**
    - Copy `.env.example` to `.env` in `apps/api` and `apps/web`.
    - Ensure DB credentials match docker-compose.yml.

4.  **Run Migrations**
    ```bash
    cd apps/api
    npm run migration:run
    ```

5.  **Start Dev Servers**
    ```bash
    # From root
    npx turbo run dev
    ```
    - Web: http://localhost:3000
    - API: http://localhost:3001
    - API Docs: http://localhost:3001/api

### Production Build
```bash
npx turbo run build
npm run start:prod
```
