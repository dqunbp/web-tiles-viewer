import * as React from "react";
import mapbox from "lib/map-wrapper";
import { EventType, stateService } from "lib/app-state-machine";

function syncMapEventsWithXState(map: mapboxgl.Map): void {
  map.once("load", () => stateService.send({ type: EventType.MAP_LOAD }));
  map.on("zoomend", () => {
    stateService.send({
      type: EventType.ZOOM,
      zoom: +map.getZoom().toFixed(2),
      isOriginal: true,
    });
  });
  map.on("moveend", () => {
    stateService.send({
      type: EventType.MOVE,
      center: [
        +map.getCenter().lng.toFixed(4),
        +map.getCenter().lat.toFixed(4),
      ],
      isOriginal: true,
    });
  });
}

const WebMap: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      id="map"
      ref={(node) => mapbox.create(node, syncMapEventsWithXState)}
      className={className}
    ></div>
  );
};

export default WebMap;
