import { setAuthUser } from "@/redux/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import axios from "axios";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreatePost from "./CreatePost";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

function LeftSidebar() {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const {likeNotification} = useSelector(store => store.realTimeNotification);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/user/logout",
        { withCredentials: true }
      );
      if (response.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(response.data.message);
      }
    } catch (err) {
      toast(err.response.data.message);
    }
  };

  const sidebarHandler = (type) => {
    switch (type) {
      case "Logout": {
        logoutHandler();
        break;
      }
      case "Create": {
        setOpen(true);
        break;
      }
      case "Profile" : {
        navigate(`/profile/${user?._id}`)
        break;
      }
      case 'Home' : {
        navigate('/');
        break;
      }
      case 'Messages' : {
        navigate('/chat');
        break;
      }
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notification" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6 rounded-full">
          <AvatarImage
            className="w-full h-full rounded-full"
            src={user?.profilePicture}
          />
          <AvatarFallback>wait...</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className="fixed top-0 z-10 left-0 px-4 border-r bodrder-gray-300 w-[16%] h-screen">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 font-bold text-xl">Logo</h1>
        <div>
          {sidebarItems.map((items, index) => {
            return (
              <div
                onClick={() => sidebarHandler(items.text)}
                key={index}
                className="flex item-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {items.icon}
                <span>{items.text}</span>
                {
                  items.text === "Notification" && likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>                        
                        <Button size='icon' className='rounded-full h-5 w-5 absolute left-6 bottom-6'>likeNotification.length</Button>
                        <PopoverContent>
                          <div>
                            {
                              likeNotification.length == 0 ? (<p>No New notification</p>) : (
                                likeNotification.map((notification) => {
                                  return (
                                    <div key={notification.userId}>
                                      <Avatar>
                                        <AvatarImage src={notification.userDetails?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                        <p className="text-sm"> <span className="font-bold">{notification.userDetails.userName}Liked your post</span></p>
                                      </Avatar>
                                    </div>
                                  )
                                } )
                              )
                            }
                          </div>
                        </PopoverContent>
                      </PopoverTrigger>
                    </Popover>
                  )
                }
              </div>
            );
          })}
          {/* <img src={user.profilePicture} alt="img" ></img> */}
          {/* <div>{user.userName}</div> */}
        </div>
      </div>
          
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
}

export default LeftSidebar;
