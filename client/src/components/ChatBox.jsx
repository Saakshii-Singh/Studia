import { useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";

export default function ChatBox({ messages, message, setMessage, sendMessage, username }) {
  const bottomRef = useRef(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="glass-panel flex flex-col rounded-3xl border-border h-full overflow-hidden shadow-soft">
      {/* Header */}
      <div className="border-b border-border/40 px-5 py-4 bg-muted/30 flex items-center gap-2">
        <MessageSquare className="h-4.5 w-4.5 text-primary" />
        <h4 className="text-sm font-bold tracking-wider uppercase text-white">Sanctum Chat</h4>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2">
            <span className="text-2xl">🎓</span>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Welcome! Say hello to your fellow co-studiers.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.username === username;
            return (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                {/* Username label */}
                <span className={`text-[10px] font-black uppercase tracking-wider mb-1 px-1.5 ${
                  isMe ? "text-accent" : "text-primary"
                }`}>
                  {msg.username}
                </span>
                
                {/* Chat bubble */}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe 
                    ? "bg-primary text-white rounded-tr-none shadow-glow" 
                    : "bg-muted/70 text-foreground rounded-tl-none border border-border/40"
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input panel */}
      <div className="p-4 border-t border-border/40 bg-muted/15 flex gap-2.5 items-center">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-4 py-2.5 rounded-xl bg-input text-white border border-border/50 outline-none text-sm placeholder:text-muted-foreground/60 focus:border-primary transition-colors"
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-gradient-neon hover:scale-[1.02] active:scale-95 text-white rounded-xl shadow-glow cursor-pointer transition-transform"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}