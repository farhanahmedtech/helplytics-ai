"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyRequests, deleteRequest, updateRequest, rateHelper } from "@/config/dbFunctions";
import { toast } from "sonner";
import {
    FileText,
    Clock,
    ChevronRight,
    Edit2,
    Trash2,
    Filter,
    Search,
    X,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    Eye,
    Copy,
    Share2,
    Users,
    Star,
    MessageCircle,
    Award,
    TrendingUp,
    Calendar,
    UserCheck,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    Send
} from "lucide-react";

export default function MyRequestsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingRequest, setEditingRequest] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
    const [selectedHelper, setSelectedHelper] = useState<any>(null);
    const [showHelperModal, setShowHelperModal] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingHover, setRatingHover] = useState(0);
    const [ratingFeedback, setRatingFeedback] = useState("");
    const [ratingId, setRatingId] = useState<string | null>(null);
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getMyRequests();
            if (res.success) {
                setRequests(res.data);
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) return;

        setDeletingId(id);
        try {
            const res = await deleteRequest(id);
            if (res.success) {
                toast.success("Request deleted successfully");
                setRequests(requests.filter((r: any) => r._id !== id));
            } else {
                toast.error(res.message || "Failed to delete request");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async () => {
        if (!editingRequest) return;

        try {
            const res = await updateRequest(editingRequest._id, {
                title: editingRequest.title,
                description: editingRequest.description,
                category: editingRequest.category,
                urgency: editingRequest.urgency,
                tags: editingRequest.tags
            });
            if (res.success) {
                toast.success("Request updated successfully");
                setShowEditModal(false);
                fetchRequests();
            } else {
                toast.error(res.message || "Failed to update request");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        }
    };

    const handleRateHelper = async (helperId: string, requestId: string) => {
        if (ratingValue === 0) {
            toast.error("Please select a rating");
            return;
        }

        try {
            const res = await rateHelper(requestId, helperId, ratingValue, ratingFeedback);
            if (res.success) {
                toast.success(`Thank you for rating! ${ratingValue} stars`);
                setShowHelperModal(false);
                setRatingValue(0);
                setRatingFeedback("");
                setRatingId(null);
                fetchRequests();
            } else {
                toast.error(res.message || "Failed to submit rating");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        }
    };

    const handleDuplicate = async (request: any) => {
        router.push(`/create-request?duplicate=${request._id}`);
    };

    const handleShare = (request: any) => {
        const url = `${window.location.origin}/request/${request._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        setShowActionsMenu(null);
    };

    const handleMessageHelper = (helperId: string, requestId: string) => {
        router.push(`/messages?user=${helperId}&request=${requestId}`);
    };

    const filteredRequests = requests.filter((request: any) => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || request.status === statusFilter;
        const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter;
        return matchesSearch && matchesStatus && matchesUrgency;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-green-100 text-green-700";
            case "in-progress": return "bg-blue-100 text-blue-700";
            case "resolved": return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "open": return <AlertCircle className="w-3 h-3" />;
            case "in-progress": return <Clock className="w-3 h-3" />;
            case "resolved": return <CheckCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "Urgent": return "bg-red-100 text-red-700";
            case "High": return "bg-orange-100 text-orange-700";
            case "Medium": return "bg-yellow-100 text-yellow-700";
            default: return "bg-green-100 text-green-700";
        }
    };

    const stats = {
        total: requests.length,
        open: requests.filter((r: any) => r.status === "open").length,
        inProgress: requests.filter((r: any) => r.status === "in-progress").length,
        resolved: requests.filter((r: any) => r.status === "resolved").length,
        totalHelpers: requests.reduce((acc: number, r: any) => acc + (r.helpers?.length || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading your requests...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <FileText className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">My Requests</h1>
                    </div>
                    <p className="text-white/80 text-sm">Manage and track all your help requests</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                        <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                        <div className="text-xl font-bold text-green-600">{stats.open}</div>
                        <div className="text-xs text-gray-500">Open</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                        <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                        <div className="text-xl font-bold text-gray-600">{stats.resolved}</div>
                        <div className="text-xs text-gray-500">Resolved</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                        <div className="text-xl font-bold text-purple-600">{stats.totalHelpers}</div>
                        <div className="text-xs text-gray-500">Helpers</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filters
                            {(statusFilter !== "all" || urgencyFilter !== "all") && (
                                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                            )}
                        </button>

                        {(statusFilter !== "all" || urgencyFilter !== "all" || searchTerm) && (
                            <button
                                onClick={() => {
                                    setStatusFilter("all");
                                    setUrgencyFilter("all");
                                    setSearchTerm("");
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Clear all
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4 animate-fade-in">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-2 block">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {["all", "open", "in-progress", "resolved"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${statusFilter === status
                                                ? "bg-purple-600 text-white"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {status === "all" ? "All" : status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-2 block">Urgency</label>
                                <div className="flex flex-wrap gap-2">
                                    {["all", "Low", "Medium", "High", "Urgent"].map((urgency) => (
                                        <button
                                            key={urgency}
                                            onClick={() => setUrgencyFilter(urgency)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${urgencyFilter === urgency
                                                ? "bg-purple-600 text-white"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {urgency}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                {!loading && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                )}

                {/* Requests List */}
                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No requests found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {requests.length === 0
                                ? "You haven't created any requests yet."
                                : "Try adjusting your filters"}
                        </p>
                        {requests.length === 0 && (
                            <Link href="/create-request" className="text-purple-600 text-sm hover:underline mt-3 inline-block">
                                Create your first request →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request: any) => (
                            <div
                                key={request._id}
                                className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                            >
                                {/* Request Header */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900">{request.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                                                    {request.urgency}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                    {getStatusIcon(request.status)}
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{request.description}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {request.helpers?.length || 0} people helping
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                                                className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                                                title="View helpers"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/request/${request._id}`}
                                                className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowActionsMenu(showActionsMenu === request._id ? null : request._id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {showActionsMenu === request._id && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-fade-in">
                                                        <button
                                                            onClick={() => {
                                                                setEditingRequest(request);
                                                                setShowEditModal(true);
                                                                setShowActionsMenu(null);
                                                            }}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicate(request)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            Duplicate
                                                        </button>
                                                        <button
                                                            onClick={() => handleShare(request)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Share2 className="w-3.5 h-3.5" />
                                                            Share
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(request._id)}
                                                            disabled={deletingId === request._id}
                                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            {deletingId === request._id ? (
                                                                <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Helpers Section */}
                                {expandedRequest === request._id && request.helpers?.length > 0 && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            People Helping ({request.helpers.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {request.helpers.map((helper: any, idx: number) => (
                                                <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                                                            {helper.name?.charAt(0) || "?"}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{helper.name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="flex items-center gap-0.5">
                                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                    {helper.trustScore || 70}
                                                                </span>
                                                                {helper.rating && (
                                                                    <span className="flex items-center gap-0.5">
                                                                        <ThumbsUp className="w-3 h-3 text-green-500" />
                                                                        Rated {helper.rating}/5
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleMessageHelper(helper._id, request._id)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                            title="Message"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </button>
                                                        {request.status === "resolved" && !helper.rating && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedHelper(helper);
                                                                    setRatingId(request._id);
                                                                    setShowHelperModal(true);
                                                                }}
                                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                                title="Rate helper"
                                                            >
                                                                <Star className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Edit Request</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editingRequest.title}
                                    onChange={(e) => setEditingRequest({ ...editingRequest, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editingRequest.description}
                                    onChange={(e) => setEditingRequest({ ...editingRequest, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={editingRequest.category}
                                        onChange={(e) => setEditingRequest({ ...editingRequest, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="Programming">Programming</option>
                                        <option value="Design">Design</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Science">Science</option>
                                        <option value="Language">Language</option>
                                        <option value="Career">Career</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                                    <select
                                        value={editingRequest.urgency}
                                        onChange={(e) => setEditingRequest({ ...editingRequest, urgency: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rate Helper Modal */}
            {showHelperModal && selectedHelper && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
                                    <Star className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Rate Your Helper</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    How was your experience with {selectedHelper.name}?
                                </p>
                            </div>

                            {/* Star Rating */}
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRatingValue(star)}
                                        onMouseEnter={() => setRatingHover(star)}
                                        onMouseLeave={() => setRatingHover(0)}
                                        className="text-3xl transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${(ratingHover || ratingValue) >= star
                                                    ? "fill-yellow-500 text-yellow-500"
                                                    : "text-gray-300"
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Feedback Text */}
                            <textarea
                                value={ratingFeedback}
                                onChange={(e) => setRatingFeedback(e.target.value)}
                                placeholder="Share your experience (optional)..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none mb-4"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowHelperModal(false);
                                        setRatingValue(0);
                                        setRatingFeedback("");
                                    }}
                                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRateHelper(selectedHelper._id, ratingId!)}
                                    className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition"
                                >
                                    Submit Rating
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}