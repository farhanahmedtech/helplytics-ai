"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileText,
    Users,
    CheckCircle,
    Star,
    Plus,
    Search,
    Sparkles,
    TrendingUp,
    Award,
    Clock,
    ArrowRight,
    MessageCircle,
    Bell,
    Activity,
    Zap,
    Target,
    Heart,
    Shield,
    Calendar,
    BarChart3,
    HelpCircle,
    UserPlus,
    Gift,
    Trophy,
    Flame,
    LogOut,
    Settings,
    User,
    Menu,
    X
} from "lucide-react";
import { getDashboard, getMyRequests, getRequestsIAmHelping, getNotifications, logoutUser } from "@/config/dbFunctions";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        requestsCreated: 0,
        helpOffered: 0,
        helpResolved: 0,
        trustScore: 0,
        totalHelpGiven: 0,
        streak: 0,
        rank: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [helpingRequests, setHelpingRequests] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [pendingOffers, setPendingOffers] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            router.push("/login");
            return;
        }
        fetchDashboard();
    }, [user]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const [dashboardRes, myRequestsRes, helpingRes, notifRes] = await Promise.all([
                getDashboard(),
                getMyRequests(),
                getRequestsIAmHelping(),
                getNotifications()
            ]);

            if (dashboardRes.success) {
                setStats({
                    ...dashboardRes.data.stats,
                    streak: dashboardRes.data.stats.streak || 0,
                    rank: dashboardRes.data.stats.rank || 0
                });
                setAiInsights(dashboardRes.data.aiInsights);
            }

            if (myRequestsRes.success) {
                setRecentRequests(myRequestsRes.data);
                const pending = myRequestsRes.data.reduce((count: number, req: any) => {
                    return count + (req.helpers?.filter((h: any) => h.status === "pending").length || 0);
                }, 0);
                setPendingOffers(pending);
            }

            if (helpingRes.success) {
                setHelpingRequests(helpingRes.data);
            }

            if (notifRes.success) {
                setUnreadNotifications(notifRes.data.unreadCount);
            }
        } catch (error: any) {
            if (error?.response?.status === 401) {
                // Unauthorized - redirect to login
                logout();
                router.push("/login");
            } else {
                toast.error(error?.message || "Failed to load dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            router.push("/login");
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    const statCards = [
        {
            icon: <FileText className="w-5 h-5" />,
            label: "Requests",
            value: stats.requestsCreated,
            subtext: "Created",
            color: "blue",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            link: "/my-requests"
        },
        {
            icon: <Users className="w-5 h-5" />,
            label: "Helping",
            value: stats.helpOffered,
            subtext: "Active",
            color: "green",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            link: "/helping"
        },
        {
            icon: <CheckCircle className="w-5 h-5" />,
            label: "Resolved",
            value: stats.helpResolved,
            subtext: "Completed",
            color: "purple",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            link: "/my-requests?status=resolved"
        },
        {
            icon: <Star className="w-5 h-5" />,
            label: "Trust Score",
            value: stats.trustScore,
            subtext: "/100",
            color: "orange",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            link: "/profile"
        }
    ];

    const quickActions = [
        { icon: <Plus className="w-4 h-4" />, label: "Create", href: "/create-request", color: "purple" },
        { icon: <Search className="w-4 h-4" />, label: "Explore", href: "/explore", color: "blue" },
        { icon: <MessageCircle className="w-4 h-4" />, label: "Messages", href: "/messages", color: "green", badge: null },
        { icon: <Bell className="w-4 h-4" />, label: "Alerts", href: "/notifications", color: "orange", badge: unreadNotifications },
        { icon: <Trophy className="w-4 h-4" />, label: "Leaderboard", href: "/leaderboard", color: "yellow" },
        { icon: <Sparkles className="w-4 h-4" />, label: "AI Center", href: "/ai-center", color: "pink" }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">Helplytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/notifications" className="relative p-2">
                            <Bell className="w-5 h-5 text-gray-600" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </Link>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 animate-slide-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </Link>
                            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50">
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
                {/* Desktop Header with User Menu */}
                <div className="hidden lg:flex justify-end mb-6">
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </button>
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-fade-in">
                                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <div className="border-t border-gray-100 my-1" />
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-5">
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-xl font-bold">Welcome back, {user?.name?.split(" ")[0]}! 👋</h2>
                                    <p className="text-white/80 text-sm mt-0.5">Track your impact and help the community</p>
                                </div>
                                {stats.streak > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                        <Flame className="w-4 h-4 text-orange-300" />
                                        <span className="text-sm font-semibold">{stats.streak} day streak</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between gap-3 mt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.helpResolved}</div>
                                    <div className="text-xs text-white/80">Helped</div>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.rank || 0}</div>
                                    <div className="text-xs text-white/80">Global Rank</div>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{pendingOffers}</div>
                                    <div className="text-xs text-white/80">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {statCards.map((stat, idx) => (
                            <Link key={idx} href={stat.link}>
                                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                            <div className={stat.textColor}>{stat.icon}</div>
                                        </div>
                                        <span className="text-xs text-gray-400">{stat.subtext}</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* AI Insight */}
                    {aiInsights.length > 0 && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                            <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-amber-800">{aiInsights[0]}</p>
                                </div>
                                <Link href="/ai-center" className="text-xs text-amber-600 font-medium flex-shrink-0">
                                    Details →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                            {quickActions.map((action:any, idx:number) => (
                                <Link key={idx} href={action.href}>
                                    <div className="bg-white rounded-xl p-3 text-center border border-gray-100 hover:shadow-md transition-all relative">
                                        <div className={`w-8 h-8 rounded-lg bg-${action.color}-50 flex items-center justify-center mx-auto mb-1.5`}>
                                            <div className={`text-${action.color}-600`}>{action.icon}</div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">{action.label}</p>
                                        {action.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                                {action.badge}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Active Help Section */}
                    {helpingRequests.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-green-600" />
                                    Actively Helping ({helpingRequests.length})
                                </h3>
                                <Link href="/helping" className="text-xs text-purple-600">View all →</Link>
                            </div>
                            <div className="space-y-2">
                                {helpingRequests.slice(0, 2).map((request: any) => (
                                    <Link key={request._id} href={`/request/${request._id}`}>
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{request.title}</h4>
                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                                                    In Progress
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <UserIcon className="w-3 h-3" />
                                                <span>{request.createdBy?.name}</span>
                                                <span>•</span>
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Offers Alert */}
                    {pendingOffers > 0 && (
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-xs text-blue-800">
                                        <span className="font-semibold">{pendingOffers}</span> people want to help your requests
                                    </p>
                                </div>
                                <Link href="/my-requests" className="text-xs text-blue-600 font-medium">
                                    Review →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-gray-500" />
                                Recent Activity
                            </h3>
                            <Link href="/my-requests" className="text-xs text-purple-600">History →</Link>
                        </div>

                        {recentRequests.length === 0 && helpingRequests.length === 0 ? (
                            <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
                                <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">No activity yet</p>
                                <Link href="/create-request" className="text-purple-600 text-xs mt-1 inline-block">
                                    Create your first request →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentRequests.slice(0, 2).map((request: any) => (
                                    <Link key={request._id} href={`/request/${request._id}`}>
                                        <div className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{request.title}</h4>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${request.status === "open" ? "bg-green-100 text-green-700" :
                                                        request.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                                                            "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                                <span>{request.helpers?.length || 0} offers</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Achievement Badge */}
                    {stats.helpResolved >= 5 && (
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-3 border border-yellow-200">
                            <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4 text-yellow-600" />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-yellow-800">🎉 Achievement Unlocked!</p>
                                    <p className="text-xs text-yellow-700">You've helped {stats.helpResolved} people. Great job!</p>
                                </div>
                                <Link href="/leaderboard" className="text-xs text-yellow-600">Share →</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper components
function UserIcon(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function LayoutDashboard(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}