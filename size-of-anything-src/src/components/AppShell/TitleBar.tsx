import React from "react";
import { useAppContext } from "../../context/AppContext";
import "../../styles/global.css"; // Ensure global styles are applied
// enable tailwind
import "../../styles/theme.css"; // Ensure theme styles are applied

export const TitleBar: React.FC = () => {
  const { toggleSettingsModal, toggleMenu } = useAppContext();

  return (
    <>
      {/* Left side: title */}
      <div id="titleBar">
        <div>The Size of Anything</div>
        <div className="flex space-x-2">
          <button onClick={toggleSettingsModal}>⚙️</button>
          <button onClick={toggleMenu}>☰</button>
        </div>
      </div>
    </>
  );
};
