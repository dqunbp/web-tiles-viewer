import * as React from "react";
import mapbox from "lib/map-wrapper";
import { mapService } from "lib/map-state-machine";
import { MapEventType } from "lib/map-state-machine";

const onLoad = () => {
  mapService.send({ type: MapEventType.LOAD });
  mapbox.map.resize();
};
const onMove = () => {
  mapService.send({
    type: MapEventType.MOVE,
    center: [
      mapbox.map.getCenter().lng.toFixed(4),
      mapbox.map.getCenter().lat.toFixed(4),
    ],
    zoom: mapbox.map.getZoom().toFixed(2),
  });
};
const onMoveEnd = () => {
  mapService.send({ type: MapEventType.PERSIST });
};

const onNodeCreated = <T extends HTMLElement>(node: T | null) => {
  if (node === null) return;

  const { zoom, center, style } = mapService.state.context;
  const [lng, lat] = center;

  mapbox.create(node, {
    style: style.url,
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    zoom: +zoom,
    center: [+lng, +lat],
  });
  mapbox.map.once("load", onLoad);
  mapbox.map.on("move", onMove);
  mapbox.map.on("moveend", onMoveEnd);
  mapbox.map.once("dataloading", () => mapbox.map.resize());
};

const WebMap: React.FC<{ className?: string }> = ({ className }) => {
  React.useLayoutEffect(() => {
    return () => {
      mapbox.cleanup();
    };
  }, []);

  return <div id="map" ref={onNodeCreated} className={className}></div>;
};

export default WebMap;
