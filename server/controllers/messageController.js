const Message = require('../models/Message');

exports.getMessage=async(req,res)=>{
    try {
        const messages=await Message.find({
            roomId:req.params.roomId,
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({
            message:error.message,
        });
    }
        };