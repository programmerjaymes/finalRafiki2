import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = 'md',
}: ModalProps) {
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

  // Prevent closing when clicking on the modal content
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Size variants
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <dialog
      ref={dialogRef}
      className={`rounded-lg shadow-xl p-0 backdrop:bg-gray-500/20 dark:backdrop:bg-gray-900/50 w-full ${sizeClasses[size]}`}
      onClick={handleClose} // Close when clicking on the backdrop
      onClose={handleClose}
    >
      <div onClick={handleDialogClick} className="h-full">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            type="button"
            className="inline-flex rounded-full p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </dialog>
  );
} 