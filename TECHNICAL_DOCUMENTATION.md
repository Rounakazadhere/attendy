# Rural School Attendance Management System
## Technical Documentation & Developer Guide

---

## 1. Executive Summary
This project is an **Offline-First School Attendance Management System** designed specifically for rural areas with intermittent internet connectivity. It empowers Principals, Teachers, and Parents with role-specific dashboards to manage student data, track attendance, and communicate effectively.

**Core Value Proposition:**
*   **Zero-Downtime Operation**: Teachers can mark attendance without active internet.
*   **Role-Based Security**: Strict access control for different stakeholder levels.
*   **Real-Time Synchronization**: Automatic data sync when connectivity is restored.

---

## 2. System Architecture
The application follows a modern **Monolithic Client-Server Architecture** with a loosely coupled frontend and backend, enabling independent scaling and development.

### High-Level Components
*   **Client**: React.js Single Page Application (SPA) utilizing Vite for high-performance delivery.
*   **Server**: Node.js/Express.js REST API handling business logic and data persistence.
*   **Database**: MongoDB (NoSQL) for flexible schema design and rapid iteration.
*   **Real-Time Channel**: Socket.io WebSocket server for instant "push" updates (e.g., live attendance counters).

### Offline Sync Mechanism
1.  **Detection**: The client listens for `window.addEventListener('online')` and `('offline')` events.
2.  **Queueing**: When offline, write operations (like `POST /attendance`) are intercepted and saved to `localStorage` under the key `offline_student_attendance`.
3.  **Visualization**: A global banner alerts the user to "Offline Mode".
4.  **Reconciliation**: Upon network restoration, the queue is processed sequentially (FIFO). Successful syncs update the UI immediately.

---

## 3. Technology Stack

### A. Frontend (`/frontend`)
| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | **React** | v19.1.1 | Component-based UI library. |
| **Build Tool** | **Vite** | v6.0 | Fast HMR and production bundling. |
| **Routing** | **React Router DOM** | v7.10 | Client-side navigation & protection. |
| **Language** | **JavaScript** | ES6+ | Core logic (JSX). |
| **Styling** | **Tailwind CSS** | v4.1 | Utility-first styling system. |
| **Icons** | **Lucide React** | v0.561 | Consistent SVG iconography. |
| **Animations** | **Framer Motion** | v12.23 | Complex UI transitions. |
| **State** | **Context API** | Native | Global Auth & Theme management. |
| **HTTP Client** | **Axios** | v1.13 | API requests with interceptors. |
| **Charts** | **Recharts** | v3.5 | Data visualization widgets. |
| **PWA** | **Vite PWA** | v1.2 | Service Worker generation. |

### B. Backend (`/backend`)
| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | **Node.js** | LTS | Server-side JavaScript execution. |
| **Framework** | **Express.js** | v5.2.1 | API routing & Middleware. |
| **Database** | **MongoDB** | v7+ | Data persistence. |
| **ODM** | **Mongoose** | v9.0.1 | Data validation & Schema definition. |
| **Real-time** | **Socket.io** | v4.8.1 | WebSockets for live events. |
| **Auth** | **JWT** | v9.0 | Stateless token-based auth. |
| **Security** | **Bcrypt.js** | v3.0 | Password hashing. |
| **Email** | **Nodemailer** | v7.0 | Transactional emails (Reset Password). |
| **Uploads** | **Multer** | v2.0 | Multipart form data handling. |

---

## 4. Database Schema (MongoDB)

The following collections handle the core data logic:

### Core Entities
*   **Users**: Stores credentials and roles (`PRINCIPAL`, `TEACHER`, `PARENT`, `ADMIN`).
    *   *Fields*: `email`, `password` (hashed), `role`, `name`, `resetPasswordToken`.
*   **Students**: Profile data.
    *   *Fields*: `name`, `rollNumber`, `classId` (Ref: Class), `parentEmail`.
*   **Classes**: Metadata for school structure.
    *   *Fields*: `className` (e.g., "10"), `section` (e.g., "A"), `teacherId` (Ref: User).

### Operational Data
*   **Attendances**: Daily logs.
    *   *Fields*: `date`, `status` (Present/Absent/Late), `studentId`, `markedBy`.
    *   *Index*: Compound unique index on `studentId` + `date` to prevent duplicates.
*   **Leaves**: Staff leave requests.
    *   *Fields*: `applicantId`, `dates`, `reason`, `status` (Pending/Approved/Rejected).
*   **Notices**: Global announcements.
    *   *Fields*: `title`, `content`, `audience`, `createdAt`.

---

## 5. Security & Authentication Flow

1.  **Login**: User submits credentials.
2.  **Verification**: Backend hashes input password & compares with DB hash (`bcrypt.compare`).
3.  **Token Issuance**: Server signs a JWT containing `{ id: user._id, role: user.role }`.
4.  **Storage**: Client stores JWT in `localStorage`.
5.  **Protection**:
    *   **Client**: `ProtectedRoute` wrapper checks for token presence.
    *   **Server**: `authMiddleware.protect` validates the JWT signature on every private request.
6.  **Authorization**: `authorize('PRINCIPAL')` middleware ensures only principals can hit admin routes.

---

## 6. Directory Structure

### Frontend (`/frontend/src`)
*   `components/`: Reusable pure UI components (`Nav`, `Button`).
    *   `dashboard/`: Context-specific widgets (`AttendanceWidget`, `NoticeWidget`).
*   `context/`: Global providers (`AuthContext.jsx`).
*   `pages/`: Route-level views.
    *   `PrincipalDashboard.jsx`: Aggregates widgets for admin view.
    *   `Attendance.jsx`: Contains the core offline logic.
*   `lib/` & `utils/`: Helper functions.

### Backend (`/backend`)
*   `routes/`: API endpoint definitions (`authRoutes.js`, `noticeRoutes.js`).
*   `models/`: Mongoose schemas.
*   `middleware/`: Security and error handling layers.
*   `index.js`: App entry point.

---

## 7. Setup & Installation
1.  **Prerequisites**: Node.js (v18+), MongoDB (Local or Atlas).
2.  **Environment Variables**:
    *   Backend: `PORT=5555`, `MONGO_URI=...`, `JWT_SECRET=...`
3.  **Run Backend**:
    *   `cd backend`
    *   `npm install`
    *   `npm run dev` (Runs on port 5555)
4.  **Run Frontend**:
    *   `cd frontend`
    *   `npm install`
    *   `npm run dev` (Runs on port 5173)

---

**Developed by**: Antigravity (Google Deepmind)
**Date**: December 2025
