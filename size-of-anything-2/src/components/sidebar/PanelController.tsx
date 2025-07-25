import React from "react";
import TextSearchPanel from "../panels/TextSearchPanel";
import MagicWandPanel from "../panels/MagicWandPanel";
import CustomAreaPanel from "../panels/CustomAreaPanel";
import HistoryPanel from "../panels/HistoryPanel";
import HelpPanel from "../panels/HelpPanel";
import DonatePanel from "../panels/DonatePanel";
import SettingsPanel from "../panels/SettingsPanel";

interface PanelControllerProps {
  panelKey: string | null;
}

/**
 * Maps active panel key to the corresponding component
 */
const PanelController: React.FC<PanelControllerProps> = ({ panelKey }) => {
  // Map panel keys to components
  const getPanelComponent = () => {
    switch (panelKey) {
      case "text-search":
        return <TextSearchPanel />;
      case "magic-wand":
        return <MagicWandPanel />;
      case "custom-area":
        return <CustomAreaPanel />;
      case "history":
        return <HistoryPanel />;
      case "help":
        return <HelpPanel />;
      case "donate":
        return <DonatePanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return <div className="empty-panel">Select a tool</div>;
    }
  };

  return <div className="panel-container">{getPanelComponent()}</div>;
};

export default PanelController;
