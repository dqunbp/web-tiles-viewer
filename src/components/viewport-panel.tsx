import * as React from "react";
import { Button, EditableText, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useActor } from "@xstate/react";
import { MapEventType, mapService } from "machines/mapbox-map";
import { useCopyToClipboard } from "hooks/use-copy-to-clipboard";
import { useEditableField } from "hooks/use-editable-field";

function isNumber(value: string): boolean {
  return !Number.isNaN(value);
}

function isCenterValid(center: string) {
  const latLngs = center.split(",");

  if (latLngs.length !== 2) return false;

  const [lng, lat] = latLngs.map((el) => el.trim());

  return +lat >= -90 && +lat <= 90 && isNumber(lng);
}

function isZoomValid(zoom: string) {
  return isNumber(zoom) && +zoom >= 0 && +zoom <= 22;
}

const ViewportPanel: React.FC = () => {
  const [{ context }, send] = useActor(mapService);

  const zoom = context.zoom.toString();

  const [lat, lng] = context.center;
  const center = `${lng}, ${lat}`;

  const [copyStatus, copyCenter] = useCopyToClipboard(center);

  const editableZoom = useEditableField(isZoomValid, (nextZoom: string) => {
    if (nextZoom === zoom) return;
    send({ type: MapEventType.SET_ZOOM, zoom: nextZoom });
  });

  const editableCenter = useEditableField(
    isCenterValid,
    (nextCenter: string) => {
      if (nextCenter === center) return;
      const [lng, lat] = nextCenter.split(",").map((el) => el.trim());
      send({ type: MapEventType.SET_CENTER, center: [lng, lat] });
    }
  );

  return (
    <div className="z-10 absolute right-0 top-0 sm:right-8 w-full sm:w-auto sm:top-8 p-3 sm:px-5 sm:pb-2 bg-LIGHT_GRAY5 sm:rounded border-b-4 border-LIGHT_GRAY1">
      <div className="flex items-center justify-center text-xs sm:text-sm">
        <strong className="mr-3">Zoom</strong>
        <div className="mr-3">
          <EditableText
            selectAllOnFocus
            className="w-[40px]"
            intent={editableZoom.isValid ? Intent.NONE : Intent.DANGER}
            value={editableZoom.isEditing ? editableZoom.value : zoom}
            onChange={editableZoom.setValue}
            onEdit={editableZoom.setValue}
            onConfirm={editableZoom.handleConfirm}
          />
        </div>
        <strong className="mr-3">Lat,Lng</strong>
        <div className="mr-2">
          <EditableText
            selectAllOnFocus
            className="w-[130px]"
            intent={editableCenter.isValid ? Intent.NONE : Intent.DANGER}
            value={editableCenter.isEditing ? editableCenter.value : center}
            onChange={editableCenter.setValue}
            onEdit={editableCenter.setValue}
            onConfirm={editableCenter.handleConfirm}
            onCancel={editableCenter.handleConfirm}
          />
        </div>
        <Button
          minimal
          intent={copyStatus === "copied" ? Intent.SUCCESS : Intent.NONE}
          icon={copyStatus === "copied" ? IconNames.TICK : IconNames.DUPLICATE}
          onClick={copyCenter}
        />
      </div>
    </div>
  );
};

export default ViewportPanel;
