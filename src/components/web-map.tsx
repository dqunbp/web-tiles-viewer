import * as React from "react";
import mapbox from "lib/map-wrapper";
import { MapEventType, mapService } from "lib/map-state-machine";

function onMapCreated(map: mapboxgl.Map): void {
  map.once("load", () => mapService.send({ type: MapEventType.MAP_LOAD }));
}

const WebMap: React.FC<{ className?: string }> = ({ className }) => {
  React.useEffect(() => {
    return () => {
      mapbox.map.remove();
    };
  }, []);

  return (
    <div
      id="map"
      ref={(node) => mapbox.create(node, onMapCreated)}
      className={className}
    ></div>
  );
};

export default WebMap;
