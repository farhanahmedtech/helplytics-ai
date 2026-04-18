"use client";

import { useState, useEffect } from "react";
import { getAllRequests } from "@/config/dbFunctions";
import { toast } from "sonner";
import Link from "next/link";
import {
    Search,
    Filter,
    X,
    Clock,
    User,
    Star,
    AlertCircle,
    SlidersHorizontal,
    ChevronDown,
    Sparkles,
    TrendingUp,
    Zap
} from "lucide-react";

export default function ExplorePage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [filters, setFilters] = useState({
        category: "all",
        urgency: "all",
        search: ""
    });
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        { value: "all", label: "All", icon: "✨", color: "gray" },
        { value: "Programming", label: "Programming", icon: "💻", color: "blue" },
        { value: "Design", label: "Design", icon: "🎨", color: "purple" },
        { value: "Mathematics", label: "Mathematics", icon: "📐", color: "green" },
        { value: "Science", label: "Science", icon: "🔬", color: "teal" },
        { value: "Language", label: "Language", icon: "📖", color: "amber" },
        { value: "Career", label: "Career", icon: "💼", color: "indigo" },
        { value: "Other", label: "Other", icon: "✨", color: "gray" }
    ];

    const urgencies = [
        { value: "all", label: "All", color: "gray" },
        { value: "Low", label: "Low", color: "green", icon: "🟢" },
        { value: "Medium", label: "Medium", color: "yellow", icon: "🟡" },
        { value: "High", label: "High", color: "orange", icon: "🟠" },
        { value: "Urgent", label: "Urgent", color: "red", icon: "🔴" }
    ];

    useEffect(() => {
        fetchRequests();
    }, [filters]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getAllRequests(filters);
            if (res.success) setRequests(res.data);
        } catch (error: any) {
            toast.error(error?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({ category: "all", urgency: "all", search: "" });
    };

    const activeFilterCount = (filters.category !== "all" ? 1 : 0) + (filters.urgency !== "all" ? 1 : 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-1">Find Help</h1>
                    <p className="text-white/80 text-sm">Browse requests from the community</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, description, or tags..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                    />
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showFilters
                                ? "bg-purple-600 text-white shadow-md"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear all
                        </button>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Categories */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => handleFilterChange("category", cat.value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                        ${filters.category === cat.value
                                                    ? `bg-${cat.color}-600 text-white shadow-sm`
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Urgencies */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                    Urgency Level
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {urgencies.map((urg) => (
                                        <button
                                            key={urg.value}
                                            onClick={() => handleFilterChange("urgency", urg.value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                        ${filters.urgency === urg.value
                                                    ? `bg-${urg.color}-600 text-white shadow-sm`
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {urg.icon && <span>{urg.icon}</span>}
                                            <span>{urg.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.category !== "all" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {categories.find(c => c.value === filters.category)?.icon}
                                {filters.category}
                                <button onClick={() => handleFilterChange("category", "all")} className="hover:text-purple-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {filters.urgency !== "all" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {urgencies.find(u => u.value === filters.urgency)?.icon}
                                {filters.urgency}
                                <button onClick={() => handleFilterChange("urgency", "all")} className="hover:text-purple-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            {requests.length} request{requests.length !== 1 ? 's' : ''} found
                        </p>
                        {requests.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Sparkles className="w-3 h-3" />
                                <span>Sorted by newest</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Finding help requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No requests found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-purple-600 text-sm hover:underline inline-flex items-center gap-1"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.map((request: any) => (
                            <RequestCard key={request._id} request={request} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Elegant Request Card Component
function RequestCard({ request }: { request: any }) {
    const urgencyConfig = {
        Urgent: { color: "red", bg: "bg-red-50", text: "text-red-700", icon: "🔴", label: "Urgent" },
        High: { color: "orange", bg: "bg-orange-50", text: "text-orange-700", icon: "🟠", label: "High" },
        Medium: { color: "yellow", bg: "bg-yellow-50", text: "text-yellow-700", icon: "🟡", label: "Medium" },
        Low: { color: "green", bg: "bg-green-50", text: "text-green-700", icon: "🟢", label: "Low" }
    };

    const urgency = urgencyConfig[request.urgency as keyof typeof urgencyConfig] || urgencyConfig.Medium;

    const categoryIcons: Record<string, string> = {
        Programming: "💻",
        Design: "🎨",
        Mathematics: "📐",
        Science: "🔬",
        Language: "📖",
        Career: "💼",
        Other: "✨"
    };

    return (
        <Link href={`/request/${request._id}`}>
            <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm">{categoryIcons[request.category] || "📝"}</span>
                        <span className="text-xs text-gray-500">{request.category}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgency.bg} ${urgency.text}`}>
                        {urgency.icon} {urgency.label}
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-relaxed">
                    {request.title}
                </h3>

                {/* Description Preview */}
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                    {request.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                <span className="text-[10px] text-white font-medium">
                                    {request.createdBy?.name?.charAt(0) || "?"}
                                </span>
                            </div>
                            <span className="text-xs text-gray-600">{request.createdBy?.name?.split(" ")[0]}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-500">{request.createdBy?.trustScore}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Helper Badge */}
                {request.helpers?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                        <div className="flex -space-x-1">
                            {request.helpers.slice(0, 2).map((helper: any, idx: number) => (
                                <div key={idx} className="w-4 h-4 rounded-full bg-green-100 border border-white flex items-center justify-center">
                                    <span className="text-[8px] text-green-700 font-medium">{helper.name?.charAt(0)}</span>
                                </div>
                            ))}
                        </div>
                        {request.helpers.length > 0 && (
                            <span className="text-[10px] text-gray-400">{request.helpers.length} helping</span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}