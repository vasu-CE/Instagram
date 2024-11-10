import { Label } from '@radix-ui/react-label';
import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

function Login() {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });

    const [loading , setLoading] = useState(false);
    const {user} = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email : "",
                    password : ""
                });
            }
        } catch (err) {
            console.log(err.message);
            toast.error(err.response.data.message);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user){
            navigate('/');
        }
    },[])

    return (
        <div className='flex items-center w-screen h-screen justify-center'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8 w-[30vw]'>
                <div className='my-4'>
                    <h1 className='text-center font-bold text-xl'>Logo</h1>
                    <p className='text-center text-sm'>Login to see photos & videos</p>
                </div>
                <div>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                <div>
                    <Label>Password</Label>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>

                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            Please wait
                        </Button>
                    ) : (
                        <Button type="submit">Login</Button>
                    )
                }
                <span className='text-center'>Does'nt have an account? <Link to="/signup" className="text-blue-600">Sign up</Link></span>
            </form>
        </div>
    );
}

export default Login;
