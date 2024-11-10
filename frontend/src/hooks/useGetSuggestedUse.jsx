import {setSuggestedUsers } from "@/redux/authSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useSuggestedUsers = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try{
                const res = await axios.get('http://localhost:5000/api/v1/user/suggested' , {withCredentials : true})
                
                if(res.data.success){
                    // console.log(res.data);
                    dispatch(setSuggestedUsers(res.data.user))
                }
            } catch(err){
                console.log(err);
            }
        }
        fetchSuggestedUsers();
    },[])
}

export default useSuggestedUsers