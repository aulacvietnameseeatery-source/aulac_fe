"use client";

import { useState, useEffect } from "react";
import { tokenStorage } from "@/lib/auth-storage";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    userId: number;
    username: string;
    roles: string[];
  } | null>(null);

  useEffect(() => {
    const userData = tokenStorage.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  if (!user) {
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
        <p className="mt-2 text-gray-600">Welcome back, {user.username}!</p>
      </div>
    </div>
  );
}
