import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-3">
        <div className="mb-4 flex items-center justify-between">
          <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-sm p-1 text-muted-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </DialogPanel>
    </div>
  </Dialog>
);
