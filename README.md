# 🎓 EduFlow LMS

![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-Active%20Development-green)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20NestJS%20%7C%20PostgreSQL-blueviolet)

> **The "Innovation-First" Learning Management System.**
> Built to replace Moodle with a modern, fast, and engaging learning experience.

---

## 🚀 Overview

**EduFlow** is not just another LMS. While traditional platforms focus on *delivering content*, EduFlow focuses on **creating outcomes**. We combine a world-class course learning experience with a unique **Innovation Hub** that empowers learners to turn knowledge into real-world projects.

### ✨ Why EduFlow?

- **🎨 Modern & Beautiful**: Built with Next.js and Tailwind CSS, offering a mobile-first, app-like experience that students actually enjoy using.
- **💡 Innovation Hub**: A dedicated ecosystem for students to pitch ideas, find mentors, and get funding—integrated directly into the learning flow.
- **⚡ Performance First**: Zero page reloads, instant navigation, and offline-ready architecture.
- **🧘 Distraction-Free Learning**: A purpose-built course player that maximizes focus.

---

## 🏆 Key Features

### ✅ Currently Live
- **Comprehensive Course Builder**: Drag-and-drop curriculum design for Instructors.
- **Rich Media Support**: Host Video, PDF, and Text lessons seamlessly.
- **Integrated Quizzes**: Assess knowledge instantly within lessons.
- **Dynamic Progress Tracking**: Visual progress bars and completion status.
- **Role-Based Access**: Granular permissions for Admins, Instructors, and Students.

### 🚧 Coming Soon (The Roadmap)
- **Innovation Ecosystem**: Submit projects, get peer reviews, and showcase work.
- **AI Mentorship Matching**: Smart algorithms to connect students with industry experts.
- **Gamification Layer**: XP, Badges, and Leaderboards to drive retention.
- **Advanced Analytics**: "At-risk" student detection for early intervention.

---

## 🛠️ Quick Start

Want to run EduFlow locally?

### 1. Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/eduflow.git
cd eduflow

# Install dependencies
npm install

# Start the database
docker-compose up -d

# Run database migrations
cd apps/api && npm run migration:run && cd ../..

# Start the development server (Frontend + Backend)
npx turbo run dev
```

Visit **http://localhost:3000** to see the app!

---

## 📚 Documentation

- [**Project Status**](./docs/PROJECT_STATUS.md): What's done, what's broken, and what's next.
- [**Roadmap**](./docs/ROADMAP.md): The strategic plan for the next 6 months.
- [**Architecture**](./docs/ARCHITECTURE.md): Deep dive into the Tech Stack and System Design.

---

## 🤝 Contributing

We welcome contributions! Please check the [Roadmap](./docs/ROADMAP.md) for "Up for Grabs" features.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
