import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/chatSlice";

const useGetRealTime = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const messages = useSelector((store) => store.chat.messages);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        dispatch((state) => {
          // Use a functional update to avoid issues with stale state
          const updatedMessages = [...state.chat.messages, newMessage];
          return setMessages(updatedMessages);
        });
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [dispatch, socket]); // Only include `dispatch` and `socket` in dependencies

};

export default useGetRealTime;
