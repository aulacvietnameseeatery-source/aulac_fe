"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    userId: number;
    username: string;
    roles: string[];
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!tokenStorage.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get user data
    const userData = tokenStorage.getUser();
    if (userData) {
      setUser(userData);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user.username}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Info Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            User Information
          </h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">User ID:</span>
              <span className="ml-2 text-gray-600">{user.userId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Username:</span>
              <span className="ml-2 text-gray-600">{user.username}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Roles:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700">
              View Profile
            </button>
            <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
              Settings
            </button>
            <button
              onClick={() => {
                tokenStorage.clearAuth();
                router.push("/login");
              }}
              className="w-full rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Statistics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Active Reservations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
