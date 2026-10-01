'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, ClipboardDocumentIcon, KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ResetUser { id: string; name: string; phone: string | null; }

export default function ResetPasswordDialog({ isOpen, user, onClose }: { isOpen: boolean; user: ResetUser | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [notifyBySms, setNotifyBySms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
    if (isOpen) { setNotifyBySms(false); setPassword(null); setSmsStatus(null); setError(null); }
  }, [isOpen, user?.id]);

  const resetPassword = async () => {
    if (!user) return;
    setSubmitting(true); setError(null);
    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notifyBySms }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Password reset failed');
      setPassword(result.temporaryPassword);
      setSmsStatus(notifyBySms ? (result.smsSent ? 'The new password was sent by SMS.' : `Password reset, but SMS failed: ${result.smsError || 'Unknown gateway error'}`) : null);
    } catch (resetError) { setError(resetError instanceof Error ? resetError.message : 'Password reset failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); if (!submitting) onClose(); }} className="fixed inset-0 z-[1000] m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl backdrop:bg-gray-950/50 backdrop:backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-100 p-6 dark:border-gray-800"><div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">{password ? <CheckCircleIcon className="h-6 w-6" /> : <KeyIcon className="h-6 w-6" />}</div>
        <div className="min-w-0 flex-1"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">{password ? 'Temporary password created' : 'Reset user password'}</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{password ? `Copy and securely share this password with ${user?.name}. It is shown only here.` : `Create a new temporary password for ${user?.name}. Their current sessions will be signed out.`}</p></div>
        <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"><XMarkIcon className="h-5 w-5" /></button>
      </div></div>
      <div className="space-y-4 p-6">
        {password ? <><div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 p-3 dark:border-brand-500/30 dark:bg-brand-500/10"><code className="min-w-0 flex-1 break-all text-base font-semibold text-gray-900 dark:text-white">{password}</code><button type="button" onClick={() => navigator.clipboard.writeText(password)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-100 dark:text-brand-400" title="Copy password"><ClipboardDocumentIcon className="h-5 w-5" /></button></div>{smsStatus && <p className={`rounded-lg px-3 py-2 text-sm ${smsStatus.includes('failed') ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300'}`}>{smsStatus}</p>}</> :
        <label className={`flex items-start gap-3 rounded-xl border p-4 ${user?.phone ? 'cursor-pointer border-gray-200 dark:border-gray-700' : 'cursor-not-allowed border-gray-100 opacity-60 dark:border-gray-800'}`}><input type="checkbox" checked={notifyBySms} disabled={!user?.phone} onChange={(event) => setNotifyBySms(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" /><span><span className="block text-sm font-medium text-gray-900 dark:text-white">Notify the user by SMS</span><span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{user?.phone ? `Send the new password to ${user.phone}.` : 'This user has no phone number.'}</span></span></label>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">{!password && <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">Cancel</button>}<button type="button" onClick={password ? onClose : resetPassword} disabled={submitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">{submitting ? 'Resetting…' : password ? 'Done' : 'Reset password'}</button></div>
    </dialog>
  );
}
