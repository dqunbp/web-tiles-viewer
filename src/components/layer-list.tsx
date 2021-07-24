import * as React from "react";
import { NonIdealState, Spinner } from "@blueprintjs/core";

import { useActor } from "@xstate/react";
import { mapService } from "lib/map-state-machine";
import { IconNames } from "@blueprintjs/icons";
import Layer from "./layer";

const LayersList: React.FC = () => {
  const [state] = useActor(mapService);
  const layers = state.context.layers;

  if (state.matches("loading"))
    return (
      <div className="py-4">
        <Spinner />
      </div>
    );

  return (
    <div className="py-4">
      {layers.length === 0 ? (
        <NonIdealState icon={IconNames.LAYERS} title="No layers" />
      ) : (
        layers.map(({ ref, ...layerProps }) => (
          <Layer key={layerProps.id} layerRef={ref} />
        ))
      )}
    </div>
  );
};

export default LayersList;
