import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Send, User, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(config.API_URL);

const Chat = () => {
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();

        // Listen for incoming messages
        socket.on('chat_message', (msg) => {
            // Only add if it belongs to current active chat OR update conversation list
            if (activeChat && (msg.senderId === activeChat._id || msg.senderId === user.id)) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
            // Refresh conversations to show unread/latest
            fetchConversations();
        });

        return () => {
            socket.off('chat_message');
        };
    }, [activeChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.API_URL}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadChat = async (contact) => {
        setActiveChat(contact);
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.API_URL}/api/chat/${contact._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
            setLoading(false);
            scrollToBottom();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const token = localStorage.getItem('token');
            const payload = {
                receiverId: activeChat._id,
                content: newMessage
            };

            await axios.post(`${config.API_URL}/api/chat`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Allow optimistic update or wait for socket
            // setMessages([...messages, { ...payload, senderId: user.id, createdAt: new Date() }]);
            setNewMessage('');
        } catch (err) {
            alert("Failed to send message");
        }
    };

    return (
        <DashboardLayout user={user} title="Messages" subtitle="Chat with Parents and Staff">
            <div className="flex h-[calc(100vh-180px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* LEFT: Sidebar (Conversations) */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No chats yet.</p>
                            </div>
                        )}
                        {conversations.map(contact => (
                            <div
                                key={contact._id}
                                onClick={() => loadChat(contact)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${activeChat?._id === contact._id ? 'bg-green-50 border-green-200' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{contact.name}</h4>
                                    <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-100 rounded-full">{contact.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Chat Window */}
                <div className="w-2/3 flex flex-col bg-slate-50">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                                    {activeChat.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{activeChat.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{activeChat.role}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loading && <div className="text-center text-gray-400">Loading history...</div>}
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user.id || msg.senderId === user._id; // Handle both ID formats
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button type="submit" className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/20">
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">Select a contact to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Chat;
