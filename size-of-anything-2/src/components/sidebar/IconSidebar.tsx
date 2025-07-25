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

  const renderButton = (
    item: (typeof ICONS)[0] | (typeof SETTINGS_ICONS)[0]
  ) => (
    <button
      key={item.key}
      onClick={() => setActivePanel(activePanel === item.key ? null : item.key)}
      className={`icon-button flex flex-col items-center group relative ${
        activePanel === item.key ? "active" : ""
      }`}
    >
      <span className="flex items-center justify-center">{item.icon}</span>
      {activePanel === item.key && (
        <span className="text-xs mt-1">{item.key}</span>
      )}
    </button>
  );

  return (
    <div className="icon-sidebar">
      <div className="top-tools">{ICONS.map(renderButton)}</div>
      <div className="bottom-tools">{SETTINGS_ICONS.map(renderButton)}</div>
    </div>
  );
}
