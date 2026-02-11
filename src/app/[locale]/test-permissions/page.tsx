'use client';

import { useState, useEffect } from 'react';
import { Check, X, Shield, LogOut, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { getTokenExpirationTime, decodeToken } from '@/lib/jwt-utils';

// Test JWT tokens with different permission sets
const TEST_TOKENS = {
  admin: createTestToken({
    sub: '1',
    unique_name: 'admin_user',
    role: ['Admin'],
    permission: [
      'ACCOUNT:READ', 'ACCOUNT:CREATE', 'ACCOUNT:EDIT', 'ACCOUNT:UPDATE', 'ACCOUNT:DELETE', 'ACCOUNT:RESET_PASSWORD',
      'SYSTEM_SETTING:READ', 'SYSTEM_SETTING:EDIT',
      'DISH:READ', 'DISH:CREATE', 'DISH:EDIT', 'DISH:DELETE',
      'ROLE:READ', 'ROLE:CREATE', 'ROLE:UPDATE', 'ROLE:DELETE',
    ],
  }),
  manager: createTestToken({
    sub: '2',
    unique_name: 'manager_user',
    role: ['Manager'],
    permission: [
      'ACCOUNT:READ', 'ACCOUNT:EDIT',
      'DISH:READ', 'DISH:EDIT',
      'SYSTEM_SETTING:READ',
    ],
  }),
  staff: createTestToken({
    sub: '3',
    unique_name: 'staff_user',
    role: ['Staff'],
    permission: [
      'ACCOUNT:READ',
      'DISH:READ',
    ],
  }),
  noPermissions: createTestToken({
    sub: '4',
    unique_name: 'guest_user',
    role: ['Guest'],
    permission: [],
  }),
};

/**
 * Creates a test JWT token (NOT for production)
 * This is a mock token for testing purposes only
 */
function createTestToken(payload: {
  sub: string;
  unique_name: string;
  role: string[];
  permission: string[];
}): string {
  // Create expiration 1 hour from now
  const exp = Math.floor(Date.now() / 1000) + 3600;
  
  const tokenPayload = {
    ...payload,
    exp,
    iat: Math.floor(Date.now() / 1000),
  };

  // Base64 encode the payload (this is NOT secure, only for testing)
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(tokenPayload));
  
  return `${header}.${body}.test-signature`;
}

/**
 * Permission Test Dashboard
 * Comprehensive testing interface for the permission system
 */
