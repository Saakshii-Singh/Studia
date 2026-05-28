import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Users, Sparkles, Volume2, Music, Check, Edit2 } from "lucide-react";
import API from "../services/api";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import Timer from "../components/Timer";
import ChatBox from "../components/ChatBox";
import Sidebar from "../components/Sidebar";

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("Sanctum Chamber");
  const [username, setUsername] = useState("Guest Scholar");
  const [avatarColor, setAvatarColor] = useState("violet");
  const [focusStatus, setFocusStatus] = useState("Analyzing deep topics... 📚");
  const [isStatusEditing, setIsStatusEditing] = useState(false);
  const [inputStatus, setInputStatus] = useState("Analyzing deep topics... 📚");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [coStudiers, setCoStudiers] = useState([]);

  // Guest Nickname Modal states
  const [showNickModal, setShowNickModal] = useState(false);
  const [guestNick, setGuestNick] = useState("");

  // Ambient sound system refs & playing states
  const [playingAmbient, setPlayingAmbient] = useState({ rain: false, lofi: false, cafe: false });
  const [volumes, setVolumes] = useState({ rain: 0.3, lofi: 0.3, cafe: 0.3 });

  const rainRef = useRef(null);
  const lofiRef = useRef(null);
  const cafeRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Room Name
    const fetchRoomDetails = async () => {
      try {
        const res = await API.get("/rooms");
        const currentRoom = res.data.find((r) => r._id === id);
        if (currentRoom) setRoomName(currentRoom.roomName);
      } catch (err) {
        console.error("Failed to load room details:", err.message);
      }
    };
    fetchRoomDetails();

    // 2. Fetch User Identity
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    let activeName = "Guest Scholar";
    let activeColor = "violet";

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        activeName = parsed.username;
        setUsername(activeName);
        
        // Assign a pleasant colored avatar based on user profile/username
        const colors = ["violet", "cyan", "rose", "emerald", "amber"];
        const colorIdx = activeName.charCodeAt(0) % colors.length;
        activeColor = colors[colorIdx];
        setAvatarColor(activeColor);
      } catch (e) {
        setUsername("Guest Scholar");
      }
    } else {
      // If Guest, prompt nickname selection
      setShowNickModal(true);
    }

    // 3. Fetch Message logs
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load message history:", err.message);
      }
    };
    fetchMessages();

    // Only join Sockets immediately if registered (guests join after Nickname modal input)
    if (token && storedUser) {
      joinRoomSocket(activeName, activeColor);
    }

    // --- Sockets Listeners ---
    socket.on("room_users_list", (users) => {
      setCoStudiers(users);
    });

    socket.on("new_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("room_users_list");
      socket.off("new_message");
      
      // Stop all ambient focus tracks on leaving the room
      if (rainRef.current) rainRef.current.pause();
      if (lofiRef.current) lofiRef.current.pause();
      if (cafeRef.current) cafeRef.current.pause();
    };
  }, [id]);

  const joinRoomSocket = (nick, color) => {
    socket.emit("join_study_room", {
      room: id,
      nickname: nick,
      focus: focusStatus,
      avatar: color,
      xp: 0,
    });
  };

  const handleGuestJoin = (e) => {
    e.preventDefault();
    const finalNick = guestNick.trim() || "Guest Scholar";
    setUsername(finalNick);
    
    // Choose a color
    const colors = ["violet", "cyan", "rose", "emerald", "amber"];
    const activeColor = colors[finalNick.charCodeAt(0) % colors.length];
    setAvatarColor(activeColor);

    setShowNickModal(false);
    
    // Connect to Sockets as Guest
    socket.emit("join_study_room", {
      room: id,
      nickname: finalNick,
      focus: focusStatus,
      avatar: activeColor,
      xp: 0,
    });
  };

  // 4. Send Chat message
  const sendMessage = () => {
    if (!message.trim()) return;
    
    socket.emit("send_message", {
      roomId: id,
      username,
      text: message.trim(),
    });
    
    setMessage("");
  };

  // 5. Update focus status on Sockets
  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (!inputStatus.trim()) return;
    setFocusStatus(inputStatus.trim());
    setIsStatusEditing(false);

    // Broadcast updated focus message to everyone in the room
    socket.emit("update_focus_status", {
      room: id,
      focus: inputStatus.trim(),
    });
  };

  // 6. Ambient Sounds Controls
  const toggleAmbient = (sound) => {
    const isPlaying = playingAmbient[sound];
    setPlayingAmbient((prev) => ({ ...prev, [sound]: !isPlaying }));
    
    let audioRef = null;
    if (sound === "rain") audioRef = rainRef;
    if (sound === "lofi") audioRef = lofiRef;
    if (sound === "cafe") audioRef = cafeRef;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = volumes[sound];
        audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
      }
    }
  };

  const handleVolumeChange = (sound, val) => {
    setVolumes((prev) => ({ ...prev, [sound]: val }));
    let audioRef = null;
    if (sound === "rain") audioRef = rainRef;
    if (sound === "lofi") audioRef = lofiRef;
    if (sound === "cafe") audioRef = cafeRef;

    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  // Avatar helper classes
  const getAvatarBg = (color) => {
    if (color === "violet") return "bg-primary text-white border-primary/20";
    if (color === "cyan") return "bg-accent text-background border-accent/25";
    if (color === "rose") return "bg-rose-500 text-white border-rose-500/20";
    if (color === "emerald") return "bg-emerald-500 text-background border-emerald-500/20";
    return "bg-amber-500 text-background border-amber-500/20";
  };

  return (
    <div className="min-h-screen w-full bg-background pt-20 pb-8 flex flex-col items-center">
      {/* Floating Navbar */}
      <Navbar />

      {/* Hidden Ambient HTML5 Audio Streams (Royalty free royalty loops) */}
      <audio ref={rainRef} src="https://assets.mixkit.co/active_storage/sfx/2433/2433-500.wav" loop />
      <audio ref={lofiRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" loop />
      <audio ref={cafeRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" loop />

      {/* Header details bar */}
      <div className="w-full max-w-6xl px-6 flex items-center justify-between border-b border-border/40 pb-4.5 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Hub</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-black font-display text-white uppercase tracking-tight">
            {roomName}
          </h1>
          <p className="text-[10px] text-accent tracking-widest font-black uppercase mt-1 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-glow inline-block" />
            <span>Co-Studying Sanctum Live</span>
          </p>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/40 border border-border px-3 py-1.5 rounded-lg">
          <Users className="h-4 w-4 text-primary" />
          <span>{coStudiers.length} Focus Champions</span>
        </span>
      </div>

      {/* Flagship co-studying workspace grid */}
      <div className="w-full max-w-6xl px-6 grid gap-6 md:grid-cols-[1fr_2fr_1.2fr] items-stretch">
        
        {/* Left Column: Soundboard panel */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-5 rounded-3xl flex flex-col border-border/40 shadow-soft">
            <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
              <Music className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-sm font-bold tracking-wider uppercase text-white">Focus Sounds</h4>
            </div>

            <div className="space-y-4">
              {/* Rain Sound */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Soft Rain 🌧️</span>
                  <button
                    onClick={() => toggleAmbient("rain")}
                    className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      playingAmbient.rain
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-muted hover:bg-border text-muted-foreground border-border"
                    }`}
                  >
                    {playingAmbient.rain ? "Pause" : "Play"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.rain}
                    onChange={(e) => handleVolumeChange("rain", parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {/* Lofi Beats */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Lofi Streams 🎧</span>
                  <button
                    onClick={() => toggleAmbient("lofi")}
                    className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      playingAmbient.lofi
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-muted hover:bg-border text-muted-foreground border-border"
                    }`}
                  >
                    {playingAmbient.lofi ? "Pause" : "Play"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.lofi}
                    onChange={(e) => handleVolumeChange("lofi", parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {/* Cafe Chatter */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Aesthetic Cafe ☕</span>
                  <button
                    onClick={() => toggleAmbient("cafe")}
                    className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      playingAmbient.cafe
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-muted hover:bg-border text-muted-foreground border-border"
                    }`}
                  >
                    {playingAmbient.cafe ? "Pause" : "Play"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volumes.cafe}
                    onChange={(e) => handleVolumeChange("cafe", parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Timer & Synced Student Grid */}
        <div className="flex flex-col items-center gap-6">
          {/* Pomodoro Timer */}
          <Timer roomName={roomName} category="Focus Workspace" />

          {/* User Active Status Customizer */}
          <div className="glass-panel p-5 rounded-3xl w-full flex flex-col gap-3.5 border-border/40">
            {isStatusEditing ? (
              <form onSubmit={handleSaveStatus} className="flex gap-2">
                <input
                  type="text"
                  value={inputStatus}
                  onChange={(e) => setInputStatus(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-input text-white border border-border/50 outline-none text-xs"
                />
                <button
                  type="submit"
                  className="p-3 bg-accent text-background rounded-xl font-bold cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between px-2.5">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">
                    Your focus target
                  </span>
                  <span className="text-xs font-semibold text-white mt-1">
                    {focusStatus}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setInputStatus(focusStatus);
                    setIsStatusEditing(true);
                  }}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Real-time Student co-working Grid */}
          <div className="w-full flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest font-black text-muted-foreground pl-2">
              Focusing in Sanctum
            </h3>

            {coStudiers.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl w-full text-center">
                <p className="text-xs text-muted-foreground">No students in room... Sockets syncing</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 w-full">
                {coStudiers.map((student) => (
                  <div
                    key={student.socketId}
                    className="glass-panel p-4.5 rounded-2xl flex items-center gap-3.5 relative overflow-hidden border-border/60 hover:border-primary/20 transition-all"
                  >
                    {/* Glowing active indicator */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent pulse-glow" />
                    </div>

                    <div className={`h-11 w-11 rounded-xl shrink-0 border uppercase font-extrabold text-sm flex items-center justify-center ${getAvatarBg(student.avatar)}`}>
                      {student.nickname.slice(0, 2)}
                    </div>

                    <div className="flex flex-col min-w-0 pr-6">
                      <span className="text-xs font-bold text-white truncate">
                        {student.nickname}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate mt-1">
                        {student.focus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Box & Checklist To-Do Checklist */}
        <div className="flex flex-col gap-6 h-[550px]">
          <div className="flex-1 min-h-[250px]">
            <ChatBox
              messages={messages}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              username={username}
            />
          </div>
          
          <div className="flex-1 min-h-[250px]">
            <Sidebar />
          </div>
        </div>

      </div>

      {/* Guest Nickname Input Modal */}
      {showNickModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center px-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-sm border-primary/20 shadow-glow relative">
            <div className="flex flex-col items-center text-center mb-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-neon text-white shadow-glow mb-4">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white font-display">
                Enter study space
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                Choose a guest nickname to join the co-studying chambers.
              </p>
            </div>

            <form onSubmit={handleGuestJoin} className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="Choose alias..."
                value={guestNick}
                onChange={(e) => setGuestNick(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-input text-white border border-border/50 outline-none text-xs text-center font-bold tracking-wide"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-neon py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white shadow-glow hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <span>Study Sanctum</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}