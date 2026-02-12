"use client";

import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { userInfo, isAuthenticated } = useAuth();

  if (!isAuthenticated || !userInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {userInfo.username}!</p>
      </div>

      {/* User Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">User ID</h3>
          <p className="text-2xl font-bold text-gray-900">{userInfo.userId}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Username</h3>
          <p className="text-2xl font-bold text-gray-900">{userInfo.username}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Roles</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {userInfo.roles.map((role) => (
              <span
                key={role}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Permissions</h3>
        <div className="flex flex-wrap gap-2">
          {userInfo.permissions.length > 0 ? (
            userInfo.permissions.map((permission) => (
              <span
                key={permission}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
              >
                {permission}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No permissions assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
