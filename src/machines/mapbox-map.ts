import { createMachine, assign, interpret, spawn, ActorRef } from "xstate";
import { assertEventType } from "lib/assert-event-type";
import { MapStyle, MapStyleId, TileJSON } from "lib/constants";
import mapbox from "lib/map-wrapper";
import { addMapLayer, DataLayer } from "lib/mapbox-helpers";
import { createLayerMachine, LayerEvent } from "./layer";

export type LayerRef = ActorRef<LayerEvent>;

type MapCenter = [string, string];
type HydratedLayer = DataLayer & { ref: LayerRef };

export type MapContext = {
  style: MapStyle;
  center: MapCenter;
  zoom: string;
  layers: HydratedLayer[];
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
  PERSIST = "PERSIST",
}

export type MapEvent =
  | { type: MapEventType.LOAD }
  | { type: MapEventType.PERSIST }
  | { type: MapEventType.MOVE; center: [string, string]; zoom: string }
  | { type: MapEventType.SET_CENTER; center: [string, string] }
  | { type: MapEventType.SET_ZOOM; zoom: string }
  | { type: MapEventType.CHANGE_STYLE; style: MapStyle }
  | { type: MapEventType.ADD_LAYER; layer: DataLayer; tilejson?: TileJSON }
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
    _ctx.layers.reduceRight((layers, layer) => {
      addMapLayer(mapbox.map, layer);
      return layers;
    }, []);
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
      { ...newLayer, ref: spawn(createLayerMachine(newLayer, event.tilejson)) },
      ..._ctx.layers,
    ];
  },
});

const persist = () => {
  localStorage.setItem("state", JSON.stringify(mapService.state.context));
};

const reduceLayers = (acc: HydratedLayer[], layer: DataLayer) => [
  {
    ...layer,
    ref: spawn(createLayerMachine(layer)),
  },
  ...acc,
];

export const mapMachine = createMachine<MapContext, MapEvent>(
  {
    id: "map",
    initial: "loading",
    context: mapContext,
    on: { PERSIST: { actions: "persist" } },
    states: {
      loading: {
        on: {
          LOAD: {
            target: "idle",
            actions: [
              // rehydrate initial layers
              assign({
                layers: (_ctx) =>
                  _ctx.layers.reduceRight<HydratedLayer[]>(reduceLayers, []),
              }),
            ],
          },
        },
      },
      idle: {
        on: {
          CHANGE_STYLE: { actions: ["changeStyle", "persist"] },
          MOVE: { actions: ["updateViewport"] },
          ADD_LAYER: { actions: ["addLayer", "persist"] },
          DELETE_LAYER: { actions: ["deleteLayer", "persist"] },
          MOVE_TO_TOP_LAYER: { actions: ["moveToTopLayer", "persist"] },
          SET_CENTER: { actions: ["setCenter", "persist"] },
          SET_ZOOM: { actions: ["setZoom", "persist"] },
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
      persist,
    },
  }
);

export const mapService = interpret(mapMachine, {
  devTools: process.env.NODE_ENV !== "production",
});
