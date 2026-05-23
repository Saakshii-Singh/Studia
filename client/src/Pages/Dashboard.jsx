import { useEffect, useState } from "react";
import API from "../services/api";
import {useNavigate} from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState([]);

  const createRoom = async () => {
    try {
      await API.post("/rooms/create", {
        roomName,
      });

      fetchRooms();

      setRoomName("");
    } catch (error) {
      console.error(
        "Error creating room:",
        error.response?.data || error.message
      );
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");

      setRooms(res.data);
    } catch (error) {
      console.error(
        "Error fetching rooms:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-3xl font-bold text-white mb-6">
        Dashboard
      </h1>

      <div className="flex gap-4 mb-10">
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) =>
            setRoomName(e.target.value)
          }
          className="p-3 rounded bg-zinc-800 text-white outline-none"
        />

        <button
          onClick={createRoom}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Room
        </button>
      </div>

      <div className="grid gap-4">
        {rooms.map((room) => (
          <div
           key={room._id}
           onClick={() => navigate(`/room/${room._id}`)}
            className="p-4 bg-zinc-900 rounded text-white cursor-pointer hover:bg-zinc-800 transition"
              accha>
            <h2 className="text-2xl font-semibold">
              {room.roomName}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;