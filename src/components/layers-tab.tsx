import * as React from "react";
import {
  H2,
  Button,
  Classes,
  Drawer,
  FormGroup,
  InputGroup,
  RadioGroup,
  Radio,
  DrawerSize,
  Menu,
  MenuItem,
} from "@blueprintjs/core";
import { useDisclosure } from "hooks/use-disclosure";
import AddLayerForm from "./add-layer-form";
import LayersList from "./layer-list";
import { IconNames } from "@blueprintjs/icons";
import { useMedia } from "hooks/use-media";
import { useActor } from "@xstate/react";
import { EventType, stateService } from "lib/app-state-machine";
import { DataLayer } from "lib/mapbox-helpers";

const LayersTab: React.FC = () => {
  const [state, send] = useActor(stateService);

  const { isOpen, onToggle, onClose } = useDisclosure();

  const drawerWidth = useMedia(
    [`(max-width: 640px)`, `(max-width: 1024px)`],
    [`100%`, `400px`],
    `450px`
  );

  const handleAddNewLayer = (layer: DataLayer) => {
    send({
      type: EventType.ADD_LAYER,
      layer,
    });
    onClose();
  };

  return (
    <div className="px-4 h-full w-full">
      <Button
        fill
        large
        icon={IconNames.ADD}
        text="Add new layer"
        onClick={onToggle}
      />
      <Drawer size={drawerWidth} isOpen={isOpen} onClose={onClose}>
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            <AddLayerForm onSubmit={handleAddNewLayer} onClose={onClose} />
          </div>
        </div>
      </Drawer>
      <LayersList />
    </div>
  );
};

export default LayersTab;
