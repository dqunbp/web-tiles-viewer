import * as React from "react";
// import AddLayerForm from "./add-layer-form";
import StylesList from "./styles-list";

const StylesTab: React.FC = () => {
  return (
    <div className="px-4 h-full w-full text-left">
      {/* <AddLayerForm /> */}
      <StylesList />
    </div>
  );
};

export default StylesTab;
