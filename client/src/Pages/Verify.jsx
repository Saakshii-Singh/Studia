import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, BookOpen, ArrowRight, RefreshCw, Sparkles,ArrowLeft } from "lucide-react";

export default function Verify() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Resend and Code Expiry timers
  const [cooldown, setCooldown] = useState(0);
  const [expiry, setExpiry] = useState(600); // 10 minutes countdown
  
  // Local Developer Assist Code
  const [devCode, setDevCode] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.isVerified) {
        navigate("/dashboard");
        return;
      }
      setEmail(parsed.email);
    } catch (e) {
      navigate("/login");
    }

    // Recover dev code if set on registration
    const storedDevCode = localStorage.getItem("dev_verification_code");
    if (storedDevCode) {
      setDevCode(storedDevCode);
    }
  }, [navigate]);

  // Main countdown tickers
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    let timer;
    if (expiry > 0) {
      timer = setInterval(() => setExpiry((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [expiry]);

  // Ref focusing managers for OTP inputs
  const handleDigitChange = (index, value) => {
    // Only accept numeric inputs
    if (isNaN(value)) return;
    
    const newCode = [...code];
    // Take only the last character if they type multiple
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    // Auto-focus next input box
    if (newCode[index] !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Return on Backspace to focus previous box
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const joinedCode = code.join("");
    if (joinedCode.length < 6) {
      setError("Please input all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        code: joinedCode,
      });

      setSuccess(res.data.message || "Account verified successfully!");
      
      // Update local storage user profile state
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.isVerified = true;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      
      // Notify active listeners (e.g. Navbar)
      window.dispatchEvent(new Event("hh_login_state_change"));

      // Clean up dev helper cache
      localStorage.removeItem("dev_verification_code");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await API.post("/auth/resend-otp", { email });
      setSuccess("A fresh OTP has been successfully generated.");
      setCooldown(60); // 60 seconds rate limiting lock
      setExpiry(600); // reset 10 mins countdown
      
      if (res.data.devCode) {
        setDevCode(res.data.devCode);
        localStorage.setItem("dev_verification_code", res.data.devCode);
      } else {
        setDevCode("");
        localStorage.removeItem("dev_verification_code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 h-85 w-85 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-85 w-85 rounded-full bg-accent/5 blur-3xl" />

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
        <div className="flex flex-col items-center mb-6 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-neon text-white shadow-glow mb-4">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
            Verify Email<span className="text-accent">.</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
            Enter the 6-digit OTP code sent to your registered address: <strong className="text-white block font-semibold mt-1">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Split 6-digit digits boxes */}
          <div className="flex justify-between items-center gap-2 mt-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 rounded-xl bg-input text-center text-xl font-extrabold text-white border border-border/50 outline-none focus:border-accent focus:scale-[1.02] transition-all"
              />
            ))}
          </div>

          {/* Code expiry warning bar */}
          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground/75 px-1">
            <span>Code Expiration</span>
            <span className={expiry < 60 ? "text-red-400 font-extrabold" : "text-white font-extrabold"}>
              {formatTime(expiry)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-neon py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white shadow-glow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>Verify & Authenticate</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Resend actions cooldown mixer */}
        <div className="flex flex-col items-center justify-center gap-2.5 mt-6 border-t border-border/20 pt-5">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              cooldown > 0
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-accent hover:text-white cursor-pointer hover:underline"
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>{cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Verification Code"}</span>
          </button>

          <Link
            to="/login"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("dev_verification_code");
              window.dispatchEvent(new Event("hh_login_state_change"));
            }}
            className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 hover:text-red-400 transition-colors"
          >
            Cancel & Back to Log In
          </Link>
        </div>

        {/* Dev Mode Code Assist Box */}
        {devCode && window.location.hostname === "localhost" && (
          <div className="mt-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 p-3.5 text-center text-[10px] text-teal-400 font-semibold relative overflow-hidden">
            <Sparkles className="h-3.5 w-3.5 inline mr-1.5 align-text-bottom text-teal-300 animate-pulse" />
            Dev Mode Code: <span className="font-mono text-xs tracking-widest bg-white/10 px-2.5 py-1 rounded border border-teal-500/30 text-white font-bold ml-1">{devCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}
