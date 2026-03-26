'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import UserMetaCard from '@/components/user-profile/UserMetaCard';
import UserInfoCard from '@/components/user-profile/UserInfoCard';
import UserAddressCard from '@/components/user-profile/UserAddressCard';

export type ProfileUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProfileClient() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${session.user.id}`);
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || 'Failed to load profile');

        const u = json?.user;
        const mapped: ProfileUser = {
          id: u.id,
          name: u.name,
          email: u.email ?? null,
          phone: u.phone ?? null,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };

        if (!cancelled) setUser(mapped);
      } catch (e) {
        console.error('Failed to load profile user:', e);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6">
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 animate-pulse bg-white dark:bg-white/[0.03]">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="mt-4 h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 animate-pulse bg-white dark:bg-white/[0.03]">
          <div className="h-6 w-56 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || !session?.user?.id) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Profile</h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Profile</h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Unable to load your profile data right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserMetaCard user={user} />
      <UserInfoCard user={user} />
      <UserAddressCard user={user} />
    </div>
  );
}

