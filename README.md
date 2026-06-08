# Studia (FocusSphere) 📚✨

🚀 **Live Deployment:** [studia-one.vercel.app](https://studia-one.vercel.app)

Studia is a premium, real-time MERN stack co-studying suite designed to bring students together in focused virtual rooms. Say goodbye to isolation and hello to shared productivity with integrated Pomodoro clocks, real-time chat, ambient soundboards, and deep focus lockdown guards.

---

## 🚀 Key Features

* **Real-time Synchronized Rooms:** Study rooms synced via WebSockets (Socket.io) showing who is actively studying in each sanctum.
* **Deep Focus Lockdown Mode:** 
  * Immersive browser fullscreen transition when the study clock starts.
  * Real-time visibility and window focus detection.
  * Synthetic Web Audio warning alarm tone (`140Hz` buzzer) and XP deduction penalty if you leave the tab.
  * Browser exit prevention prompt (`beforeunload`) to guard your active streak.
* **Ambient Soundboard Customizer:** Integrated mixer for Soft Rain, Lofi Beats, Cozy Fireplace, and Ambient Cafe sounds with quick preset mixes.
* **Interactive Study Checklist:** A persistent study planner/checklist that saves automatically to database profiles or client local storage.
* **Production-Grade Authentication:**
  * Interactive password visibility eye toggles.
  * Live password complexity evaluation meter on signup (Weak 🔴, Medium 🟡, Strong 🟢).
  * Secure Email OTP verification with rate-limited resends and custom Gmail SMTP transporters.
  * Mount-level token revalidation (`/auth/me`) to keep EXP/levels in sync and handle expired sessions gracefully.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Framer Motion
* **Backend:** Node.js, Express.js, Socket.io, Nodemailer, JSON Web Tokens (JWT)
* **Database:** MongoDB (Mongoose ODM)

---

## 💻 Getting Started Locally

### The Easy Way (Windows Launcher)
If you are on Windows, simply double-click the **`run-local.bat`** script in the project root. This launcher automatically:
1. Verifies if MongoDB is active on port `27017`.
2. Installs dependencies inside `/server` and starts the Express backend.
3. Installs dependencies inside `/client` and starts the Vite development server.

### The Manual Way
1. **Clone the repository.**
2. **Setup Server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `/server` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   ```
   Start the server:
   ```bash
   npm run dev  # (or node server.js)
   ```

3. **Setup Client:**
   ```bash
   cd client
   npm install
   ```
   Start the Vite frontend:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📦 Production Deployment

### 1. Backend Service (Render or Railway)
Deploy the `/server` directory:
* **Build Command:** `npm install`
* **Start Command:** `npm start`
* **Required Env Variables:**
  * `MONGO_URI`: *Your MongoDB connection string*
  * `JWT_SECRET`: *Your JWT secret*
  * `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (for real Email OTP sending)

### 2. Frontend Static Site (Vercel or Netlify)
Deploy the `/client` directory:
* **Framework Preset:** `Vite`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Required Env Variables:**
  * `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api` (Render backend URL with `/api` suffix)
  * `VITE_SOCKET_URL`: `https://your-backend-url.onrender.com` (Render backend URL without `/api`)
* **SPA Routing:** A `vercel.json` rewrite file is already configured inside `/client` to prevent route-not-found issues on page refreshes.

---

## 🌸 Authors & License
Developed as a premium wellness and study application suite. Built under the MIT License.
