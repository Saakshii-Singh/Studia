const Room=require("../models/Room");

exports.createRoom=async(req,res)=>{
    try {
        const {roomName}=req.body;

        const room=await Room.create({
            roomName,
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({
            message:error.message,
        });
    }};

exports.getRooms=async(req,res)=>{
    try {
        const rooms=await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({
            message:error.message,
        });
    }};
    