"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeOnboarding, getAISuggestions } from "@/config/dbFunctions";
import { Sparkles, Plus, X, MapPin, Brain, Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [location, setLocation] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const [aiSuggestions, setAiSuggestions] = useState<{ skillsToLearn: string[], insights: string[] }>({
        skillsToLearn: [],
        insights: []
    });

    useEffect(() => {
        const fetchAISuggestions = async () => {
            try {
                const res = await getAISuggestions();
                if (res.success && res.data) {
                    setAiSuggestions(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch AI suggestions:", error);
            }
        };
        fetchAISuggestions();
    }, []);

    const addSkill = () => {
        if (skillInput && !skills.includes(skillInput)) {
            setSkills([...skills, skillInput]);
            setSkillInput("");
            toast.success("Skill added");
        }
    };

    const addInterest = () => {
        if (interestInput && !interests.includes(interestInput)) {
            setInterests([...interests, interestInput]);
            setInterestInput("");
            toast.success("Interest added");
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
        toast.success("Skill removed");
    };

    const removeInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest));
        toast.success("Interest removed");
    };

    const handleSubmit = async () => {
        if (skills.length === 0) {
            toast.warning("Please add at least one skill");
            return;
        }

        setLoading(true);
        try {
            const res = await completeOnboarding({ skills, interests, location });
            if (res.success) {
                toast.success("Onboarding completed! Welcome to Helplytics AI!");
                router.push("/dashboard");
            } else {
                toast.error(res.message || "Onboarding failed");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent, type: 'skill' | 'interest') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (type === 'skill') addSkill();
            else addInterest();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <Brain className="w-8 h-8 text-white" />
                            <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
                        </div>
                        <p className="text-white/80 mt-2">Help us personalize your experience with AI</p>
                    </div>

                    <div className="p-8">
                        {/* AI Suggestions Banner */}
                        {aiSuggestions.skillsToLearn.length > 0 && (
                            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">AI Suggestions</h3>
                                        <p className="text-sm text-gray-600 mb-3">Based on your profile, consider adding these skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {aiSuggestions.skillsToLearn.map((skill, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => !skills.includes(skill) && setSkills([...skills, skill])}
                                                    className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skills Section */}
                        <div className="mb-8">
                            <label className="block font-semibold text-gray-700 mb-2">
                                Skills <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, 'skill')}
                                    placeholder="e.g., JavaScript, React, Python"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    onClick={addSkill}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {skills.length === 0 && (
                                    <p className="text-sm text-gray-400">No skills added yet. Add your first skill above.</p>
                                )}
                            </div>
                        </div>

                        {/* Interests Section */}
                        <div className="mb-8">
                            <label className="block font-semibold text-gray-700 mb-2">Interests</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={interestInput}
                                    onChange={(e) => setInterestInput(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, 'interest')}
                                    placeholder="e.g., Web Development, AI, Design"
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    onClick={addInterest}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {interests.map(interest => (
                                    <span key={interest} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm flex items-center gap-2">
                                        {interest}
                                        <button onClick={() => removeInterest(interest)} className="hover:text-red-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {interests.length === 0 && (
                                    <p className="text-sm text-gray-400">No interests added yet. Add your first interest above.</p>
                                )}
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="mb-8">
                            <label className="block font-semibold text-gray-700 mb-2">Location (Optional)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Karachi, Lahore, Remote"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Setting up your profile...
                                </>
                            ) : (
                                "Complete Setup"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}