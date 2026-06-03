import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <DialogTitle className="mb-4 text-lg font-semibold text-gray-900">{title}</DialogTitle>
        {children}
      </DialogPanel>
    </div>
  </Dialog>
);
