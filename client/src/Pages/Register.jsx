import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, BookOpen, Key, Mail, User, Eye, EyeOff,ArrowLeft } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Live password complexity evaluations
  const password = formData.password;
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthScore = (hasMinLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  const getStrengthLabel = () => {
    if (!password) return { label: "", color: "bg-white/10", text: "text-muted-foreground" };
    if (strengthScore === 1) return { label: "Weak 🔴", color: "bg-red-500", text: "text-red-400" };
    if (strengthScore === 2) return { label: "Medium 🟡", color: "bg-amber-500", text: "text-amber-400" };
    return { label: "Strong 🟢", color: "bg-emerald-500", text: "text-emerald-400" };
  };

  const strengthDetails = getStrengthLabel();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/register", formData);
      console.log("Registration successful:", response.data);
      
      // Auto-login the user immediately on successful register
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      if (response.data.devCode) {
        localStorage.setItem("dev_verification_code", response.data.devCode);
      } else {
        localStorage.removeItem("dev_verification_code");
      }

      // Notify Navbar
      window.dispatchEvent(new Event("hh_login_state_change"));
      
      navigate("/verify");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
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
            Create Account<span className="text-accent">.</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            Join thousands of students studying together in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username field */}
          <div className="relative">
            <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground/60" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-sm placeholder:text-muted-foreground/60 focus:border-primary transition-all"
            />
          </div>

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

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-1 flex flex-col gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-muted-foreground">Strength:</span>
                <span className={`font-black ${strengthDetails.text}`}>{strengthDetails.label}</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthDetails.color}`}
                  style={{ width: `${(strengthScore / 3) * 100}%` }}
                />
              </div>
              
              {/* Requirements checklist */}
              <div className="flex flex-col gap-1.5 mt-1.5 text-muted-foreground font-bold text-[9px] uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <span className={hasMinLength ? "text-emerald-400" : "text-red-400"}>
                    {hasMinLength ? "✔" : "✖"}
                  </span>
                  <span className={hasMinLength ? "text-emerald-400" : ""}>At least 6 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={hasNumber ? "text-emerald-400" : "text-red-400"}>
                    {hasNumber ? "✔" : "✖"}
                  </span>
                  <span className={hasNumber ? "text-emerald-400" : ""}>Contains a digit (0-9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={hasSpecial ? "text-emerald-400" : "text-red-400"}>
                    {hasSpecial ? "✔" : "✖"}
                  </span>
                  <span className={hasSpecial ? "text-emerald-400" : ""}>Contains a symbol (e.g. !, @, #)</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-neon py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-white shadow-glow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            <span>{loading ? "Creating..." : "Sign Up"}</span>
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Already a member?{" "}
          <Link to="/login" className="text-accent hover:underline font-bold transition-all">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}