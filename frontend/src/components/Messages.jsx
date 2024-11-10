import React, { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRealTime from '@/hooks/useGetRealTime'

function Messages({selectedUser}) {
    const {messages} = useSelector(store => store.chat);
    useGetRealTime();
    useGetAllMessage();

    const endOfMessagesRef = useRef(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
  return (
    <div className='overflow-y-auto flex-1 p-4'>
        <div className='flex justify-center'>
            <div className='flex flex-col items-center justify-center'>
                <Avatar className='h-20 w-20' >
                    <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{selectedUser.userName}</span>
                <Link to={`/profile/${selectedUser._id}`}><Button className='h-8 my-2' variant='secondary'>View Profile</Button></Link>
            </div>
        </div>
        <div className='flex flex-col gap-3'>
            {
                messages  && messages.map((msg) => {
                    return (
                        <div className={`flex ${msg.senderId === selectedUser._id ? 'justify-start' : 'justify-end'}`}>
                            <div className={` p-2 rounded max-w-xs h-auto ${msg.senderId === selectedUser._id ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                                <p className='break-words'>{msg.message}</p>
                            </div>
                        </div>
                    )
                })
            }
            <div ref={endOfMessagesRef} />
        </div>
    </div>
  )
}

export default Messages