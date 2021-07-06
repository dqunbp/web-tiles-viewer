import * as React from "react";
import { Button, Card, Intent, Tag } from "@blueprintjs/core";
import { useActor } from "@xstate/react";
import { LayerRef, mapService } from "lib/map-state-machine";
import { IconNames } from "@blueprintjs/icons";
import { LayerEventType } from "lib/layer-state-machine";

const Layer: React.FC<{ layerRef: LayerRef }> = ({ layerRef }) => {
  const [state, send] = useActor(layerRef);

  const { name, type } = state.context;

  return (
    <Card className="mb-2 last:mb-0 flex justify-between items-center">
      <div className="flex flex-col items-start mt-2">
        <div className="font-bold font-mono text-md">{`${name}`}</div>
        <div>
          <Tag
            round
            minimal
            intent={type === "raster" ? Intent.SUCCESS : Intent.PRIMARY}
          >
            {type}
          </Tag>
        </div>
      </div>
      <Button
        minimal
        icon={IconNames.TRASH}
        onClick={() => send({ type: LayerEventType.DELETE })}
      />
    </Card>
  );
};

const LayersList: React.FC = () => {
  const [state, send] = useActor(mapService);
  const layers = state.context.layers;

  return (
    <div className="py-4">
      {layers.length === 0
        ? "No layers"
        : layers.map(({ ref, ...layerProps }) => (
            <Layer key={layerProps.id} layerRef={ref} />
          ))}
    </div>
  );
};

export default LayersList;
