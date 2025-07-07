// src/components/AppShell/TitleBar.tsx
import React from "react";
import { Button } from "../UI/Button";
import { useAppContext } from "../../context/AppContext";

export const TitleBar: React.FC = () => {
  const { toggleSettingsModal, toggleMenu } = useAppContext();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700">
      <h1 className="text-xl font-bold inline">The Size of Anything</h1>
      <div className="space-x-2">
        <Button onClick={toggleSettingsModal}>⚙️</Button>
        <Button onClick={toggleMenu}>☰</Button>
      </div>
    </div>
  );
};
