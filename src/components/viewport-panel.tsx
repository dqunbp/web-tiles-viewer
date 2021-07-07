import * as React from "react";
import { Button, EditableText, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useActor } from "@xstate/react";
import { MapEventType, mapService } from "lib/map-state-machine";
import { useCopyToClipboard } from "hooks/use-copy-to-clipboard";
import { useEditableField } from "hooks/use-editable-field";

function isFloat(value: string): boolean {
  return /^-?([0-9]*[.])?[0-9]+$/.test(value);
}

function isCenterValid(center: string) {
  const latLngs = center.split(",");

  if (latLngs.length !== 2) return false;

  const [lng, lat] = latLngs.map((el) => el.trim());

  return +lat <= 90 && +lat >= -90 && !Number.isNaN(lng);
}

function isZoomValid(zoom: string) {
  return isFloat(zoom) && +zoom >= 0 && +zoom <= 22;
}

const ViewportPanel: React.FC = () => {
  const [{ context }, send] = useActor(mapService);

  const zoom = context.zoom.toString();

  const [lat, lng] = context.center;
  const center = `${lng}, ${lat}`;

  const [copyStatus, copyCenter] = useCopyToClipboard(center);

  const editableZoom = useEditableField(isZoomValid, (zoom: string) =>
    send({ type: MapEventType.ZOOM, zoom: +zoom })
  );

  const editableCenter = useEditableField(isCenterValid, (center: string) => {
    const [lat, lng] = center.split(",").map((el) => el.trim());
    send({ type: MapEventType.MOVE, center: [+lat, +lng] });
  });

  return (
    <div className="z-10 absolute right-0 sm:right-10 xl:right-1/2 xl:translate-x-1/2 w-full sm:w-auto bottom-11 sm:bottom-8 p-4 sm:px-6 bg-LIGHT_GRAY5 sm:rounded">
      <div className="flex items-center sm:text-lg justify-center">
        <strong className="mr-3">Zoom</strong>
        <div className="mr-3">
          <EditableText
            selectAllOnFocus
            className="w-[25px] sm:w-[45px]"
            intent={editableZoom.isValid ? Intent.NONE : Intent.DANGER}
            value={editableZoom.isEditing ? editableZoom.value : zoom}
            onChange={editableZoom.setValue}
            onEdit={editableZoom.setValue}
            onConfirm={editableZoom.handleConfirm}
          />
        </div>
        <strong className="mr-3">Lat,Lng</strong>
        <div className="mr-3">
          <EditableText
            selectAllOnFocus
            className="w-[80px] sm:w-[160px]"
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
