"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRequestsIAmHelping } from "@/config/dbFunctions";
import { toast } from "sonner";
import {
    Users,
    Clock,
    ChevronRight,
    Heart,
    MessageCircle,
    CheckCircle,
    Star,
    User,
    Sparkles,
    TrendingUp,
    Award
} from "lucide-react";

export default function HelpingPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({
        totalHelping: 0,
        completed: 0,
        impact: 0
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getRequestsIAmHelping();
            if (res.success) {
                setRequests(res.data);
                setStats({
                    totalHelping: res.data.length,
                    completed: res.data.filter((r: any) => r.status === "resolved").length,
                    impact: res.data.reduce((acc: number, r: any) => acc + (r.helpers?.length || 0), 0)
                });
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to fetch helping requests");
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "Urgent": return "bg-red-100 text-red-700 border-red-200";
            case "High": return "bg-orange-100 text-orange-700 border-orange-200";
            case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-green-100 text-green-700 border-green-200";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading your helping journey...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">Helping Others</h1>
                    </div>
                    <p className="text-white/80 text-sm">Track the requests you're helping with</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Cards */}
                {stats.totalHelping > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-1">
                                <Heart className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.totalHelping}</div>
                            <div className="text-xs text-gray-500">Active Helps</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-1">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.completed}</div>
                            <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-1">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.impact}</div>
                            <div className="text-xs text-gray-500">People Helped</div>
                        </div>
                    </div>
                )}

                {/* Impact Message */}
                {stats.totalHelping === 0 && !loading && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 text-center mb-6 border border-green-100">
                        <Heart className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Start Your Helping Journey</h3>
                        <p className="text-sm text-gray-600 mb-4">Browse requests and make a difference in someone's life</p>
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                        >
                            Explore Requests
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* Impact Quote */}
                {stats.totalHelping > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 mb-6 border border-amber-100">
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-amber-800">
                                    ✨ You've helped <span className="font-semibold">{stats.impact}</span> people so far!
                                    {stats.completed > 0 && ` ${stats.completed} requests completed.`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Requests List */}
                {requests.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                                Active Conversations ({requests.length})
                            </h2>
                            <span className="text-xs text-gray-400">Updated recently</span>
                        </div>

                        {requests.map((request: any) => (
                            <Link key={request._id} href={`/request/${request._id}`}>
                                <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer">
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {request.urgency && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                                                    {request.urgency}
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Heart className="w-3 h-3" />
                                                Helping
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                                        {request.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                        {request.description}
                                    </p>

                                    {/* Requester Info */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                                <span className="text-[10px] text-white font-medium">
                                                    {request.createdBy?.name?.charAt(0) || "U"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-700">{request.createdBy?.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-[10px] text-gray-500">{request.createdBy?.trustScore}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {request.helpers?.length > 1 && (
                                                <div className="flex items-center gap-0.5 text-xs text-gray-400">
                                                    <Users className="w-3 h-3" />
                                                    <span>{request.helpers.length} helping</span>
                                                </div>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Progress Indicator */}
                                    {request.status === "in-progress" && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                <span>In Progress</span>
                                                <span>Waiting for resolution</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="w-2/3 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Achievement Badge */}
                {stats.completed >= 3 && (
                    <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-semibold text-yellow-800">Community Hero</span>
                        </div>
                        <p className="text-xs text-yellow-700">
                            You've completed {stats.completed} requests! Thank you for being an amazing helper.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}