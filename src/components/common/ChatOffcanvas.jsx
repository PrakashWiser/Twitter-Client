import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { Baseurl } from "../../constant/url";
import io from "socket.io-client";

const ChatOffcanvas = ({
    show,
    handleClose,
    username,
    recipientUserId,
    currentUserId,
}) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const socket = useRef(null);
    const messageEndRef = useRef(null);

    const handleInsideClick = (e) => e.stopPropagation();

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

const fetchMessageHistory = async () => {
  try {
    const response = await fetch(
      `${Baseurl}messages/history?recipient=${username}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();

    if (response.ok) {
      setMessages(data.messages || []);
    } else {
      console.error("Failed to fetch message history:", data.error);
    }
  } catch (error) {
    console.error("Error fetching message history:", error);
  }
};


    const handleSendMessage = async () => {
        if (!message || !recipientUserId) return;

        try {
            const response = await fetch(`${Baseurl}messages/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    message,
                    recipient: username,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                socket.current?.emit("send_message", {
                    message,
                    recipientId: recipientUserId,
                    senderId: currentUserId,
                });

                setMessages((prev) => [
                    ...prev,
                    {
                        sender: currentUserId,
                        message,
                        timestamp: new Date().toISOString(),
                    },
                ]);

                setMessage("");
            } else {
                console.error("Failed to send message:", data.error);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        if (!currentUserId) return;

        if (!socket.current) {
            socket.current = io(Baseurl, {
                withCredentials: true,
            });

            socket.current.emit("register", currentUserId);

            socket.current.on("receive_message", (newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
            });
        }

        fetchMessageHistory();

        return () => {
            socket.current?.disconnect();
            socket.current = null;
        };
    }, [recipientUserId, currentUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div
            className={`fixed inset-0 bg-opacity-50 z-10 transition-opacity duration-300 ${show ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            onClick={handleClose}
        >
            <div
                className={`fixed right-0 bottom-0 w-full sm:w-96 h-full bg-white transition-transform duration-300 transform ${show ? "translate-x-0" : "translate-x-full"
                    } flex flex-col`}
                onClick={handleInsideClick}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h5 className="text-lg font-semibold text-blue-600">{username}</h5>
                    <button onClick={handleClose}>
                        <FaTimes className="text-gray-500 w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-2">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === currentUserId ? "justify-end" : "justify-start"
                                }`}
                        >
                            <span
                                className={`px-3 py-2 max-w-[80%] break-words rounded-lg ${msg.sender === currentUserId
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-800"
                                    }`}
                            >
                                {msg.message}
                            </span>
                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>

                <div className="p-4 border-t border-gray-200 bg-white text-black flex items-center gap-2">
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        onClick={handleSendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatOffcanvas;
