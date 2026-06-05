import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../environment/environment';
import { createOrGetConversation, sendMessage, listenToMessages, getBookingFromMessage } from '../services/chat.service';
import { doc, getDoc } from 'firebase/firestore';

const Chat = () => {
    const { conversationId, otherUserId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation and setup real-time listener
    useEffect(() => {
        const loadConversation = async () => {
            try {
                if (!auth.currentUser) {
                    navigate('/signin');
                    return;
                }

                let convoId = conversationId;

                // Create or get conversation if otherUserId is provided
                if (!convoId && otherUserId) {
                    convoId = await createOrGetConversation(auth.currentUser.uid, otherUserId);
                }

                if (!convoId) {
                    throw new Error("Conversation not found");
                }

                // Get conversation details
                const convoRef = doc(db, "conversations", convoId);
                const convoSnap = await getDoc(convoRef);

                if (convoSnap.exists()) {
                    setConversation({ id: convoId, ...convoSnap.data() });

                    // Get other participant info
                    const otherId = convoSnap.data().participants.find(id => id !== auth.currentUser.uid);
                    const otherUserRef = doc(db, "service_providers", otherId);
                    let otherUserSnap = await getDoc(otherUserRef);

                    if (!otherUserSnap.exists()) {
                        const customerRef = doc(db, "customers", otherId);
                        otherUserSnap = await getDoc(customerRef);
                    }

                    setOtherUser(otherUserSnap.data());
                }

                // Setup real-time message listener
                const unsubscribe = listenToMessages(convoId, (msgs) => {
                    setMessages(msgs);
                    setLoading(false);
                });

                return unsubscribe;
            } catch (err) {
                console.error("Error loading conversation:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        const unsubscribe = loadConversation();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [conversationId, otherUserId, navigate]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation) return;

        setSending(true);
        try {
            await sendMessage(conversation.id, newMessage);
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message: " + err.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
                    <button
                        onClick={() => navigate('/bookings')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/bookings')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ←
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {otherUser?.name || 'Chat'}
                            </h2>
                            {otherUser?.role && (
                                <p className="text-sm text-gray-500">{otherUser.role}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <p className="mb-2">Start a conversation</p>
                        <p className="text-sm">Send your first message to {otherUser?.name || 'this user'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                                        msg.senderId === auth.currentUser?.uid
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={`text-xs mt-1 ${
                                        msg.senderId === auth.currentUser?.uid
                                            ? 'text-indigo-200'
                                            : 'text-gray-600'
                                    }`}>
                                        {new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                        >
                            {sending ? '⏳' : '📤'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
