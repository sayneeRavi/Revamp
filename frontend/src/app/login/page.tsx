"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

interface LoginForm {
  email: string;
  password: string;
}

interface ApiResponse {
  token?: string;
  user?: { role: string };
  message?: string;
}

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleAuthEnabled = !!GOOGLE_CLIENT_ID;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const body: ApiResponse = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Login failed");
      }

      if (body.token) {
        localStorage.setItem("token", body.token);
      }
      if (body.user) {
        localStorage.setItem("user", JSON.stringify(body.user));
      }

      const role = body.user?.role;
      if (role === "ADMIN") {
        router.push("/admin-dashboard");
      } else if (role === "EMPLOYEE") {
        router.push("/employee-dashboard");
      } else {
        router.push("/consumer-dashboard");
      }

    } catch (err: any) {
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) return;

      const res = await fetch(`${GATEWAY_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data: ApiResponse = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      localStorage.setItem("token", data.token!);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.role || "CONSUMER";
      router.push(`/${role.toLowerCase()}-dashboard`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gray-100 px-4">
{/* Vertical Yellow Divider (aligned with left panel) */}



  {/* Main Card */}
  <div className="relative z-10 flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">

        
        {/* Left Panel - Welcome Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 to-orange-400 p-12 flex-col justify-between relative">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-xl">Revamp</span>
          </div>

          {/* Welcome Message */}
          <div className="text-white space-y-4">
            <h1 className="text-4xl font-bold leading-tight">Welcome back</h1>
            <p className="text-white/90 text-lg">
              Login to access your personalized dashboard and manage your account
            </p>
          </div>

          {/* Illustration */}
          <div className="flex justify-center items-center">
            <svg className="w-80 h-80" viewBox="0 0 400 400" fill="none">
              {/* Shopping bag */}
              <rect x="120" y="180" width="160" height="140" rx="8" fill="#fff" opacity="0.9"/>
              <path d="M140 180 C140 160, 160 150, 200 150 C240 150, 260 160, 260 180" stroke="#fff" strokeWidth="4" fill="none" opacity="0.9"/>
              
              {/* Gift boxes */}
              <rect x="80" y="240" width="60" height="60" rx="4" fill="#FF6B6B" opacity="0.8"/>
              <rect x="94" y="240" width="4" height="60" fill="#fff"/>
              <rect x="80" y="268" width="60" height="4" fill="#fff"/>
              
              <rect x="260" y="260" width="50" height="50" rx="4" fill="#4ECDC4" opacity="0.8"/>
              <rect x="271" y="260" width="3" height="50" fill="#fff"/>
              <rect x="260" y="283" width="50" height="3" fill="#fff"/>
              
              {/* Person figure */}
              <circle cx="200" cy="100" r="20" fill="#fff" opacity="0.9"/>
              <path d="M200 120 L200 180 M200 140 L180 160 M200 140 L220 160 M200 180 L180 210 M200 180 L220 210" 
                    stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
              
              {/* Floating elements */}
              <circle cx="340" cy="100" r="30" fill="#fff" opacity="0.2"/>
              <circle cx="60" cy="120" r="20" fill="#fff" opacity="0.2"/>
              <circle cx="320" cy="280" r="25" fill="#fff" opacity="0.15"/>
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Revamp</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Log in</h2>
              <p className="text-gray-500">Sign in to continue to your account</p>
            </div>

            {/* Google Sign In Button - Priority */}
            {isGoogleAuthEnabled && (
              <>
                <div className="mb-6">
                  <div className="flex justify-center p-1 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:shadow-lg transition-all duration-300">
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => setError("Google login failed")}
                      size="large"
                      text="continue_with"
                      width="100%"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </>
            )}

           {/* Email/Password Form */}
<form onSubmit={handleSubmit} noValidate>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email
      </label>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
        autoComplete="email"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
        placeholder="Enter your email"
      />
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <a href="/forgot-password" className="text-sm text-yellow-600 hover:text-yellow-700">
          Forgot?
        </a>
      </div>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
        autoComplete="current-password"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
        placeholder="Enter your password"
      />
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Logging in..." : "Log in"}
    </button>
  </div>
</form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/register" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}