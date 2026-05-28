const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const { roomName, subject, description } = req.body;

    if (!roomName || roomName.trim() === "") {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Room.create({
      roomName: roomName.trim(),
      subject: subject || "General",
      description: description || "Let's study together and focus!",
    });
    
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};