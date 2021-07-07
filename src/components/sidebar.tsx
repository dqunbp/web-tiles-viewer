import * as React from "react";
import { Tab, Tabs } from "@blueprintjs/core";
import LayersTab from "./layers-tab";
import StylesTab from "./styles-tab";

type TabIds = "layers" | "styles";

const Sidebar: React.FC = () => {
  const [selectedTabId, setSelectedTabId] = React.useState<TabIds>("layers");

  const handleTabChange = (nextId: TabIds) => {
    setSelectedTabId(nextId);
  };

  return (
    <div className="absolute z-20 sm:m-8 sm:mb-28 md:mb-8 left-0 top-0 bottom-0 bg-LIGHT_GRAY5 shadow-md rounded  min-w-full sm:min-w-[300px]">
      <Tabs
        large
        renderActiveTabPanelOnly
        className="w-full h-full"
        id="SidebarTabs"
        selectedTabId={selectedTabId}
        onChange={handleTabChange}
      >
        <Tab
          id="layers"
          title="Data layers"
          className="flex-1 text-center"
          panel={<LayersTab />}
        />
        <Tab
          id="styles"
          title="Map style"
          className="flex-1 text-center"
          panel={<StylesTab />}
        />
      </Tabs>
    </div>
  );
};

export default Sidebar;
