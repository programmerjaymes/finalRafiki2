import React from 'react';
import Modal from '@/components/common/Modal';
import UserForm from './UserForm';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // If provided, we're editing a user
}

export default function UserModal({ isOpen, onClose, userId }: UserModalProps) {
  const title = userId ? 'Edit User' : 'Create User';
  
  const handleFormSubmitSuccess = () => {
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <UserForm 
        userId={userId} 
        onBack={onClose} 
        onSuccess={handleFormSubmitSuccess}
      />
    </Modal>
  );
} 