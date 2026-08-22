# DAYFLOW

<p align="center">
  <strong>Modern Human Resource Management System</strong>
</p>

<p align="center">
  A unified digital workspace for employees and administrators to manage attendance, leave, payroll, profiles, and workforce operations.
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql)

</p>

---

## Overview

**Dayflow** is a full-stack Human Resource Management System designed to bring essential employee and HR operations into one centralized platform.

Instead of relying on disconnected tools for attendance, leave requests, payroll, and employee information, Dayflow provides role-specific workspaces where employees and administrators can manage their daily HR workflows through a unified interface.

The platform is built around two primary experiences:

- **Employee Workspace** — designed for individual employees to manage their work-related information and requests.
- **Admin Workspace** — designed for administrators to manage employees, attendance, leave approvals, and payroll.

Dayflow combines a modern responsive interface with Supabase-powered authentication, database operations, and server-side authorization.

---

## Key Features

### Employee Workspace

#### Dashboard
A personalized overview of the employee's workday and HR information.

- Attendance summary
- Leave overview
- Payroll overview
- Quick access to major workflows
- Employee-specific information

#### Attendance

Employees can:

- Check in
- Check out
- View attendance history
- Review attendance status
- Track working hours

#### Leave Management

Employees can:

- Apply for leave
- Select leave type
- Select start and end dates
- Provide a reason
- View submitted requests
- Track request status

Leave requests move through:

