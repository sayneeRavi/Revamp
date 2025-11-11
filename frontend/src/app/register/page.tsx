"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  token?: string;
  user?: { role: string };
  message?: string;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";

  // Password strength logic
  const evaluateStrength = (password: string) => {
    if (password.length < 6) return "weak";
    const hasLetters = /[A-Za-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) return "strong";
    if (password.length >= 6 && (hasLetters || hasNumbers)) return "medium";
    return "weak";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (name === "password") {
      setPasswordStrength(evaluateStrength(value));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { name, email, password, confirmPassword } = form;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${GATEWAY_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const body: ApiResponse = await res.json();
      if (!res.ok) throw new Error(body.message || "Registration failed");

      if (body.token) localStorage.setItem("token", body.token);
      if (body.user) localStorage.setItem("user", JSON.stringify(body.user));

      const role = body.user?.role || "CONSUMER";
      router.push(`/${role.toLowerCase()}-dashboard`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
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
      if (!res.ok) throw new Error(data.message || "Google signup failed");

      localStorage.setItem("token", data.token!);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.role || "CONSUMER";
      router.push(`/${role.toLowerCase()}-dashboard`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const strengthColor =
    passwordStrength === "weak"
      ? "bg-red-500"
      : passwordStrength === "medium"
      ? "bg-yellow-400"
      : passwordStrength === "strong"
      ? "bg-green-500"
      : "bg-gray-200";

  const strengthLabel =
    passwordStrength === "weak"
      ? "Weak"
      : passwordStrength === "medium"
      ? "Medium"
      : passwordStrength === "strong"
      ? "Strong"
      : "";

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="relative z-10 flex w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 to-orange-400 p-12 flex-col justify-between relative">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-xl">Revamp</span>
          </div>

          <div className="text-white space-y-4">
            <h1 className="text-4xl font-bold leading-tight">Join Revamp Today</h1>
            <p className="text-white/90 text-lg">
              Create an account to unlock all features and personalized experiences
            </p>
          </div>

          <div className="flex justify-center items-center">
            <svg className="w-80 h-80" viewBox="0 0 400 400" fill="none">
              <rect x="120" y="180" width="160" height="140" rx="8" fill="#fff" opacity="0.9" />
              <path
                d="M140 180 C140 160, 160 150, 200 150 C240 150, 260 160, 260 180"
                stroke="#fff"
                strokeWidth="4"
                fill="none"
                opacity="0.9"
              />
              <circle cx="200" cy="100" r="20" fill="#fff" opacity="0.9" />
              <path
                d="M200 120 L200 180 M200 140 L180 160 M200 140 L220 160 M200 180 L180 210 M200 180 L220 210"
                stroke="#fff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create an Account</h2>
              <p className="text-gray-500">Sign up to get started with Revamp</p>
            </div>

            {/* Google Sign Up */}
            <div className="mb-6">
              <div className="flex justify-center p-1 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:shadow-lg transition-all duration-300">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google signup failed")}
                  size="large"
                  text="signup_with"
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

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Create a password"
                />

                {/* Strength Tracker */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{
                          width:
                            passwordStrength === "weak"
                              ? "33%"
                              : passwordStrength === "medium"
                              ? "66%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{`Password Strength: ${strengthLabel}`}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <p className="mt-6 text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
