import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";

function CommentDialog({ open, setOpen }) {
  const[text,setText] = useState("");
  const {selectedPost , posts} = useSelector(store => store.post);
  const dispatch = useDispatch();
  // const {comment , setComment} = useState([selectedPost?.comments]);
  const [comment, setComment] = useState(selectedPost?.comments || []);

  useEffect(() => {
    if(selectedPost){
        setComment(selectedPost.comments)
    }
  },[selectedPost])

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if(inputText.trim()){
      setText(inputText);
    }else{
      setText("");
    }
  }


  const sendMessageHandler = async () => {
    try{
      const res = await axios.post(`http://localhost:5000/api/v1/post/${selectedPost._id}/comment` , {text} , {
          headers : {
              'Content-Type' : 'application/json'
          },
          withCredentials : true
      });
      
      if(res.data.success){
          const updatedCommentData = [res.data.comment ,...comment ];
          setComment(updatedCommentData);
          
          const updatedPostData = posts.map((p) => 
              p._id === selectedPost._id ? { ...p, comments : updatedCommentData} : p
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
  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl flex flex-col p-0"
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              alt="post_img"
              className="w-full h-full object-cover rounded-lg"
            ></img>
          </div>
          <div className="w-1/2 flex flex-col justify-between">
          <div className="flex justify-between items-center pr-5">
          <div className="flex items-center gap-5 p-4">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
              </div>
              <div>
                <Link className="font-semibold text-xs">{selectedPost?.author?.userName}</Link>
                {/* <span className="text-gray-600">Bio here..</span> */}
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <MoreHorizontal className="cursor-pointer"/>
              </DialogTrigger>
              <DialogContent className='flex flex-col items-center text-sm text-center'>
                <div className="cursor-pointer w-full text-[#ED4956] font-bold">Unfollow</div>
                <div>Add to favourite</div>
              </DialogContent>
            </Dialog>
          </div>
          <hr/>
          <div className="flex-1 overflow-y-auto max-h-96 p-4">
            {
              comment.map((comment) => <Comment key={comment._id} comment={comment} /> )
            }
          </div>
          <div className="p-4"></div>
          <div className="p-4 flex items-center gap-2">
            <input onChange={changeEventHandler} value={text} type = "text"  placeholder="Add a comment..."  className="w-full outline-none border border-gray-300 p-2 rounded"/>
            <Button disabled={!text.trim()} onClick={sendMessageHandler} variant="outline">Send</Button>
          </div>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  );
}

export default CommentDialog;
