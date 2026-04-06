# 🎓 SmartTeach: AI-Powered Academic & Timetable Management

**SmartTeach** is a premium, full-stack educational management platform built with Next.js 14 and MongoDB. It transforms how universities manage schedules, resources, and faculty coordination using state-of-the-art AI scheduling and direct Google Drive integration.

---

## ✨ Features at a Glance

### 👨‍💼 Admin Dashboard (Central Control)
*   **Academic Structure**: Full management of Departments (BTech, BCA, MBA, etc.), Branches (CSE, Mech, Data Science), and Subjects.
*   **AI Timetable Engine**: Automatically generate complex weekly schedules based on:
    *   **Shift Management**: Morning (8:30—12:35) and Afternoon (1:00—5:00) blocks.
    *   **Interval Logic**: 40-minute classes with 5-minute transition breaks.
    *   **Inverted Lab Allotment**: Students in Morning shifts get Afternoon labs, and vice versa.
    *   **Faculty Constraints**: Limits each professor to a maximum of 4 classes per day.
    *   **Academic Calendar**: Automatic exclusion of weekends and university holidays.
*   **Faculty Leave Management**: Approve faculty leaves and trigger AI-suggested "Adjusted Classes" for smooth substitution.
*   **Moderation Hub**: Review teacher-generated lesson plans and shared resources.

### 👩‍🏫 Faculty (Teacher) Portal
*   **Direct Resource Sharing**: Upload **Syllabus** and **Lecture Notes** directly to your professional Google Drive.
*   **Dashboard Analytics**: Monitor student progress, attendance trends, and curriculum coverage.
*   **Lesson Planning**: AI-assisted tool to help generate and track comprehensive lesson plans for each subject.
*   **Schedule View**: Access your personalized timetable synchronized with official university changes.

### 👨‍🎓 Student Portal
*   **Study Material Access**: Browsable cards for all shared notes and official syllabi.
*   **Timetable Viewer**: Real-time view of class schedules, including active substitutions if a teacher is on leave.
*   **Resource Hub**: Open materials directly in the high-quality Google Drive viewer.

---

## 🛠️ Technical Powerhouse

### 🤖 AI Scheduling Engine
The heart of the project is a custom scheduling algorithm that resolves complex constraints:
*   **Inverse Shift Lab Logic**: Strategically places labs based on the student's primary shift.
*   **Overlap Prevention**: Ensures no room, faculty, or department has multiple classes simultaneously.
*   **Session Awareness**: Handles Even/Odd semesters with custom start and end dates.

### ☁️ Google Drive Integration (BYOS)
*   **Bring Your Own Storage**: Instead of centralized cloud storage, the app uses the **logged-in user's Google Drive**.
*   **Auto-Sharing**: Files are uploaded and automatically set to "Public with link" so students can view them instantly.
*   **Native Permissions**: Leverages Google's secure OAuth2 standards for data ownership.

### 🎨 Premium Aesthetics
*   **Light Glassmorphism**: High-contrast, frosted-glass UI with curated HSL color palettes.
*   **Responsive Design**: Mobile-first navigation with an optimized sidebar for all device sizes.
*   **Micro-Animations**: Smooth transitions powered by `Framer Motion`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB instance (Atlas or local)
- Google Cloud Project (for Drive and Auth)

### 2. Environment Variables (.env.local)
```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth (Authentication)
NEXTAUTH_SECRET=any_long_random_string
NEXTAUTH_URL=http://localhost:3000

# Google OAuth & Drive
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Installation
```bash
git clone https://github.com/SUKRITIAMBASTA/smartteachertasks.git
cd smartteachertasks
npm install
npm run dev
```

### 4. Initialization
Run the built-in seed route to populate your department structure and sample data:
`GET http://localhost:3000/api/debug/seed`

---

## 🏗️ Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Next.js API Routes, Mongoose (MongoDB).
- **Storage**: Google Drive API (v3).
- **Authentication**: NextAuth.js (Credentials & Google OAuth).

---

> [!NOTE]
> This project was developed with a focus on ease-of-use for both faculty and students, ensuring that technical scheduling complexities are handled by AI so teachers can focus on teaching.