export default function TestPermissionsPage() {
  const { login, logout, userInfo, isAuthenticated, token } = useAuth();
  const { can, canAny, canAll, permissions, roles } = usePermissions();
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedSinglePerm, setSelectedSinglePerm] = useState('');
  const [selectedAnyPerms, setSelectedAnyPerms] = useState<string[]>([]);
  const [selectedAllPerms, setSelectedAllPerms] = useState<string[]>([]);

  // Update token expiration countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTokenExpirationTime(token));
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get all permission values
  const allPermissions = Object.values(Permissions);

  // Get all permission entries
  const permissionEntries = Object.entries(Permissions) as [string, string][];

  return (
    <div className="min-h-screen bg-linear-to-br overflow-scroll from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Permission System Test Dashboard
              </h1>
            </div>
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            ⚠️ Frontend permissions are UX only - always validate on backend
          </p>
        </div>

        {/* A. Token Info Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Token Information
          </h2>

          {isAuthenticated && userInfo ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{userInfo.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{userInfo.username}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant="secondary" className="bg-blue-100 text-blue-700">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Permissions ({permissions.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {permissions.length > 0 ? (
                    permissions.map((perm) => (
                      <Badge key={perm} className="bg-green-100 text-green-700 border-green-200">
                        {perm}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No permissions</span>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Token Expires In:</span>
                  <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No active token. Select a test scenario below.
            </p>
          )}
        </Card>

        {/* B. Test Scenario Buttons */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Button
              onClick={() => login(TEST_TOKENS.admin)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Admin User
            </Button>
            <Button
              onClick={() => login(TEST_TOKENS.manager)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Manager User
            </Button>
            <Button
              onClick={() => login(TEST_TOKENS.staff)}
              className="bg-green-600 hover:bg-green-700"
            >
              Staff User
            </Button>
            <Button
              onClick={() => login(TEST_TOKENS.noPermissions)}
              variant="outline"
            >
              No Permissions
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* C. Permission Demo Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Permissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Permission Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Permission Value</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Has Access?</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Demo Button</th>
                </tr>
              </thead>
              <tbody>
                {permissionEntries.map(([name, value]) => {
                  const hasAccess = can(value);
                  
                  return (
                    <tr key={value} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{name}</td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{value}</code>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasAccess ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <PermissionGuard permission={value}>
                          <Button size="sm" variant="outline">
                            Use {name}
                          </Button>
                        </PermissionGuard>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* D. Live Testing */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Live Permission Testing</h2>
          
          <div className="space-y-6">
            {/* Single Permission Test */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Single Permission
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedSinglePerm}
                  onChange={(e) => setSelectedSinglePerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a permission...</option>
                  {allPermissions.map((perm) => (
                    <option key={perm} value={perm}>{perm}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 min-w-[120px]">
                  {selectedSinglePerm && (
                    <>
                      {can(selectedSinglePerm) ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-medium">Has Access</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-600" />
                          <span className="text-red-700 font-medium">No Access</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ANY Permission Test */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test ANY Permission (OR Logic)
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[60px]">
                  {selectedAnyPerms.map((perm) => (
                    <Badge
                      key={perm}
                      className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                      onClick={() => setSelectedAnyPerms(selectedAnyPerms.filter(p => p !== perm))}
                    >
                      {perm} ×
                    </Badge>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value && !selectedAnyPerms.includes(e.target.value)) {
                      setSelectedAnyPerms([...selectedAnyPerms, e.target.value]);
                    }
                    e.target.value = '';
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Add permission...</option>
                  {allPermissions.map((perm) => (
                    <option key={perm} value={perm}>{perm}</option>
                  ))}
                </select>
                {selectedAnyPerms.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {canAny(selectedAnyPerms) ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Has at least one permission
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-medium">
                          Missing all permissions
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ALL Permission Test */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test ALL Permissions (AND Logic)
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[60px]">
                  {selectedAllPerms.map((perm) => (
                    <Badge
                      key={perm}
                      className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
                      onClick={() => setSelectedAllPerms(selectedAllPerms.filter(p => p !== perm))}
                    >
                      {perm} ×
                    </Badge>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value && !selectedAllPerms.includes(e.target.value)) {
                      setSelectedAllPerms([...selectedAllPerms, e.target.value]);
                    }
                    e.target.value = '';
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Add permission...</option>
                  {allPermissions.map((perm) => (
                    <option key={perm} value={perm}>{perm}</option>
                  ))}
                </select>
                {selectedAllPerms.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {canAll(selectedAllPerms) ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Has all {selectedAllPerms.length} permissions
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-medium">
                          Missing some permissions
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* E. Multi-Permission Examples */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Multi-Permission Examples</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Manage Accounts</h3>
                <p className="text-sm text-gray-600">
                  Requires ANY: ACCOUNT:EDIT, ACCOUNT:UPDATE, or ACCOUNT:DELETE
                </p>
              </div>
              <Button
                disabled={!canAny(['ACCOUNT:EDIT', 'ACCOUNT:UPDATE', 'ACCOUNT:DELETE'])}
              >
                {canAny(['ACCOUNT:EDIT', 'ACCOUNT:UPDATE', 'ACCOUNT:DELETE']) ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Full Account Control</h3>
                <p className="text-sm text-gray-600">
                  Requires ALL: ACCOUNT:READ, ACCOUNT:CREATE, ACCOUNT:EDIT, and ACCOUNT:DELETE
                </p>
              </div>
              <Button
                disabled={!canAll(['ACCOUNT:READ', 'ACCOUNT:CREATE', 'ACCOUNT:EDIT', 'ACCOUNT:DELETE'])}
              >
                {canAll(['ACCOUNT:READ', 'ACCOUNT:CREATE', 'ACCOUNT:EDIT', 'ACCOUNT:DELETE']) ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </Card>

        {/* F. Protected Routes List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Protected Routes Status</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { path: '/accounts', perm: 'ACCOUNT:READ', desc: 'View accounts list' },
              { path: '/dishes/create', perm: 'DISH:CREATE', desc: 'Create new dishes' },
              { path: '/settings', perm: 'SYSTEM_SETTING:READ', desc: 'View system settings' },
              { path: '/roles', perm: 'ROLE:READ', desc: 'View roles and permissions' },
              { path: '/accounts/create', perm: 'ACCOUNT:CREATE', desc: 'Create new accounts' },
              { path: '/dishes/edit', perm: 'DISH:EDIT', desc: 'Edit existing dishes' },
            ].map(({ path, perm, desc }) => {
              const hasAccess = can(perm);
              
              return (
                <div
                  key={path}
                  className={`p-4 rounded-lg border-2 ${
                    hasAccess
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm font-mono font-semibold">{path}</code>
                    {hasAccess ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Requires:</span>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {perm}
                    </code>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={hasAccess ? 'default' : 'outline'}
                      className={hasAccess ? 'bg-green-600' : 'text-red-600 border-red-300'}
                    >
                      {hasAccess ? 'Accessible' : 'Blocked'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* TanStack Query Example */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-3">TanStack Query Integration Example</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useQuery } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/use-permissions';

function AccountsList() {
  const { can } = usePermissions();
  
  // Only fetch if user has permission
  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    enabled: can('ACCOUNT:READ'),
  });
  
  if (!can('ACCOUNT:READ')) {
    return <div>Access Denied</div>;
  }
  
  return <div>{/* Render data */}</div>;
}`}
          </pre>
        </Card>
      </div>
    </div>
  );
}
