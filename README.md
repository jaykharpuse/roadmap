# AI Roadmap Generator

Smart web app to generate, browse and share learning roadmaps for any topic.

## 🔥 Highlights
- **AI Roadmaps** – Type any topic, get a full learning path with sections, subtopics and real resources.
- **Ready‑Made Roadmaps** – Trending / popular roadmaps already available to explore.
- **Customizable** – Start from AI roadmap and follow it your way.
- **Download & Share** – Share public link or download roadmap as JSON.
- **Bookmarks & Progress** – Save roadmaps, mark nodes as in‑progress / completed.

## 🧱 Tech Stack
- **Frontend:** React, Vite, TypeScript, Redux Toolkit, Tailwind / shadcn‑ui
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO
- **AI:** OpenAI Chat Completions (gpt‑3.5‑turbo‑0125)

## 📁 Project Structure
```bash
roadmap/
├─ roadmap-backend/           # Express + MongoDB API + AI roadmap service
└─ roadmap-website-frontend/  # React client (UI, socket, pages)
```

## ⚙️ Setup
### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/roadmap.git
cd roadmap

# Backend deps
cd roadmap-backend
npm install

# Frontend deps
cd ../roadmap-website-frontend
npm install
```

### 2. Environment Variables
Create `.env` in **roadmap-backend**:
```bash
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=8000
```

Create `.env` in **roadmap-website-frontend**:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
```

## 🚀 Run Locally
### Backend
```bash
cd roadmap-backend
npm run dev
```
Backend runs on `http://localhost:8000`.

### Frontend
```bash
cd roadmap-website-frontend
npm run dev
```
Frontend runs on `http://localhost:5173`.

## 🌐 Deploy (Render quick notes)
- Create **two Web Services** on Render:
  - `roadmap-backend` – build: `npm install && npm run build`, start: `npm start`
  - `roadmap-website-frontend` – build: `npm install && npm run build`, start: `npm run preview` (or serve dist)
- Set environment variables on Render exactly like local `.env`.
- Update `VITE_API_BASE_URL` / `VITE_SOCKET_URL` to use your Render backend URL.

## 🤝 Contributing
Issues / PRs welcome. Improve prompts, add new roadmap templates, or enhance UI/UX.

## 📜 License
MIT (or your preferred license).
