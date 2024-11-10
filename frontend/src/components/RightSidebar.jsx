import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function RightSidebar() {
  const { user } = useSelector((store) => store.auth);
  const { suggestedUsers } = useSelector((store) => store.auth);
  return (
    <div className="w-[25%] my-10 pr-32">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${user._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-semibold">
            <Link to={`/profile/${user._id}`}>{user.userName}</Link>
          </h1>
          <span>{user?.bio || "Learner.."}</span>
        </div>
      </div>

      {/* suggested user  */}
      <div className="my-10">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-gray-600">Suggested for you</h1>
          <span className="font-medium cursor-pointer">See All</span>
        </div>
      </div>
      {suggestedUsers && suggestedUsers.length > 0 ? (
        suggestedUsers.map((user) => (
          <div key={user._id} className="flex items-center justify-between my-5">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col items-center">
                <h1 className="font-semibold">
                  <Link to={`/profile/${user._id}`}>{user.userName}</Link>
                </h1>
                <span>{user?.bio || "Learner.."}</span>
              </div>
            </div>
            <span className="text-[#3BADFB] text-sm font-bold cursor-pointer hover:text-[#97c8e9]" >Follow</span>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">No suggestions available</div>
      )}
    </div>
  );
}

export default RightSidebar;
