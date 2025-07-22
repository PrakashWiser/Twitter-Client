import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { Baseurl } from "../../constant/url";
import io from "socket.io-client";

const ChatOffcanvas = ({ show, handleClose, username }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const socket = React.useRef(null);

    const handleInsideClick = (e) => {
        e.stopPropagation();
    };

    // Function to fetch message history
    const fetchMessageHistory = async () => {
        try {
            const response = await fetch(`${Baseurl}messages/history?recipient=${username}`, {
                method: "GET",
                credentials: "include", // To include cookies for authentication
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Message history fetched:", data.messages);
                setMessages(data.messages); // Set message history state
            } else {
                console.error("Failed to fetch message history:", data.error);
            }
        } catch (error) {
            console.error("Error fetching message history:", error);
        }
    };

    // Send message logic
    const handleSendMessage = async () => {
        if (!message) return;

        try {
            const response = await fetch(`${Baseurl}messages/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    recipient: username,
                }),
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Message sent:", data);
                setMessage("");

                socket.current.emit("send_message", {
                    message,
                    recipient: username,
                    sender: "currentUser",
                });
            } else {
                console.error("Failed to send message:", data.error);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Socket.IO connection
    useEffect(() => {
        socket.current = io(Baseurl);

        // Listening for incoming messages
        socket.current.on("receive_message", (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        // Fetch message history when component mounts
        fetchMessageHistory();

        // Cleanup socket connection on unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [username]); // Re-run effect when username changes

    return (
        <div
            className={`fixed inset-0 bg-opacity-50 transition-all duration-300 ${show ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            onClick={handleClose}
        >
            <div
                className={`fixed right-0 bottom-0 w-96 h-full bg-white transition-all duration-300 transform ${show ? "translate-x-0" : "translate-x-full"
                    } flex flex-col`}
                onClick={handleInsideClick}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-300">
                    <h5 className="text-xl font-semibold">Chat with @{username}</h5>
                    <button onClick={handleClose}>
                        <FaTimes className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div
                    className="flex-grow p-4 overflow-y-auto space-y-4"
                    style={{ maxHeight: "calc(100% - 120px)" }}
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`mb-4 ${msg.sender === username ? "text-left" : "text-right"}`}
                        >
                            <span
                                className={`p-2 rounded-lg ${msg.sender === username ? "bg-gray-300 text-gray-800" : "bg-blue-500 text-white"}`}
                            >
                                {msg.message}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t text-gray-400 bg-white flex items-center gap-2">
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded-md focus:outline-none"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white p-2 rounded-md"
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
