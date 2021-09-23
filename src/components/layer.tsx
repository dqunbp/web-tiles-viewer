import * as React from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Collapse,
  FormGroup,
  Intent,
  Slider,
  Tag,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

import { useActor } from "@xstate/react";
import { LayerRef } from "machines/mapbox-map";
import { IconNames } from "@blueprintjs/icons";
import { LayerContext, LayerEventType } from "machines/layer";
import { useDisclosure } from "hooks/use-disclosure";

const Layer: React.FC<{ layerRef: LayerRef }> = ({ layerRef }) => {
  const [state, send] = useActor(layerRef);

  const {
    visible,
    opacity,
    data: { name, type },
  } = state.context as LayerContext;

  const { isOpen, onToggle } = useDisclosure();

  return (
    <div className="">
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
          <Tooltip2 content="Toggle visibility" placement="bottom">
            <Button
              small
              icon={visible ? IconNames.EYE_OPEN : IconNames.EYE_OFF}
              onClick={() => send({ type: LayerEventType.TOGGLE_VISIBILITY })}
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
        <div className="bg-WHITE border-2 border-t rounded-b mx-1 p-1 space-y-1">
          <div className="px-6 pt-1">
            <p className="mb-1 font-semibold">Opacity</p>
            <Slider
              min={0}
              max={1}
              stepSize={0.01}
              value={opacity}
              onChange={(value: number) =>
                send({ type: LayerEventType.CHANGE_OPACITY, value })
              }
            />
          </div>
          <Button
            fill
            icon={IconNames.DUPLICATE}
            onClick={() => send({ type: LayerEventType.DUPLICATE })}
            text="Duplicate"
          />
          <Button
            fill
            intent={Intent.DANGER}
            icon={IconNames.TRASH}
            onClick={() => send({ type: LayerEventType.DELETE })}
            text="Delete"
          />
        </div>
      </Collapse>
    </div>
  );
};

export default Layer;
