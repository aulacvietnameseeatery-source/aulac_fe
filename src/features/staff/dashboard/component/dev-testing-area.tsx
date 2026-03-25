"use client";
import React from "react";

export function DevTestingArea({ userInfo }: { userInfo: any }) {
    return (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Developer Testing Area</h2>
            <p className="text-sm text-gray-500 mb-6">Logged in as: <span className="font-semibold text-indigo-600">{userInfo.username}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</h3>
                    <p className="text-lg font-bold text-gray-900">{userInfo.userId}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Username</h3>
                    <p className="text-lg font-bold text-gray-900">{userInfo.username}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Roles</h3>
                    <div className="flex flex-wrap gap-1">
                        {userInfo.roles.map((r: string) => <span key={r} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">{r}</span>)}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Your Permissions</h3>
                <div className="flex flex-wrap gap-2">
                    {userInfo.permissions.length > 0 ? (
                        userInfo.permissions.map((p: string) => <span key={p} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium rounded">{p}</span>)
                    ) : <p className="text-gray-400 text-sm">No permissions</p>}
                </div>
            </div>
        </div>
    );
}