import React from "react";
import PanelController from "./PanelController";
import { usePanel } from "../../state/panelStore";

export default function ControlSidebar() {
  const { activePanel } = usePanel();

  if (!activePanel) return null;

  return (
    <div className="control-sidebar">
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
    </div>
  );
}
