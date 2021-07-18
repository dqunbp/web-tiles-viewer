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
import { MapEventType, mapService } from "lib/map-state-machine";
import { DataLayer } from "lib/mapbox-helpers";

const LayersTab: React.FC = () => {
  const [state, send] = useActor(mapService);

  const { isOpen, onToggle, onClose } = useDisclosure();

  const drawerWidth = useMedia(
    [`(max-width: 640px)`, `(max-width: 1024px)`],
    [`100%`, `400px`],
    `450px`
  );

  const handleAddNewLayer = (layer: DataLayer) => {
    send({
      type: MapEventType.ADD_LAYER,
      layer,
    });
    onClose();
  };

  return (
    <div className="px-4 h-full w-full">
      <Button
        fill
        large
        icon={IconNames.NEW_LAYER}
        text="Add a new layer"
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
