"use client";

import { useState, useEffect } from "react";
import { getLeaderboard } from "@/config/dbFunctions";
import { toast } from "sonner";
import { Trophy, Medal, Star, Award, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
    const [loading, setLoading] = useState(true);
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await getLeaderboard();
            if (res.success) {
                setLeaders(res.data);
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to fetch leaderboard");
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-8 h-8 text-yellow-500" />;
            case 2:
                return <Medal className="w-8 h-8 text-gray-400" />;
            case 3:
                return <Medal className="w-8 h-8 text-amber-600" />;
            default:
                return <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
            case 2:
                return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
            case 3:
                return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
            default:
                return "bg-white border-gray-100";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
                    <p className="text-gray-500 mt-2">Top contributors in the community</p>
                </div>

                {leaders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <p className="text-gray-500">No leaders yet. Start helping others to get on the leaderboard!</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-fade-in-up">
                        {leaders.map((leader: any, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${getRankColor(leader.rank)}`}
                            >
                                <div className="w-12 flex justify-center">
                                    {getMedalIcon(leader.rank)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">{leader.name}</h3>
                                        {leader.badges && leader.badges.includes("expert") && (
                                            <Award className="w-4 h-4 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            Trust Score: {leader.trustScore}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-green-500" />
                                            Help Given: {leader.totalHelpGiven}
                                        </span>
                                    </div>
                                </div>

                                {leader.rank === 1 && (
                                    <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                        #1 Helper
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}