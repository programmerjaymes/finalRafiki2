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
      icon: 'text-red-500 dark:text-red-400',
      confirm: 'bg-red-500 hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    },
    warning: {
      icon: 'text-amber-500 dark:text-amber-400',
      confirm: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700',
    },
    info: {
      icon: 'text-blue-500 dark:text-blue-400',
      confirm: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    },
  };

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg shadow-xl p-0 backdrop:bg-gray-500/20 dark:backdrop:bg-gray-900/50 backdrop:backdrop-blur-sm w-full max-w-md"
      onClick={handleClick}
      onClose={handleClose}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${variantClasses[variant].icon}`}>
            <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
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
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 flex flex-row-reverse gap-2 rounded-b-lg">
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