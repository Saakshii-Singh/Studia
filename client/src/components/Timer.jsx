import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Award, Coffee, Zap } from "lucide-react";
import API from "../services/api";

export default function Timer({ roomName, category = "General", onSessionSaved }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef(null);

  // Web Audio API Focus Chime (synthetic bell sound)
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Dual oscillators for a pleasant chord chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime); // A5

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);
    } catch (e) {
      console.log("Audio chime playback blocked or not supported:", e);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete!
            playChime();
            clearInterval(intervalRef.current);
            setIsActive(false);

            if (!isBreak) {
              // Log study session to backend
              saveStudySession(customWorkTime);
              setIsBreak(true);
              setMinutes(5); // 5 min break
            } else {
              setIsBreak(false);
              setMinutes(customWorkTime); // Reset to work session
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
  }, [isActive, seconds, minutes, isBreak]);

  // Log completed session
  const saveStudySession = async (mins) => {
    try {
      const response = await API.post("/study/log", {
        duration: mins,
        category,
        roomName: roomName || "Virtual Sanctum",
      });

      console.log("Focus session saved to cloud:", response.data);
      
      // If user stats were updated (level/streaks), update local profile
      if (response.data.userStats) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.xp = response.data.userStats.xp;
          userObj.level = response.data.userStats.level;
          userObj.studyStreak = response.data.userStats.studyStreak;
          userObj.totalStudyTime = response.data.userStats.totalStudyTime;
          localStorage.setItem("user", JSON.stringify(userObj));
          // Dispatch event to trigger navbar update
          window.dispatchEvent(new Event("hh_login_state_change"));
        }
      }

      if (response.data.userStats?.leveledUp) {
        alert(`🎉 LEVEL UP! You reached Level ${response.data.userStats.level}! Keep focusing!`);
      } else {
        alert(`💪 Focus block logged! You earned +${mins * 10} XP!`);
      }

      if (onSessionSaved) onSessionSaved();
    } catch (error) {
      console.error("Failed to sync study session to cloud:", error.message);
    }
  };

  const handleToggle = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : customWorkTime);
    setSeconds(0);
  };

  const applyCustomSettings = (newMins) => {
    setCustomWorkTime(newMins);
    setIsActive(false);
    setIsBreak(false);
    setMinutes(newMins);
    setSeconds(0);
    setShowSettings(false);
  };

  // Calculate percentage for visual feedback
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

      {/* Timer Circular/Frosted Display */}
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
        <div className="glass-panel p-4 rounded-xl absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
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
    </div>
  );
}