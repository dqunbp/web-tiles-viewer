import {
  createMachine,
  assign,
  interpret,
  EventObject,
  AssignAction,
  spawn,
  ActorRef,
} from "xstate";
import { initialMapState, MapStyle } from "./constants";
import { createLayerMachine, LayerEvent } from "./layer-state-machine";
import mapbox from "./map-wrapper";
import { addDataLayer, DataLayer, removeDataLayer } from "./mapbox-helpers";

export type LayerRef = ActorRef<LayerEvent>;
type Context = {
  mapStyle: MapStyle;
  center: [number, number];
  zoom: number;
  layers: (DataLayer & { ref: LayerRef })[];
};

const { style, zoom, center } = initialMapState;
const context: Context = {
  mapStyle: style,
  center: center,
  zoom: zoom,
  layers: [],
};

export enum EventType {
  MAP_LOAD = "MAP_LOAD",
  ZOOM = "ZOOM",
  MOVE = "MOVE",
  CHANGE_STYLE = "CHANGE_STYLE",
  ADD_LAYER = "ADD_LAYER",
  DELETE_LAYER = "DELETE_LAYER",
}
type Event =
  | { type: EventType.MAP_LOAD }
  | { type: EventType.ZOOM; zoom: number; isOriginal?: boolean }
  | { type: EventType.MOVE; center: [number, number]; isOriginal?: boolean }
  | { type: EventType.CHANGE_STYLE; mapStyle: MapStyle }
  | { type: EventType.ADD_LAYER; layer: DataLayer }
  | { type: EventType.DELETE_LAYER; id: string };

type State =
  | { value: "loading"; context: Context }
  | { value: "ready"; context: Context };

const appStateConfig = {
  id: "app",
  initial: "loading",
  context,
  states: {
    loading: {
      on: {
        MAP_LOAD: "ready",
      },
    },
    ready: {
      on: {
        ZOOM: {
          target: "ready",
          actions: ["handleZoomChange"],
        },
        MOVE: {
          target: "ready",
          actions: ["handleCenterChange"],
        },
        CHANGE_STYLE: {
          target: "ready",
          actions: ["handleChangeMapStyle"],
        },
        ADD_LAYER: {
          target: "ready",
          actions: ["handleAddDataLayer"],
        },
        DELETE_LAYER: {
          target: "ready",
          actions: ["handleDeleteDataLayer"],
        },
      },
    },
  },
};

function onBadEvent(expected: EventType, actual: EventType): never {
  throw new Error(`Invalid event: expected "${expected}", got "${actual}"`);
}

const handleZoomChange = assign<Context, Event>({
  zoom: (_ctx, event) => {
    if (event.type !== EventType.ZOOM) onBadEvent(EventType.ZOOM, event.type);

    if (!event.isOriginal) mapbox.map.setZoom(event.zoom);
    return event.zoom;
  },
});

const handleCenterChange = assign<Context, Event>({
  center: (_ctx, event) => {
    if (event.type !== EventType.MOVE) onBadEvent(EventType.MOVE, event.type);

    if (!event.isOriginal) mapbox.map.setCenter(event.center);
    return event.center;
  },
});

const handleChangeMapStyle = assign<Context, Event>({
  mapStyle: (_ctx, event) => {
    if (event.type !== EventType.CHANGE_STYLE)
      onBadEvent(EventType.CHANGE_STYLE, event.type);

    mapbox.map.once("styledata", () => {
      _ctx.layers.forEach((layer) => addDataLayer(mapbox.map, layer));
    });
    mapbox.map.setStyle(event.mapStyle.url);

    return event.mapStyle;
  },
});

const handleAddDataLayer = assign<Context, Event>({
  layers: (_ctx, event) => {
    if (event.type !== EventType.ADD_LAYER)
      onBadEvent(EventType.ADD_LAYER, event.type);

    addDataLayer(mapbox.map, event.layer);

    const newLayer = { ...event.layer };
    if (newLayer.name === "") newLayer.name = `layer-${_ctx.layers.length + 1}`;

    return _ctx.layers.concat({
      ...newLayer,
      ref: spawn(createLayerMachine(newLayer)),
    });
  },
});

const handleDeleteDataLayer = assign<Context, Event>({
  layers: (_ctx, event) => {
    if (event.type !== EventType.DELETE_LAYER)
      onBadEvent(EventType.DELETE_LAYER, event.type);

    removeDataLayer(mapbox.map, event.id);

    console.log(_ctx.layers);

    return [..._ctx.layers].filter((layer) => layer.id !== event.id);
  },
});

const appMachine = createMachine<Context, Event, State>(appStateConfig, {
  actions: {
    handleZoomChange,
    handleCenterChange,
    handleChangeMapStyle,
    handleAddDataLayer,
    handleDeleteDataLayer,
  },
});

export const stateService = interpret(appMachine, { devTools: true });
stateService.start();

stateService.onTransition(console.log);
stateService.onEvent(console.log);
stateService.onChange(console.log);