```text
PENDING → APPROVED
       ↘ REJECTED
Payroll

Employees can view:

Basic salary
Allowances
Deductions
Net salary
Effective salary date
Profile

Employees can access their personal and professional information from a dedicated profile workspace.

Admin Workspace
Dashboard

A centralized administrative workspace for managing workforce operations.

Administrators can access:

Employee management
Attendance management
Leave requests
Payroll management
Employee Management

Administrators can view employee information including:

Employee ID
Name
Email
Department
Designation
Phone
Address
Joining date
Profile information
Attendance Management

Administrators can review employee attendance records including:

Date
Check-in
Check-out
Attendance status
Working hours
Leave Request Management

Administrators can review employee leave applications and make decisions.

Available actions include:

Review request
Approve request
Reject request
Add administrative comments

Only pending requests can be approved or rejected.

Payroll Management

Administrators can:

View salary records
Add salary records
Edit salary records
Configure basic salary
Configure allowances
Configure deductions
Set effective dates

Net salary is calculated using:

Net Salary = Basic Salary + Allowances - Deductions
Authentication & Role-Based Access

Dayflow uses a single login interface for both employees and administrators.

After authentication, the user's role is retrieved from the profile and the application automatically redirects them to the appropriate workspace.

                    ┌──────────────┐
                    │    LOGIN     │
                    └──────┬───────┘
                           │
                           ▼
                    Supabase Auth
                           │
                           ▼
                    User Profile
                           │
                ┌──────────┴──────────┐
                │                     │
          Employee Role          Admin Role
                │                     │
                ▼                     ▼
      Employee Dashboard       Admin Dashboard
Employee
/employee/dashboard
Administrator
/admin/dashboard

Administrative server actions independently verify the authenticated user's role before executing protected operations.

Core Workflows
Employee Leave Workflow
Employee Login
      │
      ▼
Employee Dashboard
      │
      ▼
Leave
      │
      ▼
Submit Leave Request
      │
      ▼
Pending
      │
      ▼
Admin Reviews Request
      │
      ├───────────────┐
      ▼               ▼
  Approved          Rejected
      │               │
      └───────┬───────┘
              ▼
      Employee sees status
Attendance Workflow
Employee
    │
    ▼
Check In
    │
    ▼
Working
    │
    ▼
Check Out
    │
    ▼
Working Hours Calculated
    │
    ▼
Attendance History
Payroll Workflow
Admin
  │
  ▼
Select Employee
  │
  ▼
Basic Salary
  +
Allowances
  -
Deductions
  │
  ▼
Net Salary
  │
  ▼
Salary Record
  │
  ▼
Employee Payroll
Technology Stack
Layer	Technology
Frontend	Next.js
UI	React
Language	TypeScript
Styling	Tailwind CSS
Components	shadcn/Base UI
Icons	Lucide React
Backend	Next.js Server Actions
Authentication	Supabase Auth
Database	PostgreSQL via Supabase
Validation	Zod
Package Manager	npm
Version Control	Git & GitHub
Architecture
┌──────────────────────────────────────────────┐
│                   DAYFLOW                    │
├──────────────────────────────────────────────┤
│                                              │
│                 Next.js App                  │
│                                              │
│     ┌────────────────┐  ┌────────────────┐  │
│     │ Employee       │  │ Admin          │  │
│     │ Workspace      │  │ Workspace      │  │
│     └───────┬────────┘  └───────┬────────┘  │
│             │                   │            │
│             └─────────┬─────────┘            │
│                       │                      │
│                 Server Actions               │
│                       │                      │
├───────────────────────┼──────────────────────┤
│                       ▼                      │
│                  Supabase                    │
│                                              │
│        ┌────────────┐   ┌──────────────┐    │
│        │    Auth    │   │ PostgreSQL   │    │
│        └────────────┘   └──────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
Project Structure
DAYFLOW/
│
├── app/
│   ├── actions/
│   │   ├── admin-leave.ts
│   │   ├── admin-payroll.ts
│   │   ├── attendance-history.ts
│   │   ├── attendance.ts
│   │   ├── auth.ts
│   │   ├── employees.ts
│   │   ├── leave-history.ts
│   │   ├── leave.ts
│   │   ├── payroll.ts
│   │   └── profile.ts
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── leave-requests/
│   │   └── payroll/
│   │
│   ├── employee/
│   │   ├── layout.tsx
│   │   ├── components/
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── payroll/
│   │   └── profile/
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── app-shell.tsx
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   └── ui/
│
├── lib/
│   └── utils.ts
│
├── public/
│
├── components.json
├── package.json
├── package-lock.json
└── README.md
Application Routes
Public
/login
Employee
/employee/dashboard
/employee/attendance
/employee/leave
/employee/payroll
/employee/profile
Admin
/admin/dashboard
/admin/attendance
/admin/leave-requests
/admin/payroll
UI & Design

Dayflow follows a modern enterprise SaaS design language focused on clarity, usability, and consistency.

Design principles
Clean visual hierarchy
Responsive layouts
Consistent spacing
Modern typography
Role-specific navigation
Clear status indicators
Interactive feedback
Loading states
Error states
Responsive mobile navigation
Reusable components

The interface uses a light workspace with deep slate surfaces and cyan accents to create a modern HR technology aesthetic.

Security

Dayflow uses server-side authorization for protected HR operations.

Protected operations verify:

Authenticated user
User profile
User role
Requested resource
Validated input

Input validation is performed using Zod where applicable.

Authentication is handled through Supabase Auth.

Sensitive credentials are stored using environment variables and should never be committed to the repository.

Getting Started
Prerequisites

Make sure you have:

Node.js
npm
Git
A Supabase project

Verify Node.js:

node --version

Verify npm:

npm --version
Installation

Clone the repository:

git clone https://github.com/MS04Monica/DAYFLOW.git

Navigate into the project:

cd DAYFLOW

Install dependencies:

npm install
Environment Variables

Create a .env.local file in the project root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Never commit .env.local or any secret credentials to GitHub.

Run Locally

Start the development server:

npm run dev

Open:

http://localhost:3000
Production Build

Verify the application before deployment:

npm run build

The production build should successfully complete:

Next.js compilation
TypeScript validation
Page generation
Production optimization
Deployment

Dayflow is designed to be deployed as a Next.js application.

Recommended deployment flow:

GitHub
   │
   ▼
Production Branch
   │
   ▼
Deployment Platform
   │
   ▼
Next.js Application
   │
   ▼
Supabase Backend

Before deployment, configure the required Supabase environment variables in the deployment platform.

Responsive Experience

Dayflow supports:

Desktop
Laptop
Tablet
Mobile

The navigation automatically adapts to smaller screens through a responsive navigation drawer.

Future Enhancements

Potential future improvements include:

HR analytics dashboard
Attendance analytics
Automated leave balance calculation
PDF payslip generation
Email notifications
Holiday calendar
Employee announcements
Performance management
Organization-wide notifications
Advanced filtering and search
Audit logs
Multi-organization support
AI-powered HR insights
Development Workflow

The project follows a collaborative Git workflow:

Feature Branch
      │
      ▼
Development
      │
      ▼
Pull Request
      │
      ▼
Code Review
      │
      ▼
Main Branch
      │
      ▼
Deployment

This keeps the main branch stable while allowing team members to work independently on features.

Why Dayflow?

Dayflow is designed around a simple principle:

HR should feel like a workflow, not paperwork.

The platform brings employee self-service and administrative HR operations together in one connected system.

Dayflow provides
One common authentication experience
Role-based workspaces
Centralized employee information
Attendance management
Leave application and approval
Payroll management
Responsive modern UI
Server-side authorization
Scalable full-stack architecture
Team

Built as a collaborative software project using modern web technologies and Git-based development practices.

License

This project was created for educational and hackathon purposes.