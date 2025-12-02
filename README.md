# ⚡ Sudo Focus

> **Earn your scroll.** A productivity ecosystem that blocks distracting sites until you solve a LeetCode problem.

<img width="1904" height="888" alt="image" src="https://github.com/user-attachments/assets/9027c528-1e4d-4e12-a33d-951771dc4974" />
<img width="1460" height="753" alt="image" src="https://github.com/user-attachments/assets/075f7067-1486-40a2-b4d5-9253139ba410" />
<img width="1295" height="782" alt="image" src="https://github.com/user-attachments/assets/d6307e86-d74d-4f4f-9694-871726bffa68" />




## 🚀 Overview

Sudo Focus is a habit-building platform for developers. It intercepts requests to leisure sites (like Instagram or X) and redirects you to LeetCode. Only by successfully submitting a solution does the system grant you a temporary "Unlock Token" or a "Day Pass" if you hit your daily target.

**Core Philosophy:** Turn dopamine-driven distractions into productive coding streaks.

## ✨ Features

* **🔒 Intelligent Blocking:** Automatically blocks a configurable list of distracting websites.
* **🧠 Proof of Work:** Verifies LeetCode submissions in real-time using a custom Chrome Extension (DOM Mutation Observers).
* **⏱️ Reward System:**
    * **Standard:** Solve 1 problem = Get 30 mins (configurable) of access.
    * **Freedom Mode:** Hit your daily goal (e.g., 3 problems) = Unlocked for the rest of the day.
* **📊 Analytics Dashboard:** Track your daily velocity, visualize streaks with heatmaps, and view detailed logs of solved problems.
* **🛡️ Anti-Cheat:** Distinguishes between page refreshes and actual code submissions to ensure integrity.

## 🛠️ Tech Stack

* **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts.
* **Backend:** Node.js, Express.
* **Database:** MongoDB (Persistent Data), Redis (Session Caching & TTL Timers).
* **Extension:** Chrome Manifest V3, JavaScript.
* **DevOps:** Docker (for local DB/Cache orchestration).

## 🏗️ Architecture
<img width="854" height="1435" alt="diagram-export-12-2-2025-11_45_14-PM" src="https://github.com/user-attachments/assets/c40d47db-1adf-4231-aba0-b1c3b5fdb361" />

The Chrome Extension acts as a client that syncs state with the centralized Backend.

1.  **Interception:** Extension blocks specific URLs.
2.  **Verification:** Extension watches LeetCode DOM for the "Success" state.
3.  **Synchronization:** Extension signals Backend -> Backend updates Redis/Mongo -> Backend returns "Unlocked" status.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Docker & Docker Compose (Recommended for DBs)
* Google Chrome

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/sudo-focus.git](https://github.com/YOUR_USERNAME/sudo-focus.git)
cd sudo-focus

2. Infrastructure Setup (Database)
Spin up MongoDB and Redis instantly using Docker. I have used MongoDB Compass
docker-compose up -d

3. Backend Setup 
cd backend
npm install

# Create Environment Variables
echo "PORT=3000" > .env
echo "MONGO_URI=mongodb://127.0.0.1:27017/sudofocus" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env

# Start Server
npm run dev

Backend runs on: http://localhost:3000

4. Frontend Setup
Open a new terminal.
cd frontend
npm install

# Create Environment Variables
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
echo "NEXT_PUBLIC_USER_EMAIL=test@user.com" >> .env.local

# Start Dashboard
npm run dev
Frontend runs on: http://localhost:3001 (Type 'y' if asked to use port 3001)

. Extension Setup
Open Chrome and navigate to chrome://extensions.

Toggle Developer mode (top right).

Click Load unpacked.

Select the extension folder from this project.

Pin the Sudo Focus extension to your toolbar.

🎮 How to Use
Initial State: Open http://localhost:3001. You should see the status as "Access Restricted".

Try to Slack Off: Open a new tab and go to instagram.com (or any site you added to the block list). You will be redirected to LeetCode.

Do the Work: Solve any problem on LeetCode.

Note: You must click the Submit button or press Ctrl+Enter.

Get the Reward: Once accepted, you will get an alert. Instagram is now unlocked!

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
