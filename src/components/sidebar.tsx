import * as React from "react";
import { Icon, Tab, Tabs } from "@blueprintjs/core";
import LayersTab from "./layers-tab";
import StylesTab from "./styles-tab";
import { IconNames } from "@blueprintjs/icons";

type TabIds = "layers" | "styles";

const Sidebar: React.FC = () => {
  const [selectedTabId, setSelectedTabId] = React.useState<TabIds>("layers");

  const handleTabChange = (nextId: TabIds) => {
    setSelectedTabId(nextId);
  };

  return (
    <div className="absolute z-20 md:m-8 left-0 md:top-0 top-14 bottom-0  bg-LIGHT_GRAY5 shadow-md md:rounded  min-w-full md:min-w-[300px]">
      <Tabs
        large
        renderActiveTabPanelOnly
        className="w-full h-full"
        id="SidebarTabs"
        selectedTabId={selectedTabId}
        onChange={handleTabChange}
        animate={false}
      >
        <Tab
          id="layers"
          title={
            <div>
              <Icon icon={IconNames.LAYERS} />
              <span className="ml-2">Data layers</span>
            </div>
          }
          className="flex-1 text-center"
          panel={<LayersTab />}
        />
        <Tab
          id="styles"
          title={
            <div>
              <Icon icon={IconNames.STYLE} />
              <span className="ml-2">Map style</span>
            </div>
          }
          className="flex-1 text-center"
          panel={<StylesTab />}
        />
      </Tabs>
    </div>
  );
};

export default Sidebar;
