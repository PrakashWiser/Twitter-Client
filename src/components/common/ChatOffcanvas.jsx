"use client";
import { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { FiSmile, FiCheck } from "react-icons/fi";
import { VscSend } from "react-icons/vsc";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { Baseurl, ChatUrl } from "../../constant/url";
import { auth } from "../../firebase/config"
import { getIdToken } from "firebase/auth";

const ChatOffcanvas = ({
    show,
    handleClose,
    username,
    recipientUserId,
    currentUserId,
    profileImg,
}) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messageEndRef = useRef(null);
    const pickerRef = useRef(null);
    const socket = useRef(null);

    const getFirebaseToken = async () => {
        try {
            const user = auth?.currentUser;
            if (!user) {
                throw new Error("No authenticated user. Please sign in.");
            }
            const token = await getIdToken(user);
            console.log("Firebase token:", token);
            return token;
        } catch (error) {
            console.error("Error getting Firebase token:", error.message);
            throw error;
        }
    };

    useEffect(() => {
        if (!currentUserId) return;

        if (!socket.current) {
            socket.current = io(ChatUrl, { withCredentials: true });
            getFirebaseToken()
                .then((token) => {
                    socket.current.emit("authenticate", token);
                    console.log("Emitted authenticate with token");
                })
                .catch((error) => {
                    console.error("Failed to authenticate Socket.IO:", error.message);
                });
            socket.current.on("connect", () => console.log("Socket.IO connected:", socket.current.id));
            socket.current.on("connect_error", (error) => console.error("Socket.IO connection error:", error.message));
            socket.current.on("error", (error) => console.error("Socket.IO error:", error.message));
            socket.current.on("receive_message", (newMessage) => {
                console.log("Received message:", newMessage);
                setMessages((prev) => {
                    if (prev.some((msg) => msg.id === newMessage.messageId)) {
                        return prev.map((msg) =>
                            msg.id === newMessage?.messageId ? { ...msg, status: newMessage?.status } : msg
                        );
                    }
                    return [
                        ...prev,
                        {
                            id: newMessage?.messageId,
                            text: newMessage?.message,
                            sender: newMessage?.sender,
                            timestamp: new Date(newMessage?.timestamp).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Kolkata",
                            }),
                            date: new Date(newMessage?.timestamp).toLocaleDateString("en-IN", {
                                timeZone: "Asia/Kolkata",
                            }),
                            status: newMessage?.status,
                        },
                    ];
                });
            });
            socket.current.on("message_status_updated", ({ messageId, status }) => {
                console.log("Status updated:", { messageId, status });
                setMessages((prev) =>
                    prev.map((msg) => (msg?.id === messageId ? { ...msg, status } : msg))
                );
            });
        }

        return () => {
            socket.current?.disconnect();
            socket.current = null;
        };
    }, [currentUserId]);

    useEffect(() => {
        const fetchMessageHistory = async () => {
            try {
                const response = await fetch(`${Baseurl}messages/history?recipient=${username}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                if (response.ok) {
                    const mappedMessages = data.messages?.map((item) => ({
                        id: item?._id,
                        text: item?.message,
                        sender: item?.sender,
                        timestamp: new Date(item?.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Kolkata",
                        }),
                        date: new Date(item?.timestamp).toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                        }),
                        status: item?.status || "sent",
                    })) || [];
                    setMessages(mappedMessages);
                } else {
                    console.error("Failed to fetch messages:", data.error);
                }
            } catch (error) {
                console.error("Error fetching messages:", error.message);
            }
        };

        if (username && show) {
            fetchMessageHistory();
        }
    }, [username, show]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender !== currentUserId && lastMessage.status !== "read") {
                socket.current?.emit("message_read", { messageId: lastMessage.id });
            }
        }
    }, [messages, currentUserId]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showEmojiPicker]);

    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !recipientUserId) return;

        const tempId = `${Date.now()}-${Math.random()}`;
        const localMessage = {
            id: tempId,
            text: message,
            sender: currentUserId,
            timestamp: new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
            }),
            date: new Date().toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
            }),
            status: "sent",
        };

        setMessages((prev) => [...prev, localMessage]);
        setMessage("");

        try {
            const response = await fetch(`${Baseurl}messages/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message, recipient: username }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempId ? { ...msg, id: data.data?._id, status: "sent" } : msg
                    )
                );
                socket.current?.emit("send_message", {
                    message,
                    recipientId: recipientUserId,
                    senderId: currentUserId,
                    messageId: data.data?._id,
                });
            } else {
                console.error("Failed to send message:", data.error);
                setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            }
        } catch (error) {
            console.error("Error sending message:", error.message);
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        }
    };

    const formatMessageDate = (dateStr) => {
        const today = new Date().toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
        });
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
        });
        if (dateStr === today) return "Today";
        if (dateStr === yesterdayStr) return "Yesterday";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });
    };

    const MessageStatus = ({ status }) => {
        switch (status) {
            case "sent":
                return <FiCheck className="text-gray-500" />;
            case "delivered":
                return (
                    <div className="flex">
                        <FiCheck className="text-gray-500" />
                        <FiCheck className="-ml-1 text-gray-500" />
                    </div>
                );
            case "read":
                return (
                    <div className="flex">
                        <FiCheck className="text-blue-500" />
                        <FiCheck className="-ml-1 text-blue-500" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-opacity-50 z-10 transition-opacity duration-300 ${show ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            onClick={handleClose}
        >
            <div
                className={`fixed right-0 bottom-0 w-full sm:w-96 h-full bg-white transition-transform duration-300 transform ${show ? "translate-x-0" : "translate-x-full"
                    } flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        {profileImg ? (
                            <img
                                src={profileImg}
                                alt={`${username}'s profile`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600">
                                {username?.[0]?.toUpperCase() || "U"}
                            </span>
                        )}
                        <h5 className="text-lg font-semibold text-blue-600">{username}</h5>
                    </div>
                    <button onClick={handleClose}>
                        <FaTimes className="text-gray-500 w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.reduce((acc, msg, index) => {
                        if (index === 0 || messages[index - 1].date !== msg.date) {
                            acc.push(
                                <div
                                    key={`date-${msg.date}`}
                                    className="text-center text-gray-400 text-sm"
                                >
                                    {formatMessageDate(msg.date)}
                                </div>
                            );
                        }
                        acc.push(
                            <div
                                key={msg.id}
                                className={`flex items-end gap-2 ${msg.sender === currentUserId ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-xs text-sm ${msg.sender === currentUserId
                                        ? "bg-blue-100 text-right text-black"
                                        : "bg-gray-100 text-left text-black"
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <div className="flex items-center justify-end mt-1 space-x-1">
                                        <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                                        {msg.sender === currentUserId && <MessageStatus status={msg.status} />}
                                    </div>
                                </div>
                            </div>
                        );
                        return acc;
                    }, [])}
                    <div ref={messageEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiSmile className="w-6 h-6" />
                    </button>
                    {showEmojiPicker && (
                        <div ref={pickerRef} className="absolute bottom-12 left-4 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={handleSendMessage}
                    >
                        <VscSend className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatOffcanvas;