import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import RoomCard from "../components/RoomCard";
import { motion } from "framer-motion";
import { Plus, Search, Award, Sparkles, X } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 100 },
  },
};

const CATEGORIES = ["All", "Coding", "Mathematics", "Science", "Writing", "Languages"];
const CATEGORY_ICONS = {
  All: "🌍",
  Coding: "💻",
  Mathematics: "📐",
  Science: "🔬",
  Writing: "📝",
  Languages: "🗣️",
};

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState("alltime");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Create Group Form state
  const [roomName, setRoomName] = useState("");
  const [subject, setSubject] = useState("General");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error.message);
    }
  };

  const fetchLeaderboard = async (filterVal) => {
    setLeaderboardLoading(true);
    try {
      const res = await API.get(`/study/leaderboard?filter=${filterVal}`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err.message);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchLeaderboard(leaderboardFilter);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    const handleLoginChange = () => {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      else setUser(null);
    };
    window.addEventListener("studia_login_state_change", handleLoginChange);
    return () => window.removeEventListener("studia_login_state_change", handleLoginChange);
  }, [leaderboardFilter]);

  const createRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError("Please provide a group name.");
      return;
    }

    try {
      await API.post("/rooms/create", {
        roomName: roomName.trim(),
        subject,
        description: description.trim(),
      });
      fetchRooms();
      setRoomName("");
      setSubject("General");
      setDescription("");
      setError("");
    } catch (error) {
      setError("Failed to create study group. Ensure you are logged in!");
    }
  };

  // Live filter groups by search query and category
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory =
      selectedCategory === "All" || room.subject === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
       <div className="min-h-screen w-full bg-background pt-24 pb-12 flex flex-col items-center">
      {/* Floating Navbar */}
      <Navbar />

      {/* Back to Home Button */}
      <div className="w-full max-w-6xl px-6 mt-4 flex justify-start">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Grid Container */}
      <div className="w-full max-w-6xl px-6 grid gap-8 md:grid-cols-[1.1fr_2.5fr] items-start mt-4">
        
        {/* Left Column: Profile Card, Badges, Leaderboard, & Upgraded Study Group Form */}
        <div className="flex flex-col gap-6">
          {/* Stats Greeting */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border-primary/15">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              Welcome, {user ? user.username : "Scholar"}! 
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discover and search for focused study groups, or launch your own specific course sanctum to start co-studying!
            </p>
            {user && (
              <div className="mt-4 flex items-center gap-2 bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-xs font-bold text-primary">
                <Award className="h-4 w-4" />
                <span>Level {user.level || 1} Focus Scholar</span>
              </div>
            )}
          </div>

          {/* Scholar Badges Panel */}
          {user && (
            <div className="glass-panel p-6 rounded-3xl border-primary/15 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Award className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Scholar Badges
                </h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { id: "novice_scholar", label: "Novice Scholar", emoji: "🎓", desc: "Logged your first study session" },
                  { id: "deep_worker", label: "Deep Worker", emoji: "🚀", desc: "Completed a 50+ min study session" },
                  { id: "night_owl", label: "Night Owl", emoji: "🦉", desc: "Studied between 12:00 AM and 4:00 AM" },
                  { id: "unstoppable", label: "Unstoppable", emoji: "🔥", desc: "Maintained a 7-day study streak" },
                  { id: "focus_champion", label: "Focus Champion", emoji: "🏆", desc: "Reached Scholar Level 5" },
                ].map((badge) => {
                  const isUnlocked = user.badges && user.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`relative group flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                        isUnlocked
                          ? "bg-primary/10 border-primary/30 text-white"
                          : "bg-muted/30 border-border/20 text-muted-foreground/30 opacity-40 filter grayscale"
                      }`}
                      title={`${badge.label}: ${badge.desc}`}
                    >
                      <span className="text-xl mb-1">{badge.emoji}</span>
                      
                      {/* CSS Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30">
                        <div className="bg-black/95 text-white text-[10px] p-2.5 rounded-xl shadow-glow border border-border/45 w-44 text-center leading-normal">
                          <p className="font-extrabold text-primary mb-0.5">{badge.label}</p>
                          <p className="text-[9px] text-muted-foreground">{badge.desc}</p>
                          <p className={`text-[8px] font-black uppercase mt-1.5 ${isUnlocked ? 'text-emerald-400' : 'text-accent'}`}>
                            {isUnlocked ? 'Unlocked ✓' : 'Locked'}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-black/95 rotate-45 -mt-1 border-r border-b border-border/45" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leaderboard Panel */}
          <div className="glass-panel p-6 rounded-3xl border-primary/15 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-accent animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Top Scholars
                </h3>
              </div>
              
              {/* Leaderboard Tabs */}
              <div className="flex gap-1 bg-input/50 p-1 rounded-xl border border-border/30">
                {["daily", "weekly", "alltime"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setLeaderboardFilter(f)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      leaderboardFilter === f
                        ? "bg-primary text-background font-black"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {f === "alltime" ? "All" : f === "weekly" ? "Week" : "Day"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scores List */}
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {leaderboardLoading ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Syncing scores...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No sessions logged in this timeframe.
                </div>
              ) : (
                leaderboard.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      user && row.username === user.username
                        ? "bg-primary/15 border-primary/45"
                        : "bg-muted/10 border-border/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Indicator */}
                      <span className={`w-5 h-5 shrink-0 rounded-md font-black text-[10px] flex items-center justify-center ${
                        row.rank === 1 ? 'bg-amber-500 text-background font-extrabold shadow-glow' :
                        row.rank === 2 ? 'bg-slate-300 text-background' :
                        row.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-input text-muted-foreground'
                      }`}>
                        {row.rank}
                      </span>
                      
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                          {row.username}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          Lvl {row.level} Scholar
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="text-xs font-bold text-accent font-mono leading-none">
                        {row.hours}h
                      </span>
                      {row.streak > 0 && (
                        <span className="text-[8px] font-bold text-rose-400 mt-0.5">
                          🔥 {row.streak}d
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upgraded Group Creation Form */}
          <div className="glass-panel p-6 rounded-3xl border-primary/15">
            <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Launch Study Group
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-semibold text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={createRoom} className="flex flex-col gap-4">
              {/* Group Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., LeetCode Sprint 🚀"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-xs placeholder:text-muted-foreground/60 focus:border-accent focus:shadow-cyanGlow transition-all"
                />
              </div>

              {/* Subject Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Course Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-xs focus:border-accent transition-all"
                >
                  <option value="General">General / All-Purpose</option>
                  <option value="Coding">Coding & Development</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Sciences & Physics</option>
                  <option value="Writing">Writing & Literature</option>
                  <option value="Languages">Languages</option>
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center select-none">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Group description</label>
                  <span className="text-[9px] font-bold text-muted-foreground">{description.length}/200</span>
                </div>
                <textarea
                  placeholder="e.g., Studying algorithms, sharing screens, and using Pomodoro! Join to chat."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength="200"
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-xs placeholder:text-muted-foreground/60 focus:border-accent focus:shadow-cyanGlow transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-neon py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white shadow-glow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Launch Group</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Group Discovery, Search Bar, Subject Category Filters, and Live List */}
        <div className="flex flex-col gap-6">
          {/* Header Finder Panel */}
          <div className="flex flex-col gap-4 border-b border-border/40 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">
                Study Group Finder
              </h2>
              <span className="self-start text-[10px] uppercase tracking-widest font-black text-accent bg-accent/15 border border-accent/20 px-3 py-1.5 rounded-md">
                {filteredRooms.length} Groups Discovered
              </span>
            </div>

            {/* Interactive Search input */}
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 h-4.5 w-4.5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search groups by keywords, description, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-input text-white border border-border/50 outline-none text-xs placeholder:text-muted-foreground/50 focus:border-primary focus:shadow-glow transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 p-1 rounded-md text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Subject Categories Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-primary text-background font-bold shadow-glow"
                      : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted/80 hover:text-white"
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat] || "📋"}</span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Study Groups list */}
          {filteredRooms.length === 0 ? (
            <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center gap-3 border-dashed">
              <span className="text-4xl">🔬</span>
              <h3 className="text-lg font-bold text-white">No groups found</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                We couldn't find any study groups matching your search or category filters. Try starting a new group or clearing the search!
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-5 sm:grid-cols-2"
            >
              {filteredRooms.map((room) => (
                <motion.div key={room._id} variants={cardVariants}>
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
