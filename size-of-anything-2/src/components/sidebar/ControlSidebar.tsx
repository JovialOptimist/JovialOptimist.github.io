import React from "react";
import PanelController from "./PanelController";
import { usePanel } from "../../state/panelStore";

export default function ControlSidebar() {
  const { activePanel } = usePanel();

  if (!activePanel) return null;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto">
      <PanelController panelKey={activePanel} />
    </div>
  );
}
