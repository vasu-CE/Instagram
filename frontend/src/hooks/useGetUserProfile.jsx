import {setSuggestedUsers, setUserProfile } from "@/redux/authSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetUesrProfile = (userId) => {
    const dispatch = useDispatch()
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            try{
                const res = await axios.get(`http://localhost:5000/api/v1/user/${userId}/profile` , {withCredentials : true})
                if(res.data.success){
                    // console.log(res.data);
                    dispatch(setUserProfile(res.data.user))
                }
            } catch(err){
                console.log(err);
            }
        }
        fetchUserProfile();
    },[userId ,dispatch])
}

export default useGetUesrProfile