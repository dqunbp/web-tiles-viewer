import * as React from "react";
import { Card } from "@blueprintjs/core";

const layers = [
  { id: "1", label: "layer-1" },
  { id: "2", label: "layer-2" },
];

const Layer: React.FC<{ id: string; label: string }> = ({ id, label }) => {
  return <Card className="mb-2 last:mb-0">{`#${id} ${label}`}</Card>;
};

const LayersList: React.FC = () => {
  return (
    <div className="py-4">
      {layers.map((layer) => (
        <Layer key={layer.id} id={layer.id} label={layer.label} />
      ))}
    </div>
  );
};

export default LayersList;
