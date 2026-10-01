'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import toast from '@/utils/toast';

export default function ClearLogsButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const clearLogs = async () => {
    setShowConfirm(false);
    setClearing(true);
    try {
      const response = await fetch('/api/system-logs', { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to empty logs');
      toast.success(`Deleted ${data.deleted.applicationLogs} application logs and ${data.deleted.auditTrails} audit entries`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to empty logs');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setShowConfirm(true)} disabled={clearing} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-500/10">
        <TrashIcon className="h-4 w-4" />{clearing ? 'Emptying…' : 'Empty Logs'}
      </button>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Empty all system logs?"
        message="This permanently deletes every application error and audit-trail entry. This action cannot be undone. SMS delivery history will not be deleted."
        confirmText="Empty Logs"
        cancelText="Cancel"
        variant="danger"
        onClose={() => setShowConfirm(false)}
        onConfirm={() => void clearLogs()}
      />
    </>
  );
}
