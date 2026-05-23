const mongoose=require("mongoose");

const roomSchema=new mongoose.Schema(
    {
        roomName:{
            type:String,
            required:true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ],
},
{timestamps:true}
);

module.exports=mongoose.model("Room",roomSchema);
