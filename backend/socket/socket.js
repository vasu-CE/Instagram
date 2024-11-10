import {Server} from "socket.io";
import express from "express";
import http from "http"
const app = express();

const server = http.createServer(app);

const io = new Server(server , {
    cors: {
        origin : process.env.URL,
        method : ['GET' , 'POST']
    }
})

const userSocketMap = {};

export const getReciverSocketId = (recieverId) => userSocketMap[recieverId];

io.on('connection' , (socket) => {
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        // console.log(`user id ${userId} => sockdt id ${socket.id}`);
    }

    io.emit('getOnlineUsers' , Object.keys(userSocketMap))

    socket.on('disconnect' , ()=>{
        if(userId){
            // console.log(`user discconect ${userId} => sockdt id ${socket.id}`);
            delete userSocketMap[userId];
        }

        io.emit('getOnlineUsers' , Object.keys(userSocketMap));
    })
})

export {app , server, io};