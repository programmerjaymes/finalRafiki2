'use client';

import { useRef, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  variant = 'warning',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  // Prevent clicking outside to close
  const handleClick = (e: React.MouseEvent) => {
    const dialogDimensions = dialogRef.current?.getBoundingClientRect();
    if (
      dialogDimensions &&
      (e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom)
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Color variants
  const variantClasses = {
    danger: {
      icon: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
      confirm: 'bg-red-500 hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    },
    warning: {
      icon: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400',
      confirm: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700',
    },
    info: {
      icon: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
      confirm: 'bg-brand-500 hover:bg-brand-600 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600',
    },
  };

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-0 m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border p-0 shadow-2xl backdrop:bg-gray-950/45 backdrop:backdrop-blur-sm dark:bg-gray-900 ${variant === 'info' ? 'border-brand-200 bg-white dark:border-brand-500/30' : 'border-gray-200 bg-white dark:border-gray-700'}`}
      onClick={handleClick}
      onClose={handleClose}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${variantClasses[variant].icon}`}>
            <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="inline-flex rounded-full p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className={`flex flex-row-reverse gap-2 border-t px-6 py-4 ${variant === 'info' ? 'border-brand-100 bg-brand-50/60 dark:border-brand-500/20 dark:bg-brand-500/5' : 'border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
        <button
          type="button"
          className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${variantClasses[variant].confirm}`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          {cancelText}
        </button>
      </div>
    </dialog>
  );
} 