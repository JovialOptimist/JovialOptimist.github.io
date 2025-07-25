import React from "react";
import {
  SearchIcon,
  MagicWandIcon,
  CustomAreaIcon,
  HistoryIcon,
  HelpIcon,
  DonateIcon,
  SettingsIcon,
} from "./icons";

import { usePanel } from "../../state/panelStore";

const ICONS = [
  { key: "text-search", label: "Search", icon: <SearchIcon /> },
  { key: "magic-wand", label: "Magic Wand", icon: <MagicWandIcon /> },
  { key: "custom-area", label: "Custom Area", icon: <CustomAreaIcon /> },
  { key: "history", label: "History", icon: <HistoryIcon /> },
];

const SETTINGS_ICONS = [
  { key: "help", label: "Help", icon: <HelpIcon /> },
  { key: "donate", label: "Donate", icon: <DonateIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function IconSidebar() {
  const { activePanel, setActivePanel } = usePanel();

  const renderButton = (item: (typeof ICONS)[0]) => (
    <button
      key={item.key}
      onClick={() => setActivePanel(activePanel === item.key ? null : item.key)}
      className={`p-3 group relative hover:bg-gray-700 ${
        activePanel === item.key ? "border-l-4 border-white bg-gray-800" : ""
      }`}
    >
      {item.icon}
      <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm rounded px-2 py-1 hidden group-hover:block">
        {item.label}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col justify-between h-full bg-gray-900 text-white w-14">
      <div>{ICONS.map(renderButton)}</div>
      <div>{SETTINGS_ICONS.map(renderButton)}</div>
    </div>
  );
}
