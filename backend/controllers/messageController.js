import conversationModel from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReciverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req,res) => {
    try{
        const senderId = req.id;
        const recieverId = req.params.id;
        const {textMessage : message} = req.body;
        // console.log(message);
        let conversation = await conversationModel.findOne({
            participants : {$all: [senderId , recieverId]}
        })

        if(!conversation){
            conversation = await conversationModel.create({
                participants : [senderId , recieverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            message
        });

        if (newMessage) {
            conversation.message.push(newMessage._id);
            await conversation.save();
        }
        await Promise.all([conversation.save() , newMessage.save()])

        //implement socket io data transfer
        const recieverSocketId = getReciverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit('newMessage' , newMessage);
        }
        

        return res.status(201).json({
            success : true,
            newMessage
        })
    }catch(err){
        console.log(err.message);
    }
}


export const getMessage = async (req,res) => {
    try{
        const senderId = req.id;
        const recieverId = req.params.id;
        const conversation = await conversationModel.findOne({
            participants : {$all : [senderId,recieverId]}
        }).populate('message');;

        if(!conversation) return res.status(200).json({success:true , messages : []});

        return res.status(200).json({success:true , messages : conversation?.message})
    }catch(err){
        console.log(err.messagge);
        
    }
}