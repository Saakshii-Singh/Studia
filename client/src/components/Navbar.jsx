import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Scholar");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token) {
      setIsLoggedIn(true);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUsername(parsed.username || "Scholar");
        } catch (e) {
          setUsername("Scholar");
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 border-b border-border bg-background/55 backdrop-blur-md z-50 flex items-center justify-between px-8 shadow-soft">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-neon text-white shadow-glow transition-transform group-hover:scale-105">
          <BookOpen className="h-4 w-4" />
        </span>
        <span className="font-display text-xl font-black tracking-tight text-white">
          Studia<span className="text-accent">.</span>
        </span>
      </Link>

      {/* Navigation actions */}
      <div className="flex items-center gap-5">
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-2 text-sm font-bold text-white bg-muted/60 border border-border px-4 py-2 rounded-full">
              <User className="h-4 w-4 text-primary" />
              <span>{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-red-400 bg-red-500/10 hover:bg-red-500/25 px-4 py-2.5 rounded-full border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-accent bg-accent/10 hover:bg-accent/25 px-5 py-2.5 rounded-full border border-accent/20 transition-all"
          >
            <User className="h-3.5 w-3.5" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}