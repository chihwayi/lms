# EduFlow Sprint Plan: The "Standout" Phase

**Objective**: Elevate EduFlow from a standard LMS to a market leader by bridging critical gaps in social engagement, hybrid learning, organization, and analytics.

**Start Date**: Tomorrow
**Sprint Duration**: 1 Week per Sprint (Accelerated)

---

## **Sprint 1: The Social Layer (Real-Time Engagement)**
*Focus: Bringing the platform to life with instant communication.*

### **1.1. Real-Time Infrastructure (Backend)**
- [ ] **Socket.io Gateway**: Set up WebSocket gateway in NestJS (`apps/api/src/modules/chat`).
- [ ] **Chat Entities**: Create `Conversation`, `Message`, and `Participant` entities.
- [ ] **Events**: Handle `join_room`, `send_message`, `receive_message`, `typing` events.

### **1.2. Chat Interface (Frontend)**
- [ ] **Chat Widget**: Floating chat bubble or dedicated `/chat` page.
- [ ] **Direct Messaging**: Allow Mentors and Mentees to message each other.
- [ ] **Course Rooms**: Public channels for each course (like Slack/Discord).

---

## **Sprint 2: Organization & Time Management**
*Focus: Helping learners stay on track with a unified view.*

### **2.1. Global Calendar (Frontend)**
- [ ] **Library**: Integrate `react-big-calendar` or `FullCalendar`.
- [ ] **Dashboard Integration**: Add a calendar widget to the Student Dashboard.
- [ ] **Event Sources**: Display assignment due dates, quiz deadlines, and mentorship sessions.

### **2.2. Deadline Aggregation (Backend)**
- [ ] **API Endpoint**: Create `/api/v1/calendar/events` that aggregates dates from `assignments`, `quizzes`, and `mentorship_sessions`.

---

## **Sprint 3: Hybrid Learning (Live Classes)**
*Focus: Supporting synchronous learning alongside async content.*

### **3.1. Live Session Management**
- [x] **Course Integration**: Add "Live Sessions" tab to Course View.
- [x] **Instructor Tools**: Form for instructors to schedule Zoom/Meet links with date/time.
- [x] **Notifications**: Email/In-app reminders 15 mins before class.

---

## **Sprint 4: Intelligence & Insights (Analytics)**
*Focus: Empowering instructors with actionable data.*

### **4.1. Instructor Dashboard**
- [x] **Engagement Stats**: Charts for login frequency, lesson completion rates (using Recharts).
- [x] **"At-Risk" Identification**: Logic to flag students with low engagement or failing grades.

### **4.2. Data Aggregation (Backend)**
- [x] **Analytics Service**: Background jobs to calculate daily stats.
- [x] **Reporting API**: Endpoints for `getCourseStats`, `getStudentRiskProfile`.
