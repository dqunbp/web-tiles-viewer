import * as React from "react";
import AddLayerForm from "./add-layer-form";
import LayersList from "./layer-list";

const LayersTab: React.FC = () => {
  return (
    <div className="px-4 h-full w-full">
      <AddLayerForm />
      <LayersList />
    </div>
  );
};

export default LayersTab;
