import { createMachine, assign, interpret, spawn, ActorRef } from "xstate";
import { assertEventType } from "./assert-event-type";
import { MapStyle, MapStyleId } from "./constants";
import { createLayerMachine, LayerEvent } from "./layer-state-machine";
import mapbox from "./map-wrapper";
import { addMapLayer, DataLayer } from "./mapbox-helpers";

export type LayerRef = ActorRef<LayerEvent>;

type MapCenter = [string, string];

export type MapContext = {
  style: MapStyle;
  center: MapCenter;
  zoom: string;
  layers: (DataLayer & { ref: LayerRef })[];
};

export enum MapEventType {
  LOAD = "LOAD",
  MOVE = "MOVE",
  SET_CENTER = "SET_CENTER",
  SET_ZOOM = "SET_ZOOM",
  CHANGE_STYLE = "CHANGE_STYLE",
  ADD_LAYER = "ADD_LAYER",
  DELETE_LAYER = "DELETE_LAYER",
  DUPLICATE_LAYER = "DUPLICATE_LAYER",
  MOVE_TO_TOP_LAYER = "MOVE_TO_TOP_LAYER",
}

export type MapEvent =
  | { type: MapEventType.LOAD }
  | { type: MapEventType.MOVE; center: [string, string]; zoom: string }
  | { type: MapEventType.SET_CENTER; center: [string, string] }
  | { type: MapEventType.SET_ZOOM; zoom: string }
  | { type: MapEventType.CHANGE_STYLE; style: MapStyle }
  | { type: MapEventType.ADD_LAYER; layer: DataLayer }
  | { type: MapEventType.DELETE_LAYER; id: string }
  | { type: MapEventType.MOVE_TO_TOP_LAYER; id: string }
  | { type: MapEventType.DUPLICATE_LAYER; id: string };

const mapContext: MapContext = {
  style: {
    id: MapStyleId.SATELLITE,
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  center: ["-74.4512", "40.0204"],
  zoom: "8",
  layers: [],
};

const setCenter = assign<MapContext, MapEvent>((_ctx, event) => {
  assertEventType(event, MapEventType.SET_CENTER);

  const [lng, lat] = event.center;

  mapbox.map.setCenter([+lat, +lng]);

  return { center: event.center };
});

const setZoom = assign<MapContext, MapEvent>((_ctx, event) => {
  assertEventType(event, MapEventType.SET_ZOOM);

  mapbox.map.setZoom(+event.zoom);

  return { zoom: event.zoom };
});

const updateViewport = assign<MapContext, MapEvent>((_ctx, event) => {
  assertEventType(event, MapEventType.MOVE);
  return { center: event.center, zoom: event.zoom };
});

const changeStyle = assign<MapContext, MapEvent>((_ctx, event) => {
  assertEventType(event, MapEventType.CHANGE_STYLE);

  mapbox.map.once("styledata", () => {
    _ctx.layers.forEach((layer) => addMapLayer(mapbox.map, layer));
  });
  mapbox.map.setStyle(event.style.url);

  return { style: event.style };
});

const deleteLayer = assign<MapContext, MapEvent>({
  layers: (_ctx, event) => {
    assertEventType(event, MapEventType.DELETE_LAYER);

    return [..._ctx.layers].filter((layer) => layer.id !== event.id);
  },
});

const moveToTopLayer = assign<MapContext, MapEvent>({
  layers: (_ctx, event) => {
    assertEventType(event, MapEventType.MOVE_TO_TOP_LAYER);

    return [
      ..._ctx.layers.filter((layer) => layer.id === event.id),
      ..._ctx.layers.filter((layer) => layer.id !== event.id),
    ];
  },
});

const addLayer = assign<MapContext, MapEvent>({
  layers: (_ctx, event) => {
    assertEventType(event, MapEventType.ADD_LAYER);

    const newLayer = {
      ...event.layer,
      name:
        event.layer.name === ""
          ? `layer-${_ctx.layers.length + 1}`
          : event.layer.name,
    };

    return [
      { ...newLayer, ref: spawn(createLayerMachine(newLayer)) },
      ..._ctx.layers,
    ];
  },
});

const mapMachine = createMachine<MapContext, MapEvent>(
  {
    id: "map",
    initial: "loading",
    context: mapContext,
    states: {
      loading: {
        on: {
          LOAD: { target: "idle", actions: [] },
        },
      },
      idle: {
        on: {
          CHANGE_STYLE: { actions: ["changeStyle"] },
          MOVE: { actions: ["updateViewport"] },
          ADD_LAYER: { actions: ["addLayer"] },
          DELETE_LAYER: { actions: ["deleteLayer"] },
          MOVE_TO_TOP_LAYER: { actions: ["moveToTopLayer"] },
          SET_CENTER: { actions: ["setCenter"] },
          SET_ZOOM: { actions: ["setZoom"] },
        },
      },
    },
  },
  {
    actions: {
      updateViewport,
      changeStyle,
      addLayer,
      deleteLayer,
      moveToTopLayer,
      setCenter,
      setZoom,
    },
  }
);

export const mapService = interpret(mapMachine, {
  devTools: process.env.NODE_ENV !== "production",
});
