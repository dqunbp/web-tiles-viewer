import {
  createMachine,
  assign,
  interpret,
  EventObject,
  AssignAction,
  spawn,
  ActorRef,
  send,
} from "xstate";
import { assertEventType } from "./assert-event-type";
import { initialMapState, MapStyle } from "./constants";
import { createLayerMachine, LayerEvent } from "./layer-state-machine";
import mapbox from "./map-wrapper";
import { addDataLayer, DataLayer, removeDataLayer } from "./mapbox-helpers";

export type LayerRef = ActorRef<LayerEvent>;
type MapContext = {
  mapStyle: MapStyle;
  center: [number, number];
  zoom: number;
  layers: (DataLayer & { ref: LayerRef })[];
};

const { style, zoom, center } = initialMapState;
const context: MapContext = {
  mapStyle: style,
  center: center,
  zoom: zoom,
  layers: [],
};

export enum MapEventType {
  MAP_LOAD = "MAP_LOAD",
  ZOOM = "ZOOM",
  MOVE = "MOVE",
  CHANGE_STYLE = "CHANGE_STYLE",
  ADD_LAYER = "ADD_LAYER",
  DELETE_LAYER = "DELETE_LAYER",
}
type MapEvent =
  | { type: MapEventType.MAP_LOAD }
  | { type: MapEventType.ZOOM; zoom: number; isOriginal?: boolean }
  | { type: MapEventType.MOVE; center: [number, number]; isOriginal?: boolean }
  | { type: MapEventType.CHANGE_STYLE; mapStyle: MapStyle }
  | { type: MapEventType.ADD_LAYER; layer: DataLayer }
  | { type: MapEventType.DELETE_LAYER; id: string };

type MapState =
  | { value: "loading"; context: MapContext }
  | { value: "addingLayer"; context: MapContext }
  | { value: "ready"; context: MapContext };

const handleSyncMapEvents = (_ctx: MapContext, event: MapEvent) => {
  assertEventType(event, MapEventType.MAP_LOAD);

  mapbox.map.on("zoomend", () => {
    send({
      type: MapEventType.ZOOM,
      zoom: +mapbox.map.getZoom().toFixed(2),
      isOriginal: true,
    });
  });
  mapbox.map.on("moveend", () => {
    send({
      type: MapEventType.MOVE,
      center: [
        +mapbox.map.getCenter().lng.toFixed(4),
        +mapbox.map.getCenter().lat.toFixed(4),
      ],
      isOriginal: true,
    });
  });
};

const handleZoomChange = assign<MapContext, MapEvent>({
  zoom: (_ctx, event) => {
    assertEventType(event, MapEventType.ZOOM);

    if (!event.isOriginal) mapbox.map.setZoom(event.zoom);
    return event.zoom;
  },
});

const handleCenterChange = assign<MapContext, MapEvent>({
  center: (_ctx, event) => {
    assertEventType(event, MapEventType.MOVE);

    if (!event.isOriginal) mapbox.map.setCenter(event.center);
    return event.center;
  },
});

const handleChangeMapStyle = assign<MapContext, MapEvent>({
  mapStyle: (_ctx, event) => {
    assertEventType(event, MapEventType.CHANGE_STYLE);

    mapbox.map.once("styledata", () => {
      _ctx.layers.forEach((layer) => addDataLayer(mapbox.map, layer));
    });
    mapbox.map.setStyle(event.mapStyle.url);

    return event.mapStyle;
  },
});

const handleAddDataLayer = assign<MapContext, MapEvent>({
  layers: (_ctx, event) => {
    assertEventType(event, MapEventType.ADD_LAYER);

    addDataLayer(mapbox.map, event.layer);

    const newLayer = { ...event.layer };
    if (newLayer.name === "") newLayer.name = `layer-${_ctx.layers.length + 1}`;

    return _ctx.layers.concat({
      ...newLayer,
      ref: spawn(createLayerMachine(newLayer)),
    });
  },
});

const handleDeleteDataLayer = assign<MapContext, MapEvent>({
  layers: (_ctx, event) => {
    assertEventType(event, MapEventType.DELETE_LAYER);

    removeDataLayer(mapbox.map, event.id);

    console.log(_ctx.layers);

    return [..._ctx.layers].filter((layer) => layer.id !== event.id);
  },
});

const mapMachine = createMachine<MapContext, MapEvent, MapState>(
  {
    id: "map",
    initial: "loading",
    context,
    states: {
      loading: {
        on: {
          MAP_LOAD: { target: "ready", actions: ["handleSyncMapEvents"] },
        },
      },
      ready: {
        on: {
          ZOOM: { actions: ["handleZoomChange"], internal: true },
          MOVE: { actions: ["handleCenterChange"], internal: true },
          CHANGE_STYLE: { actions: ["handleChangeMapStyle"], internal: true },
          ADD_LAYER: { actions: ["handleAddDataLayer"], internal: true },
          DELETE_LAYER: { actions: ["handleDeleteDataLayer"], internal: true },
        },
      },
    },
  },
  {
    actions: {
      handleZoomChange,
      handleCenterChange,
      handleChangeMapStyle,
      handleAddDataLayer,
      handleDeleteDataLayer,
      handleSyncMapEvents,
    },
  }
);

export const mapService = interpret(mapMachine, { devTools: true });
mapService.start();

// mapService.onTransition(console.log);
// mapService.onEvent(console.log);
// mapService.onChange(console.log);
