import { setMessages } from "@/redux/chatSlice"
import { setPosts } from "@/redux/postSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetAllMessage = () => {
    const dispatch = useDispatch()
    const {selectedUser} = useSelector(store => store.auth);
    useEffect(() => {
        const fetchAllMessage = async () => { 
            try{
                // console.log(`${selectedUser._id}`);
                const res = await axios.get(`http://localhost:5000/api/v1/message/all/${selectedUser._id}` , {withCredentials : true})
                // console.log("done");
                
                if (res.data.success) {
                    // console.log(res.data);
                    
                    dispatch(setMessages(res.data.messages));
                  } else {
                    console.log("Failed to fetch messages:", res.data.message);
                  }
            } catch(err){
                console.log("err");
                
                console.log(err.message);  
            }
        }
        fetchAllMessage();
    },[selectedUser , dispatch])
}

export default useGetAllMessage