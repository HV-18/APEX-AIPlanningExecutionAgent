# APEX : AI Planning & Execution Agent

APEX is an AI-driven platform that helps students plan, execute, and track academic, health, and lifestyle habits using intelligent agents. Instead of being just a chatbot, APEX acts as a **planning + execution system**—it recommends actions and helps you follow through.

---

## 🧠 What APEX Does

APEX supports three major domains:

### **📚 Education**
- Study planning and task breakdown
- Progress tracking
- Exam prep workflow

### **❤️ Health & Well-Being**
- Stress/mood check-ins
- Break reminders, hydration prompts, focus music recommendations  
  (Not "mental health therapy"—just lightweight nudges)

### **🌍 Sustainability & Lifestyle**
- Travel mode recommendations
- Habit tracking
- Awareness tips tailored for students

---
**Proposed Circular Architecture**



                          ┌──────────────────────────┐
                          │   System Integrations    │
                          └──────────────────────────┘
                                      ▲
                                      │

            ┌──────────────┬──────────────┬──────────────┬──────────────┐
            │ Education     │ Health       │ Sustainability│ Productivity │
            │   Agents      │   Agents     │    Agents     │    Agents    │
            └──────────────┴──────────────┴──────────────┴──────────────┘
                                      ▲
                                      │

                          ┌──────────────────────────┐
                          │   Core AI Engine         │
                          │ (Planner + Execution)    │
                          └──────────────────────────┘
                                      ▲
                                      │

                          ┌──────────────────────────┐
                          │ Authentication + Users   │
                          └──────────────────────────┘
                                      ▲
                                      │

                          ┌──────────────────────────┐
                          │ React UI / Frontend      │
                          └──────────────────────────┘




---

## ✨ Key Features

- **AI-assisted study schedules**
- **Chat interface for multi-domain queries**
- **Task execution tracking**
- **Secure login authentication**
- **Role-based system (planned)**

---

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn-ui
- **Backend:** Node.js (Express / planned API layer)
- **Database:** MongoDB / Planned integration
- **Auth:** JWT-based login
- **AI Layer:** Modular agents (education, health, sustainability)

---

## 🚀 Run Locally

```sh
# Clone repository
git clone <[https://github.com/HV-18/APEX-AIPlanningExecutionAgent/edit/main/README.md]>

# Navigate to project folder
cd <APEX : AI Planning & Execution Agent>

# Install dependencies
npm i

# Start dev server
npm run dev
