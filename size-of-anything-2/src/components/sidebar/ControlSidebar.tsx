import React from "react";
import PanelController from "./PanelController";
import { usePanel } from "../../state/panelStore";

export default function ControlSidebar() {
  const { activePanel } = usePanel();

  // Instead of returning null, use CSS classes to control visibility
  const sidebarClass = activePanel 
    ? "control-sidebar visible" 
    : "control-sidebar hidden";

  return (
    <div className={sidebarClass}>
      {activePanel && (
        <PanelController
          panelKey={
            activePanel as
              | "text-search"
              | "magic-wand"
              | "custom-area"
              | "history"
              | "help"
              | "donate"
              | "settings"
          }
        />
      )}
    </div>
  );
}
