import React from 'react';
import Label from '@/components/form/Label';
import { User } from './types';

interface UserSelectorProps {
  selectedUserId: string;
  users: User[];
  onUserChange: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUserId,
  users,
  onUserChange,
}) => {
  return (
    <div className="mb-6">
      <Label>Assign to User (Business Owner) *</Label>
      <select
        value={selectedUserId}
        onChange={(e) => onUserChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        required
      >
        <option value="">Select a business owner</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.email}){user.role ? ` - ${user.role}` : ''}
          </option>
        ))}
      </select>
      {users.length === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          No users available. Please create a user first.
        </p>
      )}
    </div>
  );
};

export default UserSelector;
