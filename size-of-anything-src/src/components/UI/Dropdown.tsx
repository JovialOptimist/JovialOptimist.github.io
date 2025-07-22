// src/components/UI/Dropdown.tsx
import React from "react";

interface DropdownOption {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  options: DropdownOption[];
  onClose: () => void;
  anchor?: "top-right" | "bottom-left";
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  onClose,
  anchor = "top-right",
}) => {
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className={`absolute ${
          anchor === "top-right" ? "top-12 right-4" : "bottom-12 left-4"
        } z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-md p-2`}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={opt.onClick}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
