import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./ChatBox.css";
import api from "../../interceptors/axiosInterceptor";
import BASE_URL from "../../Config";
import Sidebar from "../../layout/Sidebar";
import ChatList from "./ChatList";

const ChatBox = ({ userId }) => {
  const params = useParams();
  const receiverId = params.receiverId;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [offset, setOffset] = useState(0);
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  const formatMessage = (msg) => ({
    id: msg._id || `${msg.senderId || msg.sender_id}-${msg.timestamp}`,
    senderId: msg.senderId || msg.sender_id,
    content: msg.content || msg.message,
    timestamp: msg.timestamp,
  });

  // Avoid duplicates by message ID
  const addUniqueMessages = (incomingMessages) => {
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const uniqueMessages = incomingMessages.filter((m) => !existingIds.has(m.id));
      return [...prev, ...uniqueMessages];
    });
  };

  useEffect(() => {
    if (userId && receiverId) {
      if (socketRef.current) socketRef.current.disconnect();

      const socketUrl = BASE_URL.replace("/api/", "");
      const socket = io(socketUrl, {
        forceNew: true,
      });

      socketRef.current = socket;
      setMessages([]);
      setOffset(0);

      socket.emit("registerUser", userId);
      socket.emit("joinRoom", {
        user_id: userId,
        other_user_id: receiverId,
      });

      socket.emit("get_chat_history", {
        sender_id: userId,
        receiver_id: receiverId,
        limit: 50,
        offset: 0,
      });

      return () => socket.disconnect();
    }
  }, [userId, receiverId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const formatted = Array.isArray(msg)
        ? msg.map(formatMessage)
        : [formatMessage(msg)];

      // Add only messages from others
      const filtered = formatted.filter((m) => m.senderId !== userId);
      addUniqueMessages(filtered);
    };

    const handleChatHistory = ({ messages: oldMessages }) => {
      const formatted = oldMessages.map(formatMessage);
      addUniqueMessages(formatted);
    };

    socket.on("receive_message", (msg) => {
      const formatted = Array.isArray(msg)
        ? msg.map(formatMessage)
        : [formatMessage(msg)];

      // Add only messages from others
      const filtered = formatted.filter((m) => m.senderId !== userId);
      addUniqueMessages(filtered);

      // If we receive a message in the active chat, mark it as read immediately
      if (filtered.length > 0) {
        api.post(`${BASE_URL}chats/markAsRead`, {
          userId: userId,
          otherUserId: receiverId
        }).catch(err => console.error("Error marking as read in real-time:", err));
      }
    });
    socket.on("chat_history", handleChatHistory);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("chat_history", handleChatHistory);
    };
  }, [userId, receiverId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // const sendMessage = () => {
  //   const socket = socketRef.current;
  //   if (!message.trim() || !socket) return;

  //   const newMsg = {
  //     sender_id: userId,
  //     receiver_id: receiverId,
  //     message,
  //     timestamp: new Date().toISOString(),
  //   };

  //   socket.emit("sendMessage", newMsg);
  //   setMessage("");
  // };

  const sendMessage = () => {
  const socket = socketRef.current;
  if (!message.trim() || !socket) return;

  const newMsg = {
    sender_id: userId,
    receiver_id: receiverId,
    message,
    timestamp: new Date().toISOString(),
  };

  // Emit to server
  socket.emit("send_message", newMsg);

  // Optimistic UI update
  const formatted = {
    id: `temp-${Date.now()}`,
    senderId: userId,
    content: newMsg.message,
    timestamp: newMsg.timestamp,
  };

  setMessages((prev) => [...prev, formatted]);
  setMessage("");
};

  const loadOlderMessages = () => {
    const socket = socketRef.current;
    if (!socket) return;

    const chatId = [userId, receiverId].sort((a, b) => a - b).join("_");
    const nextOffset = offset + 50;

    socket.emit("get_chat_history", {
      chatId,
      limit: 50,
      offset: nextOffset,
    });

    setOffset(nextOffset);
  };

  return (
    <div className="p-2" style={{ display: "flex" }}>
      <div><ChatList userId={userId} /></div>
      <div className="chat-container">
        <div className="chat-header">
          {userId == 1 ? (
            <span>Chat with admin</span>
          ) : (
            <span>Chat with {localStorage.getItem("receiver_name")}</span>
          )}
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={m.id}
              className={`message ${m.senderId == userId ? "sent" : "received"}`}
            >
              {m.content}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
