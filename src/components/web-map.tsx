import * as React from "react";
import mapbox from "lib/map-wrapper";
import { mapService } from "lib/map-state-machine";
import { MapEventType } from "lib/map-state-machine";

const onNodeCreated = <T extends HTMLElement>(node: T | null) => {
  if (node === null) return;

  const { zoom, center } = mapService.state.context;
  const [lng, lat] = center;

  mapbox.create(node, {
    style: "mapbox://styles/mapbox/streets-v11",
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    zoom: +zoom,
    center: [+lng, +lat],
  });
  mapbox.map.once("load", () => {
    mapService.send({ type: MapEventType.LOAD });
  });
  mapbox.map.on("move", () => {
    mapService.send({
      type: MapEventType.MOVE,
      center: [
        mapbox.map.getCenter().lng.toFixed(4),
        mapbox.map.getCenter().lat.toFixed(4),
      ],
      zoom: mapbox.map.getZoom().toFixed(2),
    });
  });
};

const WebMap: React.FC<{ className?: string }> = ({ className }) => {
  React.useEffect(() => {
    return () => {
      mapbox.cleanup(true);
    };
  }, []);

  return <div id="map" ref={onNodeCreated} className={className}></div>;
};

export default WebMap;
