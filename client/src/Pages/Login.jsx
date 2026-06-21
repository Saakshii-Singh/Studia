import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, BookOpen, Key, Mail, Eye, EyeOff,ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      console.log("Login successful:", response.data);
      
      // Save credentials for the app session
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Dispatch custom event to refresh the Navbar state instantly
      window.dispatchEvent(new Event("hh_login_state_change"));
      
      if (response.data.user && !response.data.user.isVerified) {
        navigate("/verify");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background neon glows */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

      {/* Back to Home Button */}
      <div className="w-full max-w-md mb-4 flex justify-start z-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

        <div className="glass-panel p-8 rounded-3xl w-full max-w-md shadow-glow relative z-10 border-primary/25">
       {/* Header branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-neon text-white shadow-glow mb-4">
            <BookOpen className="h-5 w-5" />
          </span>
          <h1 className="text-3xl font-black font-display text-white tracking-tight">
            Welcome Back<span className="text-accent">.</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            Log in to study, level up, and sync your task checklists.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground/60" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-sm placeholder:text-muted-foreground/60 focus:border-primary transition-all"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <Key className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground/60" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-12 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-sm placeholder:text-muted-foreground/60 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-muted-foreground/60 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-neon py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-white shadow-glow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? "Logging In..." : "Log In"}</span>
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          New scholar?{" "}
          <Link to="/register" className="text-accent hover:underline font-bold transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}