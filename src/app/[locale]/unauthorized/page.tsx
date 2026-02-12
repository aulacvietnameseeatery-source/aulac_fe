'use client';

import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';

/**
 * Unauthorized Access Page
 * Displayed when user attempts to access a route/feature without required permissions
 */
export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated, userInfo } = useAuth();
  const { permissions, roles } = usePermissions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="max-w-2xl w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-white rounded-full p-6 shadow-xl border-4 border-red-100">
              <ShieldX className="w-20 h-20 text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            You don&apos;t have permission to access this resource.
          </p>

          {/* User Info */}
          {isAuthenticated && userInfo && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Current User
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Username:</span>
                  <span className="font-medium text-gray-900">{userInfo.username}</span>
                </div>
                
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Roles:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No roles</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Permissions:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                    {permissions.length > 0 ? (
                      permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                        >
                          {perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No permissions</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            
            <Button
              size="lg"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-8">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>

        {/* Debug Info (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-900 text-white rounded-lg p-4 text-xs font-mono">
            <div className="text-yellow-400 mb-2">🔧 Development Info:</div>
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>User ID: {userInfo?.userId || 'N/A'}</div>
            <div>Permissions Count: {permissions.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}
