import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

function Comment({comment}) {
  return (
    <div className='my-2 flex flex-row items-center gap-2'>
        <Avatar>
            <AvatarImage src={comment.author?.profilePicture} size={22} />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className='font-bold text-sm'>{comment.author?.userName}</h1>
        <div className='font-normal pl-1' >{comment.text}</div>
    </div>
  )
}

export default Comment