# EduFlow LMS - API Documentation

## Overview

EduFlow provides a comprehensive RESTful API with GraphQL support for building integrations and custom applications. The API follows modern standards and best practices for security, performance, and developer experience.

## Base Information

- **Base URL**: `https://api.eduflow.com/v1`
- **Protocol**: HTTPS only (TLS 1.3)
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **API Version**: v1 (current)

## Authentication

### JWT Token Authentication

All API requests require authentication using JWT Bearer tokens in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Management

```http
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

**Login Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Login Response**:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "learner"
  }
}
```

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability:

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **Burst Limit**: 50 requests per minute

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### Pagination

List endpoints support pagination using cursor-based pagination:

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "hasNext": true,
    "hasPrevious": false,
    "nextCursor": "eyJpZCI6IjEyMyJ9",
    "previousCursor": null,
    "totalCount": 150
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content returned |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

## API Endpoints Overview

### Authentication & Users
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/profile/avatar` - Upload profile avatar

### Course Management
- `GET /courses` - List courses
- `POST /courses` - Create course
- `GET /courses/{id}` - Get course details
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course
- `POST /courses/{id}/enroll` - Enroll in course
- `DELETE /courses/{id}/unenroll` - Unenroll from course
- `GET /courses/{id}/progress` - Get course progress
- `POST /courses/{id}/modules` - Create course module
- `POST /courses/{id}/modules/{moduleId}/lessons` - Create lesson

### Content Management
- `POST /content/upload/initiate` - Initiate file upload
- `POST /content/upload/chunk` - Upload file chunk
- `POST /content/upload/complete` - Complete file upload
- `GET /content/{id}` - Get content details
- `GET /content/{id}/stream` - Stream video content
- `DELETE /content/{id}` - Delete content

### Assessment & Progress
- `GET /assessments` - List assessments
- `POST /assessments` - Create assessment
- `GET /assessments/{id}` - Get assessment details
- `POST /assessments/{id}/submit` - Submit assessment
- `GET /assessments/{id}/results` - Get assessment results
- `GET /progress/courses/{courseId}` - Get course progress
- `POST /progress/lessons/{lessonId}` - Update lesson progress

### Innovation Management
- `GET /innovations` - List innovations
- `POST /innovations` - Create innovation
- `GET /innovations/{id}` - Get innovation details
- `PUT /innovations/{id}` - Update innovation
- `POST /innovations/{id}/submit` - Submit innovation for review
- `GET /innovations/{id}/reviews` - Get innovation reviews
- `POST /innovations/{id}/reviews` - Create review
- `POST /innovations/{id}/team-members` - Add team member

### Mentorship
- `GET /mentors` - List available mentors
- `GET /mentors/search` - Search mentors
- `POST /mentorship/requests` - Request mentorship
- `GET /mentorship/requests` - List mentorship requests
- `PUT /mentorship/requests/{id}` - Update mentorship request
- `GET /mentorship/sessions` - List mentorship sessions
- `POST /mentorship/sessions` - Create mentorship session

### Analytics & Reporting
- `GET /analytics/dashboard` - Get dashboard data
- `GET /analytics/courses` - Get course analytics
- `GET /analytics/users` - Get user analytics
- `GET /analytics/innovations` - Get innovation analytics
- `POST /reports/generate` - Generate custom report
- `GET /reports/{id}` - Get report status/download

### Notifications
- `GET /notifications` - List notifications
- `PUT /notifications/{id}/read` - Mark notification as read
- `POST /notifications/preferences` - Update notification preferences
- `DELETE /notifications/{id}` - Delete notification

### Administration
- `GET /admin/users` - List all users (admin only)
- `POST /admin/users` - Create user (admin only)
- `PUT /admin/users/{id}` - Update user (admin only)
- `DELETE /admin/users/{id}` - Delete user (admin only)
- `GET /admin/system/health` - System health check
- `GET /admin/system/metrics` - System metrics
- `POST /admin/system/maintenance` - Schedule maintenance

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'learner' | 'educator' | 'mentor' | 'reviewer' | 'admin';
  avatar?: string;
  bio?: string;
  phone?: string;
  timezone: string;
  language: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Course Model

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: Category;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  language: string;
  thumbnail?: string;
  trailer?: string;
  price: number;
  isPublished: boolean;
  isFeatured: boolean;
  maxEnrollments?: number;
  instructor: User;
  modules: Module[];
  tags: string[];
  prerequisites: Course[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Innovation Model

```typescript
interface Innovation {
  id: string;
  title: string;
  category: InnovationCategory;
  stage: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded';
  submitter: User;
  teamMembers: TeamMember[];
  problemStatement: string;
  solutionDescription: string;
  budgetBreakdown: BudgetItem[];
  totalBudget: number;
  impactMetrics: ImpactMetric[];
  supportingDocuments: Document[];
  reviews: Review[];
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## GraphQL API

### Endpoint
```
POST /graphql
```

### Schema Overview

```graphql
type Query {
  # User queries
  me: User
  user(id: ID!): User
  
  # Course queries
  courses(filter: CourseFilter, pagination: PaginationInput): CourseConnection
  course(id: ID!): Course
  
  # Innovation queries
  innovations(filter: InnovationFilter, pagination: PaginationInput): InnovationConnection
  innovation(id: ID!): Innovation
  
  # Analytics queries
  analytics(type: AnalyticsType!, filters: AnalyticsFilters): AnalyticsData
}

type Mutation {
  # Authentication mutations
  login(input: LoginInput!): AuthPayload
  register(input: RegisterInput!): AuthPayload
  
  # Course mutations
  createCourse(input: CreateCourseInput!): Course
  updateCourse(id: ID!, input: UpdateCourseInput!): Course
  enrollInCourse(courseId: ID!): Enrollment
  
  # Innovation mutations
  createInnovation(input: CreateInnovationInput!): Innovation
  submitInnovation(id: ID!): Innovation
  reviewInnovation(id: ID!, input: ReviewInput!): Review
}

type Subscription {
  # Real-time updates
  courseProgressUpdated(courseId: ID!): Progress
  innovationStatusChanged(innovationId: ID!): Innovation
  notificationReceived(userId: ID!): Notification
}
```

### Example Queries

**Get Course with Modules**:
```graphql
query GetCourse($id: ID!) {
  course(id: $id) {
    id
    title
    description
    instructor {
      id
      firstName
      lastName
    }
    modules {
      id
      title
      lessons {
        id
        title
        contentType
        duration
      }
    }
  }
}
```

**Create Innovation**:
```graphql
mutation CreateInnovation($input: CreateInnovationInput!) {
  createInnovation(input: $input) {
    id
    title
    stage
    submitter {
      id
      firstName
      lastName
    }
  }
}
```

## Webhooks

EduFlow supports webhooks for real-time event notifications to external systems.

### Webhook Events

```typescript
interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  signature: string;
}
```

### Supported Events

- `user.registered`
- `user.profile_updated`
- `course.created`
- `course.published`
- `course.enrolled`
- `course.completed`
- `innovation.submitted`
- `innovation.approved`
- `innovation.rejected`
- `mentorship.session_completed`
- `assessment.submitted`
- `certificate.issued`

### Webhook Configuration

```http
POST /webhooks
{
  "url": "https://your-app.com/webhooks/eduflow",
  "events": ["course.completed", "innovation.approved"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Example

```json
{
  "id": "evt_123456789",
  "type": "course.completed",
  "data": {
    "course": {
      "id": "course_123",
      "title": "Introduction to AI"
    },
    "user": {
      "id": "user_456",
      "email": "learner@example.com"
    },
    "completedAt": "2024-01-01T12:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @eduflow/sdk
```

```typescript
import { EduFlowClient } from '@eduflow/sdk';

const client = new EduFlowClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.eduflow.com/v1'
});

// Get courses
const courses = await client.courses.list();

// Create innovation
const innovation = await client.innovations.create({
  title: 'My Innovation',
  problemStatement: 'Problem description...',
  solutionDescription: 'Solution description...'
});
```

### Python SDK

```bash
pip install eduflow-python
```

```python
from eduflow import EduFlowClient

client = EduFlowClient(api_key='your-api-key')

# Get user profile
profile = client.users.get_profile()

# Enroll in course
enrollment = client.courses.enroll('course-id')
```

## Testing

### Sandbox Environment

Use the sandbox environment for testing:
- **Base URL**: `https://api-sandbox.eduflow.com/v1`
- **Test API Keys**: Available in developer dashboard
- **Test Data**: Pre-populated with sample data

### Postman Collection

Download our Postman collection for easy API testing:
- [EduFlow API Collection](https://api.eduflow.com/postman/collection.json)

## Support

### Developer Resources
- **Documentation**: [https://docs.eduflow.com](https://docs.eduflow.com)
- **API Reference**: [https://api.eduflow.com/docs](https://api.eduflow.com/docs)
- **Status Page**: [https://status.eduflow.com](https://status.eduflow.com)

### Contact
- **Developer Support**: developers@eduflow.com
- **Community Forum**: [https://community.eduflow.com](https://community.eduflow.com)
- **GitHub Issues**: [https://github.com/eduflow/api-issues](https://github.com/eduflow/api-issues)

## Changelog

### v1.2.0 (2024-01-15)
- Added GraphQL subscriptions
- Enhanced innovation management endpoints
- Improved error handling and validation

### v1.1.0 (2023-12-01)
- Added mentorship management APIs
- Implemented webhook system
- Added bulk operations support

### v1.0.0 (2023-10-01)
- Initial API release
- Core functionality for courses, users, and assessments
- JWT authentication system

---

**Last Updated**: January 2024  
**API Version**: v1.2.0