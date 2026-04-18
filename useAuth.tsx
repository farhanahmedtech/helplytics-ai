"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, getMyRequests, getRequestsIAmHelping } from "@/config/dbFunctions";
import { toast } from "sonner";
import {
    Send,
    MessageCircle,
    Clock,
    Search,
    ArrowLeft,
    Heart,
    HelpCircle,
    CheckCheck,
    Check,
    Smile,
    Paperclip,
    MoreVertical,
    Phone,
    Video,
    Sparkles,
    Users,
    Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
    _id: string;
    message: string;
    from: { _id: string; name: string };
    to: { _id: string; name: string };
    createdAt: string;
    read: boolean;
}

interface Conversation {
    id: string;
    requestId: string;
    title: string;
    otherPerson: {
        id: string;
        name: string;
        email: string;
        trustScore?: number;
    };
    role: "helper" | "requester";
    lastMessage: string;
    lastMessageText?: string;
    unread: number;
}

export default function MessagesPage() {
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchAllConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchAllConversations = async () => {
        setLoading(true);
        try {
            const [myRequestsRes, helpingRequestsRes] = await Promise.all([
                getMyRequests(),
                getRequestsIAmHelping()
            ]);

            let allConversations: Conversation[] = [];

            // Conversations where others help you
            if (myRequestsRes.success && myRequestsRes.data) {
                myRequestsRes.data.forEach((request: any) => {
                    if (request.helpers?.length > 0) {
                        request.helpers.forEach((helper: any) => {
                            allConversations.push({
                                id: `${request._id}_${helper._id}`,
                                requestId: request._id,
                                title: request.title,
                                otherPerson: {
                                    id: helper._id,
                                    name: helper.name,
                                    email: helper.email || "",
                                    trustScore: helper.trustScore || 70
                                },
                                role: "helper",
                                lastMessage: request.updatedAt,
                                lastMessageText: `💚 ${helper.name} is helping you`,
                                unread: 0
                            });
                        });
                    }
                });
            }

            // Conversations where you help others
            if (helpingRequestsRes.success && helpingRequestsRes.data) {
                helpingRequestsRes.data.forEach((request: any) => {
                    allConversations.push({
                        id: `${request._id}_${request.createdBy?._id}`,
                        requestId: request._id,
                        title: request.title,
                        otherPerson: {
                            id: request.createdBy?._id,
                            name: request.createdBy?.name || "Unknown",
                            email: request.createdBy?.email || "",
                            trustScore: request.createdBy?.trustScore || 70
                        },
                        role: "requester",
                        lastMessage: request.updatedAt,
                        lastMessageText: `🤝 You're helping ${request.createdBy?.name}`,
                        unread: 0
                    });
                });
            }

            const uniqueConversations = allConversations.filter(
                (conv, index, self) => index === self.findIndex((c) => c.id === conv.id)
            );

            uniqueConversations.sort(
                (a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime()
            );

            setConversations(uniqueConversations);

            if (uniqueConversations.length > 0 && !selectedChat) {
                setSelectedChat(uniqueConversations[0]);
                fetchMessages(uniqueConversations[0].requestId);
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (requestId: string) => {
        try {
            const res = await getMessages(requestId);
            if (res.success) {
                const messagesWithDirection = res.data.map((msg: Message) => ({
                    ...msg,
                    isFromMe: msg.from?._id === user?.id
                }));
                setMessages(messagesWithDirection);
            }
        } catch (error: any) {
            toast.error("Failed to load messages");
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        setSending(true);
        try {
            const res = await sendMessage({
                requestId: selectedChat.requestId,
                to: selectedChat.otherPerson.id,
                message: newMessage
            });

            if (res.success) {
                const newMsg = {
                    ...res.data,
                    isFromMe: true
                };
                setMessages([...messages, newMsg]);
                setNewMessage("");
                scrollToBottom();

                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === selectedChat.id
                            ? { ...conv, lastMessage: new Date().toISOString() }
                            : conv
                    )
                );
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleSelectChat = (conversation: Conversation) => {
        setSelectedChat(conversation);
        fetchMessages(conversation.requestId);
    };

    const filteredConversations = conversations.filter(
        conv =>
            conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.otherPerson.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (date: string) => {
        const msgDate = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - msgDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return msgDate.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <MessageCircle className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">Messages</h1>
                    </div>
                    <p className="text-white/80 text-sm">Chat with people in your community</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="flex flex-col md:flex-row h-[calc(100vh-200px)]">
                        {/* Conversations Sidebar */}
                        <div className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col">
                            {/* Search */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Conversations List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageCircle className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No conversations yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Create requests or help others to start chatting</p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => handleSelectChat(conv)}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50
                        ${selectedChat?.id === conv.id ? 'bg-gradient-to-r from-purple-50 to-blue-50' : ''}
                      `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="relative">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm
                            ${conv.role === 'helper'
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                                        }`}
                                                    >
                                                        {conv.otherPerson.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 truncate">{conv.title}</h3>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                {conv.role === 'helper' ? (
                                                                    <>
                                                                        <Heart className="w-3 h-3 text-green-500" />
                                                                        <p className="text-xs text-green-600 truncate">
                                                                            {conv.otherPerson.name} is helping you
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <HelpCircle className="w-3 h-3 text-purple-500" />
                                                                        <p className="text-xs text-purple-600 truncate">
                                                                            You're helping {conv.otherPerson.name}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                            {formatTime(conv.lastMessage)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <div className="flex items-center gap-0.5">
                                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                            <span className="text-xs text-gray-500">{conv.otherPerson.trustScore || 70}</span>
                                                        </div>
                                                        {conv.lastMessageText && (
                                                            <p className="text-xs text-gray-400 truncate">
                                                                {conv.lastMessageText}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        {selectedChat ? (
                            <div className="flex-1 flex flex-col bg-gray-50">
                                {/* Chat Header */}
                                <div className="bg-white border-b border-gray-100 px-5 py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedChat(null)}
                                            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm
                      ${selectedChat.role === 'helper'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                            }`}
                                        >
                                            {selectedChat.otherPerson.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{selectedChat.otherPerson.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    {selectedChat.otherPerson.trustScore || 70}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    Active now
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                            <Video className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <Sparkles className="w-10 h-10 text-purple-500" />
                                                </div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Start a conversation</h4>
                                                <p className="text-gray-500 text-sm max-w-sm">
                                                    Send a message to {selectedChat.otherPerson.name} about "{selectedChat.title}"
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((msg: any, idx) => (
                                                <div
                                                    key={msg._id || idx}
                                                    className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                                >
                                                    <div className={`max-w-[75%] ${msg.isFromMe
                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                                        : 'bg-white text-gray-900 shadow-sm rounded-bl-none'
                                                        } rounded-2xl px-4 py-2.5`}
                                                    >
                                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                                        <div className={`flex items-center gap-1 mt-1 ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}>
                                                            <span className={`text-[10px] ${msg.isFromMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                                {formatTime(msg.createdAt)}
                                                            </span>
                                                            {msg.isFromMe && (
                                                                msg.read ? (
                                                                    <CheckCheck className="w-3 h-3 text-blue-300" />
                                                                ) : (
                                                                    <Check className="w-3 h-3 text-purple-300" />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="bg-white border-t border-gray-100 p-4">
                                    <div className="flex gap-2">
                                        <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder={`Message ${selectedChat.otherPerson.name}...`}
                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={sending || !newMessage.trim()}
                                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span className="hidden sm:inline text-sm">Send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <MessageCircle className="w-12 h-12 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a conversation</h3>
                                    <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}