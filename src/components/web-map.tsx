import * as React from "react";
import mapbox from "lib/map-wrapper";
import { MapEventType, mapService } from "lib/map-state-machine";

function syncMapEventsWithXState(map: mapboxgl.Map): void {
  map.once("load", () => mapService.send({ type: MapEventType.MAP_LOAD }));
  map.on("zoomend", () => {
    mapService.send({
      type: MapEventType.ZOOM,
      zoom: +map.getZoom().toFixed(2),
      isOriginal: true,
    });
  });
  map.on("moveend", () => {
    mapService.send({
      type: MapEventType.MOVE,
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
