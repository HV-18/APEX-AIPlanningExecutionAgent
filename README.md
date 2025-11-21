# APEX : AI Planning & Execution Agent

Welcome to **APEX**, your AI-powered companion for academic excellence and holistic well-being.

APEX helps students plan, execute, and track their study, health, and lifestyle habits in one place using intelligent AI agents.

---

## 🔗 Live Application

- **Auth / Login**: [http://10.0.14.9:8081/auth](http://10.0.14.9:8081/auth)

> Note: This URL is accessible only inside the configured network (e.g., campus / local network).

---

## 🧠 What is APEX?

APEX is an AI-driven platform built for students to manage:

- **Education** – Study planning, reminders, task breakdown, exam preparation
- **Health** – Stress check-ins, basic wellness tips, focus music suggestions
- **Sustainability** – Travel mode suggestions, eco-friendly choices, habit nudges

Instead of being “just a chatbot”, APEX acts like a **planning + execution agent**:
it helps you **decide what to do** and then **actually follow through**.

---

## ✨ Core Features

- 📚 **Smart Study Planner**
  - Create subject-wise plans and tasks
  - Break big goals into daily/weekly sessions
  - Track completion and pending work

- ❤️ **Health & Well-being Support**
  - Simple self-checks for mood and stress
  - Suggestions like breaks, sleep, hydration, and focus music
  - Gentle nudges instead of spammy notifications

- 🌍 **Sustainable Living & Travel**
  - Ask how to travel more sustainably (mode suggestions, carbon-aware choices)
  - Keep a log of your daily travel and habits
  - Awareness tips that actually fit a student lifestyle

- 💬 **Chat-first Experience**
  - Interact with APEX like chatting with a friend
  - Ask about studies, health, or sustainability in one place
  - Context-aware responses instead of random advice

- 🔐 **Secure Auth System**
  - Login via: [http://10.0.14.9:8081/auth](http://10.0.14.9:8081/auth)
  - Role-based access planned for students/admins (can be extended later)

---

## 🛠 Tech Stack

> Update this to match your actual stack, but here’s a sane default:

- **Frontend:** React / Next.js (TypeScript) + Tailwind CSS
- **Backend:** Node.js (Express / NestJS)
- **Database:** MongoDB / PostgreSQL
- **Auth:** JWT-based authentication
- **AI Layer:** Custom agents for education, health, and sustainability logic

---

## 🚀 Running the Project Locally

```sh
# 1. Clone the repository
git clone <your-repo-url>
cd <your-project-folder>

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/650bb2e9-ca18-47f2-9534-a125176b46d6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
