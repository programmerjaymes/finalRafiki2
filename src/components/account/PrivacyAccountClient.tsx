'use client';

import React, { useMemo, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

type Tab = 'delete' | 'request-account' | 'request-data';

export default function PrivacyAccountClient() {
  const { data: session, status } = useSession();
  const authed = status === 'authenticated' && !!session?.user;

  const dashboardHref = useMemo(() => {
    if (status !== 'authenticated') return '/';
    const role = session?.user?.role;
    if (role === 'ADMIN') return '/dashboard';
    if (role === 'BUSINESS_OWNER') return '/business-dashboard';
    return '/';
  }, [session?.user?.role, status]);

  const [tab, setTab] = useState<Tab>('delete');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [reqAccountDetails, setReqAccountDetails] = useState('');
  const [reqAccountEmail, setReqAccountEmail] = useState('');
  const [reqAccountName, setReqAccountName] = useState('');
  const [reqAccountLoading, setReqAccountLoading] = useState(false);
  const [reqAccountMsg, setReqAccountMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );

  const [reqDataDetails, setReqDataDetails] = useState('');
  const [reqDataEmail, setReqDataEmail] = useState('');
  const [reqDataName, setReqDataName] = useState('');
  const [reqDataLoading, setReqDataLoading] = useState(false);
  const [reqDataMsg, setReqDataMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const runDeleteAccount = async () => {
    setDeleteMsg(null);
    if (!authed) {
      setDeleteMsg({ type: 'err', text: 'Sign in to delete your account from this page.' });
      return;
    }
    if (!deletePassword) {
      setDeleteMsg({ type: 'err', text: 'Enter your password to confirm.' });
      return;
    }
    if (deleteConfirm !== 'DELETE MY ACCOUNT') {
      setDeleteMsg({
        type: 'err',
        text: 'Type DELETE MY ACCOUNT in the confirmation box exactly.',
      });
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteMsg({ type: 'err', text: json.error || 'Deletion failed.' });
        return;
      }
      setDeleteMsg({ type: 'ok', text: 'Your account was deleted. Signing you out…' });
      setDeletePassword('');
      setDeleteConfirm('');
      await signOut({ callbackUrl: '/' });
    } catch {
      setDeleteMsg({ type: 'err', text: 'Network error. Try again or use a request form.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const submitRequest = async (
    type: 'ACCOUNT_DELETION' | 'DATA_DELETION',
    details: string,
    email: string,
    name: string,
    setLoading: (v: boolean) => void,
    setMsg: (v: { type: 'ok' | 'err'; text: string } | null) => void,
  ) => {
    setMsg(null);
    const payload: Record<string, string> = { type, details };
    if (!session?.user?.email) {
      payload.email = email.trim();
      if (name.trim()) payload.name = name.trim();
    }
    if (!session?.user?.email && !payload.email) {
      setMsg({ type: 'err', text: 'Email is required.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/privacy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ type: 'err', text: json.error || 'Could not submit request.' });
        return;
      }
      setMsg({
        type: 'ok',
        text: json.message || 'Request submitted. We will follow up by email if needed.',
      });
      if (type === 'ACCOUNT_DELETION') {
        setReqAccountDetails('');
        if (!session?.user?.email) {
          setReqAccountEmail('');
          setReqAccountName('');
        }
      } else {
        setReqDataDetails('');
        if (!session?.user?.email) {
          setReqDataEmail('');
          setReqDataName('');
        }
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        tab === id
          ? 'bg-brand-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <Link
            href={dashboardHref}
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            ← {status === 'authenticated' ? 'Back to dashboard' : 'Back to home'}
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Account &amp; data requests
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Delete your Rafiki account, or submit a request for us to delete your account or specific
          personal information.
        </p>
      </div>

      {status === 'loading' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Checking session…</p>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {tabBtn('delete', 'Delete account now')}
        {tabBtn('request-account', 'Request account deletion')}
        {tabBtn('request-data', 'Request data deletion')}
      </div>

      {tab === 'delete' && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete account now</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This permanently removes your login, profile, reviews, search history tied to your
            account, payment rows linked to you, and related session data. You cannot do this if
            you still <strong>own</strong> business listings; remove those first or use the request
            form.
          </p>
          {!authed && status !== 'loading' && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
              <Link href="/signin" className="font-medium underline">
                Sign in
              </Link>{' '}
              to delete your account instantly.
            </p>
          )}
          {authed && (
            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="del-pw"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Current password
                </label>
                <input
                  id="del-pw"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="del-confirm"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Type <span className="font-mono text-brand-600">DELETE MY ACCOUNT</span> to confirm
                </label>
                <input
                  id="del-confirm"
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
              {deleteMsg && (
                <p
                  className={
                    deleteMsg.type === 'ok'
                      ? 'text-sm text-green-600 dark:text-green-400'
                      : 'text-sm text-red-600 dark:text-red-400'
                  }
                >
                  {deleteMsg.text}
                </p>
              )}
              <button
                type="button"
                disabled={deleteLoading}
                onClick={runDeleteAccount}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting…' : 'Permanently delete my account'}
              </button>
            </div>
          )}
        </section>
      )}

      {tab === 'request-account' && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Request account deletion
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Use this if you want our team to delete your account manually (for example, if you
            still have listings, use a social login only, or hit an error with instant deletion).
          </p>
          <div className="mt-6 space-y-4">
            {!session?.user?.email && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={reqAccountEmail}
                    onChange={(e) => setReqAccountEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={reqAccountName}
                    onChange={(e) => setReqAccountName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Details
              </label>
              <textarea
                value={reqAccountDetails}
                onChange={(e) => setReqAccountDetails(e.target.value)}
                rows={5}
                placeholder="e.g. Account email, reason, any businesses to remove, deadlines…"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
            {reqAccountMsg && (
              <p
                className={
                  reqAccountMsg.type === 'ok'
                    ? 'text-sm text-green-600 dark:text-green-400'
                    : 'text-sm text-red-600 dark:text-red-400'
                }
              >
                {reqAccountMsg.text}
              </p>
            )}
            <button
              type="button"
              disabled={reqAccountLoading}
              onClick={() =>
                submitRequest(
                  'ACCOUNT_DELETION',
                  reqAccountDetails,
                  reqAccountEmail,
                  reqAccountName,
                  setReqAccountLoading,
                  setReqAccountMsg,
                )
              }
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {reqAccountLoading ? 'Submitting…' : 'Submit account deletion request'}
            </button>
          </div>
        </section>
      )}

      {tab === 'request-data' && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Request deletion of specific information
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Describe which personal data you want removed or corrected (e.g. phone number, old
            email on file, review content). We will respond within a reasonable time under applicable
            law.
          </p>
          <div className="mt-6 space-y-4">
            {!session?.user?.email && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={reqDataEmail}
                    onChange={(e) => setReqDataEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={reqDataName}
                    onChange={(e) => setReqDataName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                What should we delete or change?
              </label>
              <textarea
                value={reqDataDetails}
                onChange={(e) => setReqDataDetails(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
            {reqDataMsg && (
              <p
                className={
                  reqDataMsg.type === 'ok'
                    ? 'text-sm text-green-600 dark:text-green-400'
                    : 'text-sm text-red-600 dark:text-red-400'
                }
              >
                {reqDataMsg.text}
              </p>
            )}
            <button
              type="button"
              disabled={reqDataLoading}
              onClick={() =>
                submitRequest(
                  'DATA_DELETION',
                  reqDataDetails,
                  reqDataEmail,
                  reqDataName,
                  setReqDataLoading,
                  setReqDataMsg,
                )
              }
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {reqDataLoading ? 'Submitting…' : 'Submit data request'}
            </button>
          </div>
        </section>
      )}

      <p className="mt-8 text-xs text-gray-500 dark:text-gray-500">
        For more context, see your privacy policy and support contact on the main site. This tool
        records requests for staff review.
      </p>
    </div>
  );
}
