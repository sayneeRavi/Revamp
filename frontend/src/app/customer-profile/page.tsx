"use client";
import SidebarLayout from "@/components/SidebarLayout";
import { useEffect, useState } from "react";
import { customerApi, authApi } from "@/lib/api";
import { decodeToken } from "@/utils/jwt";

type Customer = {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch profile details
  async function fetchProfile() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const decoded: any = decodeToken(token);
      // Call the customer service (or gateway proxy) at the expected plural path
      const data = await customerApi("/api/customers/me");

      // Merge decoded token (username, email) with DB data
      const mergedProfile: Customer = {
        userId: data?.userId ?? decoded?.userId,
        name: data?.name ?? decoded?.username,
        email: data?.email ?? decoded?.email,
        phone: data?.phone ?? "",
        address: data?.address ?? "",
      };

      setProfile(mergedProfile);
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err?.message ?? "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  }

  // Save profile changes
  async function saveProfile() {
    try {
      if (!profile) return;
      setSaving(true);
      setMessage(null);

      await customerApi("/api/customers/me", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      // Also update username in auth service so the account record stays in sync
      try {
        await authApi("/api/auth/me", {
          method: "PUT",
          body: JSON.stringify({
            email: profile.email,
            username: profile.name,
          }),
        });
      } catch (e) {
        // Non-fatal: if auth update fails, show a warning but keep profile saved in customer DB
        console.warn("Failed to update auth username:", e);
        setMessage({
          type: "error",
          text: "Saved profile, but failed to update account name",
        });
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      await fetchProfile();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message ?? "Failed to save profile",
      });
    } finally {
      setSaving(false);
    }
  }

  // Change password handler
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }
    setPasswordLoading(true);
    try {
      // Get email from token
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
      const decoded: any = decodeToken(token);
      const email = decoded?.email;
      if (!email) throw new Error("Email not found in token");
      // Call password change API
      await authApi("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          currentPassword,
          newPassword,
        }),
      });
      setPasswordMessage({
        type: "success",
        text: "Password changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err?.message ?? "Failed to change password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  useEffect(() => {
    void fetchProfile();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
          Loading your profile...
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-9xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md ring-1 ring-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          My Profile
        </h2>

        {/* ✅ Feedback message popup */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-red-50 text-red-700 ring-1 ring-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile();
          }}
          className="space-y-5"
        >
          {/* Username */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={profile?.name ?? ""}
              onChange={(e) =>
                setProfile({ ...profile!, name: e.target.value })
              }
              placeholder={
                profile?.name
                  ? `Current: ${profile.name}`
                  : "Enter your username"
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={profile?.phone ?? ""}
              onChange={(e) =>
                setProfile({ ...profile!, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Address
            </label>
            <textarea
              value={profile?.address ?? ""}
              onChange={(e) =>
                setProfile({ ...profile!, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your address"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="mt-10 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Change Password
          </h3>
          {passwordMessage && (
            <div
              className={`mb-4 p-4 rounded-lg text-sm font-medium ${
                passwordMessage.type === "success"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Confirm new password"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
                  passwordLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
