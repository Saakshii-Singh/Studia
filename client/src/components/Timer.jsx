import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, RotateCcw, Coffee, Zap, Award, CheckCircle, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import socket from "../socket/socket";

export default function Timer({ roomName, category = "General", onSessionSaved }) {
  const { id: roomId } = useParams();

  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [showSettings, setShowSettings] = useState(false);

  // Custom Celebratory Modals state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [modalDetails, setModalDetails] = useState({ duration: 0, xp: 0, level: 1 });

  const intervalRef = useRef(null);

  // Web Audio API Celebrate Chime (synthetic high-frequency chord)
  const playChime = (isLevelUp = false) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(isLevelUp ? 880.00 : 587.33, ctx.currentTime); // A5 or D5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(isLevelUp ? 1318.51 : 880.00, ctx.currentTime); // E6 or A5

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isLevelUp ? 2.5 : 1.8));

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + (isLevelUp ? 2.5 : 1.8));
      osc2.stop(ctx.currentTime + (isLevelUp ? 2.5 : 1.8));
    } catch (e) {
      console.log("Audio chime playback blocked:", e);
    }
  };

  // --- Real-time Pomodoro Sockets Syncing ---
  useEffect(() => {
    // Listen for incoming timer sync actions
    socket.on("timer_sync_event", ({ action, minutes: syncMins, seconds: syncSecs, isBreak: syncBreak, category: syncCat }) => {
      if (action === "play") {
        setMinutes(syncMins);
        setSeconds(syncSecs);
        setIsBreak(syncBreak);
        setIsActive(true);
      } else if (action === "pause") {
        setIsActive(false);
      } else if (action === "reset") {
        setIsActive(false);
        setMinutes(syncMins);
        setSeconds(syncSecs);
        setIsBreak(syncBreak);
      } else if (action === "state_reply") {
        setMinutes(syncMins);
        setSeconds(syncSecs);
        setIsBreak(syncBreak);
        setIsActive(syncBreak);
      }
    });

    // Handle timer state requests when a new student joins
    socket.on("timer_need_state", ({ requesterId }) => {
      // Respond with our current countdown state
      socket.emit("timer_provide_state", {
        room: roomId,
        requesterId,
        minutes,
        seconds,
        isActive,
        isBreak,
        category,
      });
    });

    // Request the active state from the room leader immediately on join
    socket.emit("timer_request_state", { room: roomId });

    return () => {
      socket.off("timer_sync_event");
      socket.off("timer_need_state");
    };
  }, [roomId, minutes, seconds, isActive, isBreak, category]);

  // Main countdown timer ticker
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed!
            playChime(false);
            clearInterval(intervalRef.current);
            setIsActive(false);

            if (!isBreak) {
              saveStudySession(customWorkTime);
              setIsBreak(true);
              setMinutes(5); // 5 min break
            } else {
              setIsBreak(false);
              setMinutes(customWorkTime);
            }
          } else {
            setMinutes((m) => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((s) => s - 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, seconds, minutes, isBreak, customWorkTime]);

  const saveStudySession = async (mins) => {
    try {
      const response = await API.post("/study/log", {
        duration: mins,
        category,
        roomName: roomName || "Virtual Sanctum",
      });

      const earnedXp = mins * 10;
      let finalLevel = 1;
      let hasLeveledUp = false;

      if (response.data.userStats) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.xp = response.data.userStats.xp;
          userObj.level = response.data.userStats.level;
          userObj.studyStreak = response.data.userStats.studyStreak;
          userObj.totalStudyTime = response.data.userStats.totalStudyTime;
          localStorage.setItem("user", JSON.stringify(userObj));
          window.dispatchEvent(new Event("hh_login_state_change"));
        }
        finalLevel = response.data.userStats.level;
        hasLeveledUp = response.data.userStats.leveledUp;
      }

      // Configure and open gorgeous celebratory modal rather than native alert boxes!
      setModalDetails({
        duration: mins,
        xp: earnedXp,
        level: finalLevel,
      });

      if (hasLeveledUp) {
        playChime(true);
        setShowLevelUpModal(true);
      } else {
        setShowSessionModal(true);
      }

      if (onSessionSaved) onSessionSaved();
    } catch (error) {
      console.error("Failed to sync study session to cloud:", error.message);
    }
  };

  const handleToggle = () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    
    // Broadcast action
    socket.emit("timer_sync_control", {
      room: roomId,
      action: nextActive ? "play" : "pause",
      minutes,
      seconds,
      isBreak,
      category,
    });
  };

  const handleReset = () => {
    const defaultMins = isBreak ? 5 : customWorkTime;
    setIsActive(false);
    setMinutes(defaultMins);
    setSeconds(0);

    // Broadcast reset
    socket.emit("timer_sync_control", {
      room: roomId,
      action: "reset",
      minutes: defaultMins,
      seconds: 0,
      isBreak,
      category,
    });
  };

  const applyCustomSettings = (newMins) => {
    setCustomWorkTime(newMins);
    setIsActive(false);
    setIsBreak(false);
    setMinutes(newMins);
    setSeconds(0);
    setShowSettings(false);

    // Broadcast settings update
    socket.emit("timer_sync_control", {
      room: roomId,
      action: "reset",
      minutes: newMins,
      seconds: 0,
      isBreak: false,
      category,
    });
  };

  const totalSecs = (isBreak ? 5 : customWorkTime) * 60;
  const currentSecs = minutes * 60 + seconds;
  const percentComplete = ((totalSecs - currentSecs) / totalSecs) * 100;

  return (
    <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center border-primary/20 shadow-glow w-full max-w-sm relative">
      <span className={`absolute top-4 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 tracking-wider uppercase ${
        isBreak ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20" : "text-violet-400 bg-violet-500/10 border border-violet-500/20"
      }`}>
        {isBreak ? <Coffee className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
        <span>{isBreak ? "Recharge Break" : "Focus Core"}</span>
      </span>

      {/* Timer Circular Display */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <h2 className="text-6xl font-black font-display text-white tracking-widest drop-shadow-glow">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-2.5">
          {isBreak ? "chill and stretch" : `working on ${category}`}
        </p>
      </div>

      {/* Dynamic Progress indicator */}
      <div className="w-full bg-border/40 h-1 rounded-full overflow-hidden mt-6">
        <div 
          className={`h-full transition-all duration-1000 ${isBreak ? "bg-accent shadow-cyanGlow" : "bg-primary shadow-glow"}`} 
          style={{ width: `${100 - percentComplete}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleReset}
          className="p-3 bg-muted/60 border border-border hover:bg-muted text-white rounded-xl transition-all active:scale-95 cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95 cursor-pointer ${
            isActive 
              ? "bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400" 
              : "bg-gradient-neon text-white shadow-glow hover:scale-[1.02]"
          }`}
        >
          {isActive ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current" />}
          <span>{isActive ? "Pause" : "Focus"}</span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-muted/60 border border-border hover:bg-muted text-white rounded-xl transition-all cursor-pointer font-bold text-xs"
          title="Customize focus"
        >
          ⏱️
        </button>
      </div>

      {/* Custom Duration Overlay */}
      {showSettings && (
        <div className="glass-panel p-4 rounded-xl absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card/95">
          <h4 className="text-sm font-bold tracking-wider text-white uppercase">Focus Duration</h4>
          <div className="flex gap-2.5">
            {[10, 25, 50, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => applyCustomSettings(mins)}
                className="px-3.5 py-2.5 bg-muted/80 border border-border rounded-lg text-xs font-bold hover:border-primary text-white cursor-pointer"
              >
                {mins}m
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="text-xs font-bold text-muted-foreground hover:text-white mt-2 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* CUSTOM CELEBRATION MODALS */}
      <AnimatePresence>
        {/* 1. Focus Session Completed Modal */}
        {showSessionModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel p-8 rounded-3xl w-full max-w-sm border-primary/20 shadow-glow relative text-center flex flex-col items-center"
            >
              <button
                onClick={() => setShowSessionModal(false)}
                className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-soft">
                <CheckCircle className="h-6 w-6" />
              </span>

              <h3 className="text-xl font-bold tracking-tight text-white font-display uppercase">
                Focus block logged!
              </h3>
              
              <div className="my-5 p-4 rounded-2xl bg-secondary/30 border border-border/60 w-full space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Duration completed</span>
                  <strong className="text-white">{modalDetails.duration} mins</strong>
                </div>
                <div className="flex justify-between">
                  <span>Experience Reward</span>
                  <strong className="text-primary font-black">+ {modalDetails.xp} XP</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current Scholar Level</span>
                  <strong className="text-accent font-bold">Level {modalDetails.level}</strong>
                </div>
              </div>

              <button
                onClick={() => setShowSessionModal(false)}
                className="w-full bg-gradient-neon py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white shadow-glow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                Continue Studying
              </button>
            </motion.div>
          </div>
        )}

        {/* 2. Level Up Scholar Modal */}
        {showLevelUpModal && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="glass-panel p-8 rounded-3xl w-full max-w-sm border-accent/20 shadow-cyanGlow relative text-center flex flex-col items-center overflow-hidden"
            >
              {/* Confetti Background Sparkles */}
              <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-white z-10"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-neon text-white mb-6 shadow-cyanGlow animate-pulse z-10">
                <Award className="h-8 w-8" />
              </span>

              <h2 className="text-2xl font-black tracking-tight text-white font-display uppercase tracking-widest flex items-center gap-1.5 z-10">
                <Sparkles className="h-5 w-5 text-accent animate-spin" />
                <span>Level Up!</span>
                <Sparkles className="h-5 w-5 text-accent animate-spin" />
              </h2>

              <p className="text-xs text-muted-foreground mt-3 max-w-[260px] z-10 leading-relaxed">
                Outstanding focus! Your deep studying streak and Pomodoro blocks have promoted your scholarship standing.
              </p>

              <div className="my-6 p-4 rounded-2xl bg-accent/15 border border-accent/25 w-full text-center z-10">
                <span className="text-[10px] uppercase tracking-widest font-black text-accent block">
                  New Status Promotion
                </span>
                <strong className="text-lg font-black text-white uppercase tracking-wider block mt-1.5">
                  Level {modalDetails.level} Scholar
                </strong>
              </div>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full bg-gradient-neon py-3.5 rounded-xl font-black uppercase tracking-widest text-xs text-white shadow-cyanGlow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer z-10"
              >
                Keep Leveling Up!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}