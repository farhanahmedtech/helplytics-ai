// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { message } from "antd";
// import { loginUser } from "@/config/dbFunctions";
// import Button from "@/components/Button";

// export default function Login() {
//     const router = useRouter();
//     const [loading, setLoading] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleLogin = async () => {
//         if (!email || !password) {
//             message.error("Email and password are required");
//             return;
//         }

//         setLoading(true);
//         try {
//             const res = await loginUser(email, password);

//             if (res.success && res.data) {
//                 const { user, token } = res.data;

//                 // Save user info
//                 localStorage.setItem(
//                     "userInfo",
//                     JSON.stringify({
//                         id: user._id,
//                         name: user.name,
//                         email: user.email,
//                         token: token
//                     })
//                 );

//                 message.success(res.message || "Login successful!");
//                 router.replace("/dashboard")
//             } else {
//                 message.error(res.message || "Login failed");
//             }
//         } catch (err: any) {
//             console.error("Login error:", err);
//             message.error(err?.message || "Invalid credentials");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
//             <div className="relative w-full max-w-3xl">
//                 <div className="flex flex-col lg:flex-row bg-white/95 backdrop-blur-sm rounded-xl sm:border border-gray-200 sm:shadow-lg overflow-hidden">
//                     {/* Left branding */}
//                     <div className="lg:w-1/2 p-8 sm:bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col justify-center">
//                         <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-4">
//                             Welcome Back
//                         </h1>
//                         <p className="text-gray-700 font-medium text-sm">Sign in to continue</p>
//                     </div>

//                     {/* Login Form */}
//                     <div className="lg:w-1/2 p-8 flex flex-col justify-center">
//                         <div className="text-center mb-6">
//                             <h2 className="text-2xl font-bold text-gray-800 mb-1">Login</h2>
//                             <p className="text-gray-500 text-sm">Enter your credentials to sign in</p>
//                         </div>

//                         <div className="mb-4 flex flex-col gap-4">
//                             <input
//                                 type="email"
//                                 placeholder="Email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 disabled={loading}
//                                 className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
//                             />
//                             <input
//                                 type="password"
//                                 placeholder="Password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 disabled={loading}
//                                 className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
//                             />
//                             <Button
//                                 label={loading ? "Logging in..." : "Login"}
//                                 variant="theme2"
//                                 onClick={handleLogin}
//                                 disabled={loading}
//                             />
//                         </div>

//                         <div className="flex justify-between text-sm">
//                             <Link href="#" className="text-gray-500 hover:text-blue-600 hover:underline transition-colors">
//                                 Forgot password?
//                             </Link>
//                             <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
//                                 Create an account →
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginUser } from "@/config/dbFunctions";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await loginUser(formData.email, formData.password);

            if (res.success) {
                toast.success("Login successful!");
                localStorage.setItem("userInfo", JSON.stringify({
                    id: res.data.user.id,
                    name: res.data.user.name,
                    email: res.data.user.email,
                    token: res.data.token,
                }));

                if (!res.data.user.isOnboarded) {
                    router.push("/onboarding");
                } else {
                    router.push("/dashboard");
                }
            } else {
                toast.error(res.message || "Login failed");
            }
        } catch (error: any) {
            toast.error(error?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-gray-500 mt-2">Sign in to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}