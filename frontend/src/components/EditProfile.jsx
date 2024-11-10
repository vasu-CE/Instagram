import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "@/redux/authSlice";
import { toast } from "sonner";
import axios from "axios";

function EditProfile() {
  const { user } = useSelector((store) => store.auth);
  const imageRef = useRef();
  const [loading , setLoading] = useState(false);
  const [input , setInput] = useState({
    profilePhoto : user?.profilePicture,
    bio : user?.bio,
    gender : user?.gender
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if(file){
      setInput({...input , profilePhoto:file});
    }
  }

  const selectChangeHandler = (value) => {
    setInput({...input , gender:value});
  }

  const editProfileHandler =async () => {
    const formData = new FormData();
    formData.append('bio' , input.bio);
    formData.append('gender',input.gender);
    if(input.profilePhoto){
      formData.append('profilePhoto' , input.profilePhoto)
    }
      try{
        setLoading(true);
        const res = await axios.post('https://instagram-vubs.onrender.com/api/v1/user/profile/edit' , formData ,{
          headers : {
            'Content-Type' : 'multipart/form-data'
          },
          withCredentials : true
        });
        if(res.data.success){
          const updatedUserData = {
            ...user,
            bio : res.data.user?.bio,
            profilePicture : res.data.user?.profilePicture,
            gender : res.data.user?.gender
          }
          dispatch(setAuthUser(updatedUserData));
          navigate(`/profile/${user._id}`);
          toast.success(res.data.message);
        }
      }catch(err){
        console.log(err); 
        toast.error(err.res.data.message);
      } finally{
        setLoading(false)
      }
  }

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-6">
        <h1 className="font-bold text-xl">Edit profile</h1>
        <div className="flex items-center justify-between bg-gray-100 rounded-xl  p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <h1 className="font-bold text-sm"> {user.userName} </h1>
              <span>{user?.bio || "Learner.."}</span>
            </div>
          </div>
          <input ref={imageRef} onChange={fileChangeHandler} type="file" name='profilePhoto' className="hidden" />
          <Button
            onClick={() => imageRef.current.click()}
            className="bg-[#0095F6] hover:bg-[#2177b0]"
          >
            Change Photo
          </Button>
        </div>

        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea value={input.bio} onChange={(e) => setInput({...input , bio:e.target.value})} name="bio" className="focus-visible:ring-transparent" />
        </div>
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select defaultValue={input.gender} onValueChange={selectChangeHandler} >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end" >
          {
            loading ? (
              <Button className='bg-[#0095F6] hover:bg-[#2177b0]'>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait..
              </Button>
            ) : (
              <Button onClick={editProfileHandler} className='bg-[#0095F6] hover:bg-[#2177b0]'>Submit</Button>
            )
          }
        </div>
      </section>
    </div>
  );
}

export default EditProfile;
