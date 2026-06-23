import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";       // Maps to our stunning landing page
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard"; // Maps to our group finder sanctum
import Room from "./Pages/Room";
import Verify from "./Pages/Verify"; // Maps to our secure OTP workspace
import API from "./services/api";

// 🔐 Protected Route Wrapper to enforce Authentication & Verification
function ProtectedRoute({ children, allowUnverified = false }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // 1. If not logged in, redirect to login
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but not verified, redirect to verification workspace
  if (!allowUnverified) {
    try {
      const user = JSON.parse(storedUser);
      if (!user.isVerified) {
        return <Navigate to="/verify" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

function App() {
  useEffect(() => {
    // 1. Instant local verification route guard on boot
    const enforceVerification = () => {
      const storedUser = localStorage.getItem("user");
      const path = window.location.pathname;
      if (storedUser && path !== "/verify" && path !== "/login" && path !== "/register") {
        try {
          const parsed = JSON.parse(storedUser);
          if (!parsed.isVerified) {
            window.location.href = "/verify";
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    enforceVerification();

    // 2. Fresh server profile revalidation on boot
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await API.get("/auth/me");
        const user = response.data;
        
        // Sync fresh database stats (XP, level, verification status)
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("hh_login_state_change"));

        // Enforce guard on newly returned server profile data
        const path = window.location.pathname;
        if (!user.isVerified && path !== "/verify" && path !== "/login" && path !== "/register") {
          window.location.href = "/verify";
        }
      } catch (err) {
        console.warn("Session verification failed. Logging out...", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("dev_verification_code");
        window.dispatchEvent(new Event("hh_login_state_change"));
      }
    };
    checkSession();
  }, []);

  return (
    <BrowserRouter>
      {/* Container wraps full viewport without padding/centering conflicts */}
      <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (require signing in) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/room/:id" 
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/verify" 
            element={
              <ProtectedRoute allowUnverified={true}>
                <Verify />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;