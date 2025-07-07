// src/components/AppShell/MenuDropdown.tsx
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { Dropdown } from "../UI/Dropdown";

export const MenuDropdown: React.FC = () => {
  const { menuOpen, toggleMenu } = useAppContext();

  if (!menuOpen) return null;

  const options = [
    {
      label: "Donate",
      onClick: () => window.open("https://yourdonationpage.com", "_blank"),
    },
    { label: "Tutorial", onClick: () => alert("Tutorial placeholder") },
  ];

  return <Dropdown options={options} onClose={toggleMenu} anchor="top-right" />;
};
