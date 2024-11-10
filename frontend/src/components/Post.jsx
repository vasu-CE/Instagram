import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, MoreHorizontalIcon, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import {FaHeart, FaRegHeart} from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import axios from 'axios'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'


function Post({post}) {
    const [text,setText] = useState("");
    const [open,setOpen] = useState(false);
    const {user} = useSelector(store => store.auth);
    const { posts} = useSelector(store => store.post);
    const [liked , setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike , setPostLike] = useState(post.likes.length);
    const [comment , setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if(inputText.trim()){
            setText(inputText)
        }else{
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try{
            const action = liked ? 'dislike' : 'like'
            const res = await axios.get(`http://localhost:5000/api/v1/post/${post._id}/${action}` , {withCredentials:true});
            if(res.data.success){
                const updatedLikes = liked ? postLike-1 : postLike+1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                const updatedPostData = posts.map((p) => 
                    p._id === post._id ? {
                        ...p,
                        likes : liked ? p.likes.filter(id => id != user._id) : [...p.likes , user._id]
                    } : p)
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        }catch(err){
            console.log(err);
            
        }
    }

    const commentHandler = async () => {
        try{
            const res = await axios.post(`http://localhost:5000/api/v1/post/${post._id}/comment` , {text} , {
                headers : {
                    'Content-Type' : 'application/json'
                },
                withCredentials : true
            });
            
            if(res.data.success){
                const updatedCommentData = [...comment , res.data.comment];
                setComment(updatedCommentData);
                
                const updatedPostData = posts.map((p) => 
                    p._id === post._id ? { ...p, comments : updatedCommentData} : p
                );

                dispatch(setPosts(updatedPostData));
                setText('');
                toast.success(res.data.message);
            }
        }catch(err){
            console.log(err);
            toast.error('Failed to add comment');
        }
    }

    const deletePostHandler =async () => {
        try{
            const res = await axios.delete(`http://localhost:5000/api/v1/post/delete/${post?._id}` , {withCredentials : true})
            if(res.data.success){
                const updatedPosts = posts.filter((newpost) => newpost._id != post._id)
                dispatch(setPosts(updatedPosts));
                toast.success(res.data.message);
            }
        }catch(err){
            console.log(err);
            toast.error(err.response.data.message);
            
        }
    }
  return (
    <div className='my-8 w-full max-w-sm mx-auto'>
        <div className='flex items-center justify-between'>
            <div className="flex item-center gap-2">
                <Avatar className='w-8 h-8 rounded-full bg-gray-100'>
                    <AvatarImage className='w-8 h-8 rounded-full' src={post.author?.profilePicture} alt="Post"/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1>{post.author.userName}</h1>
                 {user._id === post.author._id  && <Badge className="my-[-2px]" variant="secondary">Author</Badge>}
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer'/>
                    </DialogTrigger>
                    <DialogContent className='flex flex-col items-center text-sm text-center'>
                        <Button variant='ghost' className='cursor-pointer w-fit text-red-600 font-bold'>Unfollow</Button>
                        <Button variant='ghost' className='cursor-pointer w-fit'>Add to favourite</Button>
                        {
                            user && user._id === post.author._id
                             && <Button onClick={deletePostHandler} variant='ghost' className='cursor-pointer w-fit text-red-600'>Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
        </div>
        <img
        className='rounded-sm my-2 w-full aspect-square object-cover' 
        src={post.image} alt="post_img">
        </img>

        <div className='flex justify-between items-center my-3'>
            <div className='flex gap-4'>
                {
                    liked ? <FaHeart onClick={() => likeOrDislikeHandler()} size={'22px'} className='cursor-pointer text-red-600' /> : 
                    <FaRegHeart  onClick={() => likeOrDislikeHandler()} size={'22px'} className='cursor-pointer hover:text-red-900'/>
                }
                
                <MessageCircle onClick={() => {
                    dispatch(setSelectedPost(post))
                    setOpen(true)
                }} className='cursor-pointer hover:text-gray-600'/>
                <Send className='cursor-pointer hover:text-gray-600'/>
            </div>
                <Bookmark className='cursor-pointer hover:text-gray-600'/>
        </div>
        <span className='font-medium block mb-2'>{postLike} Likes</span>
        <p>
            <span className='font-medium mr-2'>{post.author.userName}</span>
            {post.caption}
        </p>
        {
            post.comments.length > 0 &&
            <span onClick={() => {
                dispatch(setSelectedPost(post))
                setOpen(true)
            }} className='cursor-pointer text-sm text-gray-400' >View all {post.comments.length} comments</span>
        }

        <CommentDialog open={open} setOpen={setOpen} />
        <div className='flex justify-between items-center'>
            <input
                type='text'
                placeholder='Add a comment..'
                value={text}
                onChange={changeEventHandler}
                className='outline-none text-sm w-full'
            />
            {
                text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
            }
        </div>
    </div>
  )
}

export default Post