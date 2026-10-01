'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from '@/utils/toast';
import Pagination from '@/components/Pagination';
import Loader from '@/components/common/Loader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import UserModal from './UserModal';
import ResetPasswordDialog from './ResetPasswordDialog';
import { Badge } from '@/components/ui/badge';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  ArrowPathRoundedSquareIcon,
  BellIcon,
  KeyIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatters';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';
  emailVerified?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  receivesApprovalNotifications: boolean;
  businesses: { id: string; name: string }[];
  businessRegistrations: {
    step: number;
    isCompleted: boolean;
    updatedAt: string;
  }[];
}

const registrationStepLabels: Record<number, string> = {
  1: 'Choose Bundle',
  2: 'Payment',
  3: 'Business Information',
  4: 'Location',
};

interface PaginatedUsers {
  users: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    analytics: {
      totalUsers: number;
      usersWithBusinesses: number;
      businessOwners: number;
      registrationsInProgress: number;
    };
  }
}

export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [businessFilter, setBusinessFilter] = useState<string | null>(null);
  const [registrationFilter, setRegistrationFilter] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    usersWithBusinesses: 0,
    businessOwners: 0,
    registrationsInProgress: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [actionMenu, setActionMenu] = useState<{ user: User; top: number; right: number } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build URL with query parameters
      const url = new URL('/api/users', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());

      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }

      if (roleFilter) {
        url.searchParams.append('role', roleFilter);
      }

      if (businessFilter) {
        url.searchParams.append('businessStatus', businessFilter);
      }

      if (registrationFilter) {
        url.searchParams.append('registrationStatus', registrationFilter);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data: PaginatedUsers = await response.json();
      setUsers(data.users);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
      setAnalytics(data.meta.analytics);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, searchQuery, roleFilter, businessFilter, registrationFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleViewDetails = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handleEdit = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setUserToEdit(userId);
    setShowUserModal(true);
  };

  const openActionMenu = (event: React.MouseEvent, user: User) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = user.role === 'ADMIN' ? 190 : 150;
    const top = window.innerHeight - rect.bottom < menuHeight ? Math.max(8, rect.top - menuHeight) : rect.bottom + 6;
    setActionMenu({ user, top, right: Math.max(8, window.innerWidth - rect.right) });
  };

  const handleDelete = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const toggleApprovalNotifications = async (event: React.MouseEvent, user: User) => {
    event.stopPropagation();
    try {
      const enabled = !user.receivesApprovalNotifications;
      const response = await fetch(`/api/users/${user.id}/approval-notifications`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to update notification administrator');
      setUsers((current) => current.map((item) => ({ ...item, receivesApprovalNotifications: enabled ? item.id === user.id : item.id === user.id ? false : item.receivesApprovalNotifications })));
      toast.success(enabled ? `${user.name} will receive approval notifications` : `${user.name} will no longer receive approval notifications`);
    } catch (toggleError) { toast.error(toggleError instanceof Error ? toggleError.message : 'Unable to update notification administrator'); }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      // Remove the user from the list
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleCreateUser = () => {
    setUserToEdit(null);
    setShowUserModal(true);
  };

  const handleModalClose = () => {
    setShowUserModal(false);
    setUserToEdit(null);
    // Refresh the user list when modal is closed
    fetchUsers();
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      case 'BUSINESS_OWNER':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Business Owner</Badge>;
      case 'BUSINESS_REGISTRAR':
        return <Badge className="bg-green-500 hover:bg-green-600">Business Registrar</Badge>;
      case 'ACCOUNTANT':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Accountant</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{role}</Badge>;
    }
  };

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: analytics.totalUsers, description: "All registered accounts", icon: UserGroupIcon, iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400", accent: "from-blue-500 to-cyan-400" },
          { label: "Users with businesses", value: analytics.usersWithBusinesses, description: "Users managing a listing", icon: BuildingOffice2Icon, iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400", accent: "from-emerald-500 to-teal-400" },
          { label: "Business owners", value: analytics.businessOwners, description: "Registered owner accounts", icon: BriefcaseIcon, iconClass: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400", accent: "from-violet-500 to-fuchsia-400" },
          { label: "Registrations in progress", value: analytics.registrationsInProgress, description: "Profiles awaiting completion", icon: ArrowPathRoundedSquareIcon, iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400", accent: "from-amber-500 to-orange-400" },
        ].map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <Card key={metric.label} className="group relative overflow-hidden border-gray-200 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{metric.label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{metric.value.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
                  </div>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${metric.iconClass}`}>
                    <MetricIcon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-8 min-w-0 max-w-full overflow-hidden border-gray-200 shadow-sm dark:border-gray-800">
        <CardHeader className="border-b border-gray-100 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><CardTitle className="text-xl text-gray-900 dark:text-white">User directory</CardTitle><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Search, filter and manage platform access</p></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              <Select
                value={roleFilter || 'all'}
                onValueChange={(value) => {
                  setRoleFilter(value === 'all' ? null : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
                    <SelectItem value="BUSINESS_REGISTRAR">Business Registrar</SelectItem>
                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={businessFilter || 'all'}
                onValueChange={(value) => {
                  setBusinessFilter(value === 'all' ? null : value);
                  if (value !== 'all') setRegistrationFilter(null);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Business status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Business Statuses</SelectItem>
                    <SelectItem value="with_business">With Businesses</SelectItem>
                    <SelectItem value="without_business">Without Businesses</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={registrationFilter || 'all'}
                onValueChange={(value) => {
                  setRegistrationFilter(value === 'all' ? null : value);
                  if (value !== 'all') setBusinessFilter(null);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Registration step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Registrations</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button
                className="flex items-center gap-2"
                onClick={handleCreateUser}
              >
                <PlusIcon className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-500">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="max-h-[60vh] max-w-full overflow-auto overscroll-contain">
              <table className="w-full min-w-[1180px]">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/70">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Businesses
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="cursor-pointer transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-500/5" onClick={() => handleViewDetails(user.id)}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-8 w-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <span className="text-gray-500 dark:text-gray-400">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {user.phone || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/businesses?ownerId=${user.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {user.businesses.length} {user.businesses.length === 1 ? "business" : "businesses"}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {user.businessRegistrations[0]?.isCompleted || user.businesses.length > 0 ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                        ) : user.businessRegistrations[0] ? (
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            Step {user.businessRegistrations[0].step}: {registrationStepLabels[user.businessRegistrations[0].step] || 'In progress'}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500 hover:bg-gray-600">Not started</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {user.emailVerified ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                        ) : (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          type="button"
                          onClick={(event) => openActionMenu(event, user)}
                          className="dropdown-toggle inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                          aria-label={`Actions for ${user.name}`}
                          aria-haspopup="menu"
                          aria-expanded={actionMenu?.user.id === user.id}
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && users.length > 0 && (
        <div className="max-w-full overflow-x-auto flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{users.length}</span> of{' '}
            <span className="font-medium">{total}</span> users
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {actionMenu && (
        <>
          <button type="button" aria-label="Close actions menu" className="fixed inset-0 z-[80] cursor-default" onClick={(event) => { event.stopPropagation(); setActionMenu(null); }} />
          <div role="menu" style={{ top: actionMenu.top, right: actionMenu.right }} className="fixed z-[90] w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 text-left shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <p className="truncate border-b border-gray-100 px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-800">{actionMenu.user.name}</p>
            <button role="menuitem" onClick={(event) => { setActionMenu(null); handleEdit(event, actionMenu.user.id); }} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"><PencilIcon className="h-5 w-5" />Edit user</button>
            <button role="menuitem" onClick={(event) => { event.stopPropagation(); setActionMenu(null); setUserToReset(actionMenu.user); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 dark:text-gray-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-300"><KeyIcon className="h-5 w-5" />Reset password</button>
            {actionMenu.user.role === 'ADMIN' && <button role="menuitem" onClick={(event) => { setActionMenu(null); toggleApprovalNotifications(event, actionMenu.user); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 dark:text-gray-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"><BellIcon className="h-5 w-5" />{actionMenu.user.receivesApprovalNotifications ? 'Disable approval alerts' : 'Receive approval alerts'}</button>}
            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
            <button role="menuitem" onClick={(event) => { setActionMenu(null); handleDelete(event, actionMenu.user.id); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"><TrashIcon className="h-5 w-5" />Delete user</button>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <UserModal
        isOpen={showUserModal}
        onClose={handleModalClose}
        userId={userToEdit || undefined}
      />
      <ResetPasswordDialog isOpen={Boolean(userToReset)} user={userToReset} onClose={() => setUserToReset(null)} />
    </div>
  );
}
