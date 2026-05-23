const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Room',
    },
    username:{
        type:String,
        required:true,
    },
    text:{
        type:String,
        required:true,
    },
},
{
    timestamps:true,
}
);
module.exports = mongoose.model('Message',messageSchema);