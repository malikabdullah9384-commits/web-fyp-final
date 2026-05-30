# FYP Management System — Project Plan

**Foundation University Islamabad (FURC)**  
Course: Introduction to Web Technologies Lab  
Submitted to: Sir Asad Javed | Semester: 4A

---

## 1. Project Overview

A full-stack web application that manages the Final Year Project (FYP) lifecycle for a university. Three types of users interact with the system: Admins who set up the system, Students who submit proposals, and Supervisors who review and guide students.

---

## 2. User Roles & Capabilities

| Role       | Capabilities |
|------------|-------------|
| Admin      | Login, view dashboard stats, add/delete supervisors, toggle supervisor active status, add/delete students, assign a supervisor to a student |
| Student    | Login, view profile + assigned supervisor, submit FYP proposal (with file upload), track proposal status, submit weekly progress reports |
| Supervisor | Login, view assigned students, review/approve/reject proposals, give written feedback, view student progress reports |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BROWSER (React 19)                    │
│                                                         │
│   /login          /admin/*       /student/*             │
│   Login Page      Admin Panel    Student Portal         │
│                                  /supervisor/*          │
│                                  Supervisor Portal      │
│                                                         │
│         React Router DOM v7  ─  Axios (HTTP)            │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API  (JSON)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              NODE.JS  /  EXPRESS 5  SERVER              │
│                                                         │
│  POST /api/auth/login                                   │
│  /api/admin/*     → adminRoutes   → adminController     │
│  /api/student/*   → studentRoutes → studentController   │
│  /api/supervisor/*→ supervisorRoutes→supervisorCtrl     │
│                                                         │
│  Middleware:  JWT verify  +  Role guard                 │
│  File uploads: Multer  → /uploads/                      │
└──────────────────────────┬──────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     MONGODB                             │
│                                                         │
│   Collection: users      Collection: projects           │
│   Collection: progresses                                │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Database Design (ER Diagram)

```
┌──────────────────────────┐
│         USERS            │
├──────────────────────────┤
│ _id          ObjectId PK │
│ name         String      │
│ email        String UQ   │
│ password     String      │
│ role         Enum        │
│              admin|      │
│              student|    │
│              supervisor  │
│ ── Student fields ──     │
│ rollNo       String      │
│ department   String      │
│ batch        String      │
│ semester     String      │
│ supervisorId ObjectId FK ├──────────────┐
│ ── Supervisor fields ─── │              │
│ designation  String      │              │
│ field        String      │              │
│ phone        String      │              │
│ isActive     Boolean     │              │
│ maxStudents  Number      │              │
│ createdAt    Date        │              │
└───────────┬──────────────┘              │
            │ 1                           │ N
            │ studentId / supervisorId    │
            ▼ N                           │
┌──────────────────────────┐              │
│        PROJECTS          │              │
├──────────────────────────┤              │
│ _id          ObjectId PK │              │
│ title        String      │              │
│ description  String      │              │
│ studentId    ObjectId FK │◄─────────────┘
│ supervisorId ObjectId FK │
│ status       Enum        │
│              pending|    │
│              approved|   │
│              rejected    │
│ proposalFile String      │
│ supervisorFeedback String│
│ createdAt    Date        │
└───────────┬──────────────┘
            │ 1
            │ projectId
            ▼ N
┌──────────────────────────┐
│       PROGRESSES         │
├──────────────────────────┤
│ _id          ObjectId PK │
│ projectId    ObjectId FK │
│ studentId    ObjectId FK │
│ weekNumber   Number      │
│ description  String      │
│ file         String      │
│ feedback     String      │
│ status       Enum        │
│              submitted|  │
│              reviewed    │
│ reviewedAt   Date        │
│ createdAt    Date        │
└──────────────────────────┘
```

**Relationships:**
- One User (student) → One Project  
- One User (supervisor) → Many Projects  
- One Project → Many Progress entries  

---

## 5. User Flow Diagrams

### 5.1 Admin Flow
```
Admin Logs In
     │
     ▼
Dashboard (stats: total students, supervisors, projects, pending)
     │
     ├──► Supervisors Page
     │         ├── Add Supervisor (name, email, password, designation, field)
     │         ├── Toggle Active / Inactive
     │         └── Delete Supervisor
     │
     ├──► Students Page
     │         ├── Add Student (name, email, password, rollNo, dept, batch)
     │         ├── Assign Supervisor (dropdown)
     │         └── Delete Student
     │
     └──► Logout
```

### 5.2 Student Flow
```
Student Logs In
     │
     ▼
Dashboard (profile info + assigned supervisor info)
     │
     ├──► My Proposal Page
     │         ├── If no proposal: Submit form (title, description, PDF upload)
     │         ├── If pending: Shows "Under Review" badge
     │         ├── If approved: Shows "Approved" + unlock Progress section
     │         └── If rejected: Shows feedback + option to resubmit
     │
     ├──► Progress Page  (visible only after proposal approved)
     │         ├── Submit weekly report (week number, description, file)
     │         └── View all previous reports + supervisor feedback
     │
     └──► Logout
```

### 5.3 Supervisor Flow
```
Supervisor Logs In
     │
     ▼
Dashboard (assigned student count, pending proposals count)
     │
     ├──► Proposals Page
     │         ├── List of all proposals from assigned students
     │         ├── Approve (+ optional feedback)
     │         └── Reject (+ required feedback)
     │
     ├──► Students Page
     │         ├── List of assigned students
     │         └── Click student → view weekly progress reports
     │                   └── Give written feedback on each report
     │
     └──► Logout
```

---

## 6. API Endpoints

### Auth
| Method | Endpoint         | Access  | Description          |
|--------|-----------------|---------|----------------------|
| POST   | /api/auth/login  | Public  | Login, returns JWT   |

### Admin (`/api/admin/*` — JWT required, role=admin)
| Method | Endpoint                      | Description                   |
|--------|-------------------------------|-------------------------------|
| GET    | /api/admin/stats              | Dashboard stats                |
| GET    | /api/admin/supervisors        | List all supervisors           |
| POST   | /api/admin/supervisors        | Add new supervisor             |
| PUT    | /api/admin/supervisors/:id/toggle | Toggle active status      |
| DELETE | /api/admin/supervisors/:id    | Delete supervisor              |
| GET    | /api/admin/students           | List all students              |
| POST   | /api/admin/students           | Add new student                |
| DELETE | /api/admin/students/:id       | Delete student                 |
| POST   | /api/admin/assign             | Assign supervisor to student   |

### Student (`/api/student/*` — JWT required, role=student)
| Method | Endpoint               | Description                   |
|--------|------------------------|-------------------------------|
| GET    | /api/student/profile   | Get own profile + supervisor  |
| GET    | /api/student/project   | Get own project/proposal      |
| POST   | /api/student/proposal  | Submit proposal (file upload) |
| GET    | /api/student/progress  | List own progress entries     |
| POST   | /api/student/progress  | Submit weekly progress        |

### Supervisor (`/api/supervisor/*` — JWT required, role=supervisor)
| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| GET    | /api/supervisor/profile           | Get own profile               |
| GET    | /api/supervisor/students          | Assigned students list        |
| GET    | /api/supervisor/proposals         | All proposals (any status)    |
| PUT    | /api/supervisor/proposals/:id/review | Approve or reject proposal |
| GET    | /api/supervisor/progress/:studentId  | Student's progress list    |
| PUT    | /api/supervisor/progress/:id/feedback | Give feedback on report   |

---

## 7. Frontend Component Tree

```
App.js  (BrowserRouter + Routes)
│
├── /login  →  Login.js
│
├── /admin/*  →  ProtectedRoute (role=admin)
│     └── Layout.js  (Sidebar + Outlet)
│           ├── /admin          →  AdminDashboard.js
│           ├── /admin/supervisors  →  ManageSupervisors.js
│           └── /admin/students     →  ManageStudents.js
│
├── /student/*  →  ProtectedRoute (role=student)
│     └── Layout.js  (Sidebar + Outlet)
│           ├── /student            →  StudentDashboard.js
│           └── /student/proposal   →  SubmitProposal.js
│
└── /supervisor/*  →  ProtectedRoute (role=supervisor)
      └── Layout.js  (Sidebar + Outlet)
            ├── /supervisor         →  SupervisorDashboard.js
            └── /supervisor/proposals  →  ReviewProposals.js
```

### Shared Components
- `Sidebar.js` — role-aware nav links + logout button
- `ProtectedRoute.js` — checks JWT + role, redirects if unauthorized
- `Layout.js` — wraps Sidebar + page content

---

## 8. Folder Structure

```
fyp-management-system/
│
├── backend/
│   ├── server.js
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Progress.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── studentController.js
│   │   └── supervisorController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── studentRoutes.js
│   │   └── supervisorRoutes.js
│   └── uploads/
│
└── frontend/
    └── src/
        ├── App.js
        ├── App.css
        ├── components/
        │   ├── Layout.js
        │   ├── Sidebar.js
        │   ├── Sidebar.css
        │   └── ProtectedRoute.js
        └── pages/
            ├── Login.js
            ├── Login.css
            ├── admin/
            │   ├── AdminDashboard.js
            │   ├── ManageSupervisors.js
            │   └── ManageStudents.js
            ├── student/
            │   ├── StudentDashboard.js
            │   └── SubmitProposal.js
            └── supervisor/
                ├── SupervisorDashboard.js
                └── ReviewProposals.js
```

---

## 9. MVP Scope

### Phase 1 — MVP (Building Now)
- [x] Project structure setup
- [ ] Backend: MongoDB connection + all models
- [ ] Backend: JWT auth (login only — admin creates accounts)
- [ ] Backend: Admin routes — stats, supervisor CRUD, student CRUD, assign
- [ ] Backend: Student routes — profile, proposal submit, progress
- [ ] Backend: Supervisor routes — students, proposals review, feedback
- [ ] Frontend: Login page (shared for all roles, redirects by role)
- [ ] Frontend: Admin Panel (Dashboard, Supervisors, Students)
- [ ] Frontend: Student Portal (Dashboard, Submit Proposal)
- [ ] Frontend: Supervisor Portal (Dashboard, Review Proposals)

### Phase 2 — Future Enhancements
- [ ] Edit supervisor/student profiles
- [ ] Notifications system
- [ ] Email alerts on proposal status change
- [ ] Admin can reset passwords
- [ ] Export reports to PDF
- [ ] Progress timeline visualization

---

## 10. Tech Stack Summary

| Layer      | Technology              | Version  |
|------------|------------------------|----------|
| Frontend   | React                  | 19       |
| Routing    | React Router DOM       | 7        |
| HTTP client| Axios                  | 1.x      |
| Backend    | Node.js + Express      | 5.x      |
| Database   | MongoDB + Mongoose     | 9.x      |
| Auth       | JSON Web Token (JWT)   | 9.x      |
| Passwords  | bcryptjs               | 3.x      |
| File upload| Multer                 | 2.x      |
| Env config | dotenv                 | 17.x     |
