// src/components/UI/Modal.tsx
import React from "react";
import type { ReactNode } from "react";

interface ModalProps {
  title?: string;
  children: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <button onClick={onClose} className="absolute top-2 right-2 text-xl">
          ×
        </button>
        {children}
      </div>
    </div>
  );
};
