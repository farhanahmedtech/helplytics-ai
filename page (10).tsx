"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRequest } from "@/config/dbFunctions";
import {
    Sparkles,
    Wand2,
    Tag,
    X,
    Plus,
    Send,
    ArrowLeft,
    Zap,
    Layers,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Clock,
    Shield,
    Users,
    Gift,
    Target,
    Lightbulb
} from "lucide-react";

const categories = [
    { value: "Programming", label: "💻 Programming", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50", text: "text-blue-700", description: "Code, debugging, software help" },
    { value: "Design", label: "🎨 Design", color: "from-purple-500 to-pink-500", bg: "bg-purple-50", text: "text-purple-700", description: "UI/UX, graphics, branding" },
    { value: "Mathematics", label: "📐 Mathematics", color: "from-green-500 to-emerald-500", bg: "bg-green-50", text: "text-green-700", description: "Algebra, calculus, statistics" },
    { value: "Science", label: "🔬 Science", color: "from-teal-500 to-cyan-500", bg: "bg-teal-50", text: "text-teal-700", description: "Physics, chemistry, biology" },
    { value: "Language", label: "📖 Language", color: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-700", description: "English, writing, translation" },
    { value: "Career", label: "💼 Career", color: "from-indigo-500 to-purple-500", bg: "bg-indigo-50", text: "text-indigo-700", description: "Jobs, resume, interviews" },
    { value: "Other", label: "✨ Other", color: "from-gray-500 to-slate-500", bg: "bg-gray-50", text: "text-gray-700", description: "General help requests" },
];

const urgencies = [
    { value: "Low", label: "Low Priority", icon: "🟢", description: "No rush, whenever possible", color: "bg-green-100 text-green-700 border-green-200", timeEstimate: "2-3 days" },
    { value: "Medium", label: "Medium Priority", icon: "🟡", description: "Need within a few days", color: "bg-yellow-100 text-yellow-700 border-yellow-200", timeEstimate: "1-2 days" },
    { value: "High", label: "High Priority", icon: "🟠", description: "Important, need soon", color: "bg-orange-100 text-orange-700 border-orange-200", timeEstimate: "Within 24 hours" },
    { value: "Urgent", label: "Urgent", icon: "🔴", description: "Immediate help needed", color: "bg-red-100 text-red-700 border-red-200", timeEstimate: "ASAP" },
];

export default function CreateRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        urgency: "",
        tags: [] as string[]
    });
    const [tagInput, setTagInput] = useState("");
    const [aiSuggestions, setAiSuggestions] = useState<{
        category?: string;
        tags?: string[];
        urgency?: string;
    }>({});
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showTips, setShowTips] = useState(true);

    const handleAISuggest = async () => {
        if (!formData.title || !formData.description) {
            toast.warning("Please enter title and description first");
            return;
        }

        setIsGeneratingAI(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        const text = (formData.title + " " + formData.description).toLowerCase();

        let suggestedCategory = "Other";
        if (text.includes("code") || text.includes("javascript") || text.includes("python") || text.includes("react") || text.includes("node")) {
            suggestedCategory = "Programming";
        } else if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("figma") || text.includes("photoshop")) {
            suggestedCategory = "Design";
        } else if (text.includes("math") || text.includes("calculus") || text.includes("algebra") || text.includes("geometry")) {
            suggestedCategory = "Mathematics";
        } else if (text.includes("science") || text.includes("physics") || text.includes("chemistry") || text.includes("biology")) {
            suggestedCategory = "Science";
        } else if (text.includes("language") || text.includes("english") || text.includes("writing") || text.includes("essay")) {
            suggestedCategory = "Language";
        } else if (text.includes("career") || text.includes("job") || text.includes("resume") || text.includes("interview")) {
            suggestedCategory = "Career";
        }

        let suggestedUrgency = "Medium";
        if (text.includes("urgent") || text.includes("asap") || text.includes("immediately") || text.includes("emergency")) {
            suggestedUrgency = "Urgent";
        } else if (text.includes("important") || text.includes("critical") || text.includes("soon") || text.includes("today")) {
            suggestedUrgency = "High";
        } else if (text.includes("curious") || text.includes("wondering") || text.includes("future")) {
            suggestedUrgency = "Low";
        }

        const words = text.split(/\s+/);
        const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "help", "need", "please", "thanks"];
        const suggestedTags = [...new Set(words.filter(word =>
            word.length > 3 && !commonWords.includes(word) && !word.includes("@") && !word.includes("http")
        ))].slice(0, 4);

        setAiSuggestions({
            category: suggestedCategory,
            urgency: suggestedUrgency,
            tags: suggestedTags
        });

        setIsGeneratingAI(false);
        toast.success("✨ AI suggestions generated!", { icon: "🤖" });
    };

    const applyAISuggestion = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
        toast.success(`✓ ${field} updated with AI suggestion`);
    };

    const addTag = () => {
        if (tagInput && !formData.tags.includes(tagInput)) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput] });
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            toast.error("Please fill in title and description");
            return;
        }

        setLoading(true);
        try {
            const res = await createRequest(formData);
            if (res.success) {
                toast.success("🎉 Request created successfully!", { icon: "🚀" });
                router.push(`/request/${res.data._id}`);
            } else {
                toast.error(res.message || "Failed to create request");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Helper tips for better requests
    const tips = [
        { icon: <Target className="w-3 h-3" />, text: "Be specific about what you need" },
        { icon: <Clock className="w-3 h-3" />, text: "Set realistic urgency levels" },
        { icon: <Tag className="w-3 h-3" />, text: "Add relevant tags for visibility" },
        { icon: <Lightbulb className="w-3 h-3" />, text: "Mention what you've tried already" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1 -ml-1">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Create Request</h1>
                        <p className="text-xs text-gray-500">Get help from the community</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                {/* Tips Banner */}
                {showTips && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-800">Tips for better help</p>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {tips.map((tip, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-[10px] text-gray-600 bg-white/50 px-2 py-0.5 rounded-full">
                                                {tip.icon}
                                                <span>{tip.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowTips(false)} className="text-gray-400">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Assistant - Compact */}
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                                <Wand2 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">AI Assistant</h3>
                                <p className="text-xs text-gray-500">Get smart suggestions</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAISuggest}
                            disabled={isGeneratingAI}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                        >
                            {isGeneratingAI ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Suggest
                                </div>
                            )}
                        </button>
                    </div>

                    {/* AI Suggestions */}
                    {Object.keys(aiSuggestions).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {aiSuggestions.category && (
                                    <button
                                        onClick={() => applyAISuggestion("category", aiSuggestions.category)}
                                        className="px-2 py-1 bg-gray-100 rounded-lg text-xs flex items-center gap-1"
                                    >
                                        📂 {aiSuggestions.category}
                                    </button>
                                )}
                                {aiSuggestions.urgency && (
                                    <button
                                        onClick={() => applyAISuggestion("urgency", aiSuggestions.urgency)}
                                        className="px-2 py-1 bg-gray-100 rounded-lg text-xs flex items-center gap-1"
                                    >
                                        ⚡ {aiSuggestions.urgency}
                                    </button>
                                )}
                                {aiSuggestions.tags?.slice(0, 2).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => !formData.tags.includes(tag) && setFormData({ ...formData, tags: [...formData.tags, tag] })}
                                        className="px-2 py-1 bg-gray-100 rounded-lg text-xs"
                                    >
                                        +{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Title Field */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="block font-medium text-gray-800 text-sm mb-1.5">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="What do you need help with?"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                {/* Description Field */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="block font-medium text-gray-800 text-sm mb-1.5">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your problem in detail..."
                        rows={5}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                </div>

                {/* Category Selection */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="block font-medium text-gray-800 text-sm mb-2">
                        <Layers className="w-3 h-3 inline mr-1" />
                        Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left
                                    ${formData.category === cat.value
                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-sm`
                                        : `bg-gray-50 text-gray-700 border border-gray-100`
                                    }`}
                            >
                                <div>{cat.label}</div>
                                <div className="text-[10px] opacity-80 mt-0.5">{cat.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Urgency Selection */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="block font-medium text-gray-800 text-sm mb-2">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Urgency
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {urgencies.map((urg) => (
                            <button
                                key={urg.value}
                                onClick={() => setFormData({ ...formData, urgency: urg.value })}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left
                                    ${formData.urgency === urg.value
                                        ? urg.color + " border shadow-sm"
                                        : "bg-gray-50 text-gray-700 border border-gray-100"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{urg.icon} {urg.label}</span>
                                    {formData.urgency === urg.value && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-0.5">{urg.description}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">⏱ {urg.timeEstimate}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tags Field */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <label className="block font-medium text-gray-800 text-sm mb-2">
                        <Tag className="w-3 h-3 inline mr-1" />
                        Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            placeholder="Add tags..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            onClick={addTag}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {formData.tags.length === 0 ? (
                            <p className="text-xs text-gray-400">No tags yet. Add tags to help others find your request.</p>
                        ) : (
                            formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Post Request
                        </>
                    )}
                </button>

                {/* Trust Badge */}
                <div className="text-center py-2">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <Shield className="w-3 h-3" />
                        <span>Your request will be reviewed by our community helpers</span>
                    </div>
                </div>
            </div>
        </div>
    );
}