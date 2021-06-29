import {
  createMachine,
  assign,
  interpret,
  EventObject,
  AssignAction,
} from "xstate";
import { initialMapState, MapStyle } from "./constants";
import mapbox from "./map-wrapper";

type Context = {
  mapStyle: MapStyle;
  center: [number, number];
  zoom: number;
};

const { style, zoom, center } = initialMapState;
const context: Context = {
  mapStyle: style,
  center: center,
  zoom: zoom,
};

export enum EventType {
  ZOOM = "ZOOM",
  MOVE = "MOVE",
  CHANGE_STYLE = "CHANGE_STYLE",
}
type Event =
  | { type: EventType.ZOOM; zoom: number; isOriginal?: boolean }
  | { type: EventType.MOVE; center: [number, number]; isOriginal?: boolean }
  | { type: EventType.CHANGE_STYLE; mapStyle: MapStyle };

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

    return event.mapStyle;
  },
});

const stateMachine = createMachine<Context, Event, State>(config, {
  actions: { handleZoomChange, handleCenterChange, handleChangeMapStyle },
});

export const stateService = interpret(stateMachine);
stateService.start();

stateService.onChange(console.log);
