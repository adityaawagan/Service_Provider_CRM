import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../environment/environment';
import { getUserConversations } from '../services/chat.service';

const ChatList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadConversations = async () => {
            try {
                if (!auth.currentUser) {
                    navigate('/signin');
                    return;
                }

                const convos = await getUserConversations();
                setConversations(convos);
                setLoading(false);
            } catch (err) {
                console.error("Error loading conversations:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadConversations();
    }, [navigate]);

    const handleOpenChat = (conversationId) => {
        navigate(`/chat/${conversationId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600 mt-1">Chat with customers or service providers</p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        Error: {error}
                    </div>
                )}

                {/* Conversations List */}
                {conversations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                        <p className="text-gray-500 text-lg">No conversations yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Book a service or wait for booking requests to start messaging
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => handleOpenChat(conversation.id)}
                                className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors duration-150"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {conversation.otherParticipant?.name || 'Unknown User'}
                                        </h3>
                                        {conversation.otherParticipant?.role && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {conversation.otherParticipant.role}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 mt-2 truncate">
                                            {conversation.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-xs text-gray-500">
                                            {new Date(conversation.lastMessageTime.toDate()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
