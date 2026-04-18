"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Compass,
    PlusCircle,
    MessageCircle,
    Trophy,
    Brain,
    Bell,
    User,
    LogOut,
    Menu,
    X,
    FileText,
    HelpCircle,
    Sparkles
} from "lucide-react";
import { getNotifications } from "@/config/dbFunctions";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: PlusCircle, label: "Create Request", href: "/create-request" },
    { icon: FileText, label: "My Requests", href: "/my-requests" },
    { icon: HelpCircle, label: "Helping", href: "/helping" },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: Brain, label: "AI Center", href: "/ai-center" },
];

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    // ✅ Check authentication in useEffect
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            if (res.success) {
                setUnreadNotifications(res.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const handleLogout = () => {
        logout();
    };

    // ✅ Show loading state while checking auth
    if (loading) {
        return <div>Loading</div>;
    }

    // ✅ Don't render anything if no user (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="p-2">
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link href="/dashboard" className="text-xl font-bold gradient-text">
                        Helplytics
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/notifications" className="relative p-2">
                            <Bell className="w-5 h-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </Link>
                        <Link href="/messages" className="relative p-2">
                            <MessageCircle className="w-5 h-5" />
                            {unreadMessages > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-40 w-72 h-screen bg-white border-r border-gray-200 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            <span className="text-xl font-bold gradient-text">Helplytics AI</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <div className="px-3 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive
                                                ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }
                    `}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        <Link
                            href="/profile"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <User className="w-5 h-5" />
                            <span>Profile</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 pt-16 lg:pt-0">
                {/* Header */}
                <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Welcome back, {user?.name?.split(" ")[0]}!
                    </h1>
                    <div className="flex items-center gap-4">
                        <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </Link>
                        <Link href="/messages" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            {unreadMessages > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </Link>
                        <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}