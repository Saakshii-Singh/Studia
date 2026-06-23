import { useNavigate } from "react-router-dom";
import { Users, BookOpen, ChevronRight, Hash, Code, Calculator, FlaskConical, PenTool, Languages } from "lucide-react";

export default function RoomCard({ room }) {
  const navigate = useNavigate();

   const getRoomIcon = (subject) => {
    const s = subject.toLowerCase();
    if (s.includes("code") || s.includes("computer")) return Code;
    if (s.includes("math")) return Calculator;
    if (s.includes("science")) return FlaskConical;
    if (s.includes("writing")) return PenTool;
    if (s.includes("language")) return Languages;
    return BookOpen;
  };

  const IconComponent = getRoomIcon(room.subject);

  // Get a neon badge color based on the subject category
  const getSubjectColor = (subject) => {
    switch (subject) {
      case "Coding": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "Mathematics": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Science": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Writing": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Languages": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    }
  };

  return (
    <div
      onClick={() => navigate(`/room/${room._id}`)}
      className="glass-panel group p-6 rounded-2xl cursor-pointer hover:border-primary/45 transition-all duration-300 hover:shadow-glow flex flex-col justify-between h-52 relative overflow-hidden"
    >
      {/* Parallax corner glow */}
      <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />

      <div>
        <div className="flex items-center justify-between mb-3.5">
          {/* Emoji & Subject Badge */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              <IconComponent className="h-6 w-6" />
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${getSubjectColor(room.subject)}`}>
              {room.subject}
            </span>
          </div>
          
          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/40 border border-border/50 px-2 py-0.5 rounded-md">
            <Users className="h-3 w-3 text-accent" />
            <span>{(room.participants && room.participants.length) || 0} studying</span>
          </span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-white mb-1.5 group-hover:text-primary transition-colors truncate">
          {room.roomName}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {room.description || "Join this study sanctum to double your focus alongside active learners!"}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs font-bold text-accent group-hover:text-white transition-colors">
        <span className="flex items-center gap-1 uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" /> Study Group
        </span>
        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}