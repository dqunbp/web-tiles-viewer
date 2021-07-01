import {
  createMachine,
  assign,
  interpret,
  EventObject,
  AssignAction,
} from "xstate";
import { initialMapState, MapStyle } from "./constants";
import mapbox from "./map-wrapper";
import { addDataLayer, DataLayer } from "./mapbox-helpers";

type Context = {
  mapStyle: MapStyle;
  center: [number, number];
  zoom: number;
  layers: DataLayer[];
};

const { style, zoom, center } = initialMapState;
const context: Context = {
  mapStyle: style,
  center: center,
  zoom: zoom,
  layers: [],
};

export enum EventType {
  ZOOM = "ZOOM",
  MOVE = "MOVE",
  CHANGE_STYLE = "CHANGE_STYLE",
  ADD_LAYER = "ADD_LAYER",
}
type Event =
  | { type: EventType.ZOOM; zoom: number; isOriginal?: boolean }
  | { type: EventType.MOVE; center: [number, number]; isOriginal?: boolean }
  | { type: EventType.CHANGE_STYLE; mapStyle: MapStyle }
  | { type: EventType.ADD_LAYER; layer: DataLayer };

type State =
  | { value: "loading"; context: Context }
  | { value: "ready"; context: Context };

const config = {
  id: "web-map",
  initial: "ready",
  context,
  states: {
    loading: {},
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

    return [..._ctx.layers, event.layer];
  },
});

const stateMachine = createMachine<Context, Event, State>(config, {
  actions: {
    handleZoomChange,
    handleCenterChange,
    handleChangeMapStyle,
    handleAddDataLayer,
  },
});

export const stateService = interpret(stateMachine);
stateService.start();

// stateService.onChange(console.log);
