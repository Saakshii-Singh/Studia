import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import API from "../services/api";
import socket from "../socket/socket";

function Room() {
  const { id } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Join socket room
    socket.emit("join-room", {
      roomId: id,
      username: "Sakshi",
    });

    // Fetch old messages
    const fetchMessages = async () => {
      try {
        const res = await API.get(
          `/messages/${id}`
        );

        setMessages(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();

    // Online users listener
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    // Realtime messages listener
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup listeners
    return () => {
      socket.off("receive-message");
      socket.off("online-users");
    };
  }, [id]);

  // Send message
  const sendMessage = () => {
    if (message.trim() === "") return;

    const messageData = {
      roomId: id,
      text: message,
      username: "Sakshi",
    };

    socket.emit("send-message", messageData);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-2">
        Study Room 🚀
      </h1>

      <p className="text-zinc-400 mb-5">
        Room ID: {id}
      </p>

      {/* Online Users */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">
          Online Users
        </h2>

        <div className="flex gap-3 flex-wrap">
          {onlineUsers.map((user, index) => (
            <div
              key={index}
              className="bg-zinc-800 px-4 py-2 rounded-full"
            >
              {user}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Box */}
      <div className="bg-zinc-900 h-[400px] rounded-xl p-5 overflow-y-auto mb-5 border border-zinc-800">
        {messages.length === 0 ? (
          <p className="text-zinc-500 text-center mt-10">
            No messages yet...
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className="bg-zinc-800 p-3 rounded-lg mb-3"
            >
              <span className="font-bold text-blue-400">
                {msg.username}
              </span>

              <span className="ml-2">
                {msg.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Section */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          className="flex-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700 outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Room;