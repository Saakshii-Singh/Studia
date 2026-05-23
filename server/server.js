const express=require('express');   
const cors=require('cors');
const dotenv=require('dotenv');
const http=require('http');

dotenv.config();

const coonectDB=require('./config/db');
const app= express();
coonectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/rooms',require('./routes/roomRoutes'));

app.get('/',(req,res)=>{
    res.send('API is running');
});

const server=http.createServer(app);

const {Server}=require('socket.io');
const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
    }
});
io.on('connection',(socket)=>{
    console.log('a user connected');
    socket.on('joinRoom',(roomId)=>{
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });
    socket.on("send-message",(data)=>{
      io.to(data.roomId).emit("receive-message",data);
    });
    socket.on('disconnect',()=>{
        console.log('user disconnected');
    });
});

server.listen(5000,()=>{
    console.log('Server is running on port 5000');
});