import * as React from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Collapse,
  Intent,
  NonIdealState,
  Spinner,
  Tag,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

import { useActor } from "@xstate/react";
import { LayerRef, mapService } from "lib/map-state-machine";
import { IconNames } from "@blueprintjs/icons";
import { LayerEventType } from "lib/layer-state-machine";
import { DataLayer } from "lib/mapbox-helpers";
import { useDisclosure } from "hooks/use-disclosure";

const Layer: React.FC<{ layerRef: LayerRef }> = ({ layerRef }) => {
  const [state, send] = useActor(layerRef);

  const { name, type } = state.context.data as DataLayer;

  const { isOpen, onToggle } = useDisclosure();

  return (
    <div className="mb-2">
      <Card className="py-2 px-3 last:mb-0 flex justify-between items-center border-l-4">
        <div className="flex flex-col items-start">
          <div className="font-bold font-mono text-md">
            <div className="max-w-[15ch] truncate" title={name}>
              {name}
            </div>
          </div>
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
        <ButtonGroup minimal>
          <Tooltip2 content="Move to top" placement="bottom">
            <Button
              small
              icon={IconNames.ARROW_UP}
              onClick={() => send({ type: LayerEventType.MOVE_TO_TOP })}
            />
          </Tooltip2>
          <Tooltip2 usePortal content="Duplicate" placement="bottom">
            <Button
              small
              icon={IconNames.DUPLICATE}
              onClick={() => send({ type: LayerEventType.DUPLICATE })}
            />
          </Tooltip2>
          <Tooltip2 content="Delete" placement="bottom">
            <Button
              small
              icon={IconNames.TRASH}
              onClick={() => send({ type: LayerEventType.DELETE })}
            />
          </Tooltip2>
          <Button
            small
            icon={isOpen ? IconNames.CHEVRON_UP : IconNames.CHEVRON_DOWN}
            onClick={onToggle}
          />
        </ButtonGroup>
      </Card>
      <Collapse isOpen={isOpen}>
        <div className="bg-LIGHT_GRAY1 rounded-b mx-1">Content</div>
      </Collapse>
    </div>
  );
};

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
