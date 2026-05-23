const express=require("express");
const router=express.Router();

const {getMessage}=require('../controllers/messageController');

router.get('/:roomId',getMessage);

module.exports=router;