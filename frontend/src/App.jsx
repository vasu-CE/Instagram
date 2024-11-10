import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import {io} from "socket.io-client"
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoute from './components/ProtectedRoute'

const browserRouter = createBrowserRouter([
  {
    path : '/',
    element :<ProtectedRoute>
              <MainLayout/>
            </ProtectedRoute>,
    children:[
      {
        path :'/',
        element :<ProtectedRoute> <Home/></ProtectedRoute>
      },
      {
        path:'/profile/:id',
        element :<ProtectedRoute> <Profile/></ProtectedRoute>
      },
      {
        path : '/account/edit',
        element :<ProtectedRoute> <EditProfile /></ProtectedRoute>
      },
      {
        path : '/chat',
        element :<ProtectedRoute> <ChatPage /></ProtectedRoute>
      }
    ]
  },
  {
    path : '/login',
    element : <Login/>
  },
  {
    path : '/signup',
    element : <Signup/>
  }  
])
function App() {
  const {user} = useSelector(store => store.auth);
  const {socket} = useSelector(store => store.socketio)
  const dispatch = useDispatch();

  useEffect(() => {
    if(user){
      const socketio = io('https://instagram-vubs.onrender.com' , {
        query:{
          userId : user?._id
        },
        transports:['websocket']
      });
      dispatch(setSocket(socketio));

      //listen all event
      socketio.on('getOnlineUsers' , (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification' , (notification) =>{
        dispatch(setLikeNotification(notification));
      })

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if(socket) {
        socket.close();
        dispatch(setSocket(null));
    }
  },[user , dispatch])

  return (
    <>
      {/* <div className='text-red-600'>Hello</div> */}
      <RouterProvider router ={browserRouter}/>
    </>
  )
}

export default App
