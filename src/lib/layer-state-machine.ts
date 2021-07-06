import {
  createMachine,
  assign,
  sendParent,
  StateMachine,
  DoneInvokeEvent,
} from "xstate";
import { assertEventType } from "./assert-event-type";
import { DataLayer } from "./mapbox-helpers";
import mapbox from "./map-wrapper";

type TileJSON = {
  tilejson?: string;
  name?: string;
  description?: string;
  version?: string;
  attribution?: string;
  scheme: "xyz" | "tms";
  tiles: string[];
  minzoom: number;
  maxzoom: number;
  bounds: [number, number, number, number];
};

type LayerContext = {
  opacity: number;
  visible: boolean;
  tilejson?: TileJSON;
} & DataLayer;

type LayerState =
  | { value: "created"; context: LayerContext }
  | { value: "loading"; context: LayerContext }
  | { value: "ready"; context: LayerContext };

export enum LayerEventType {
  HIDE = "HIDE",
  DELETE = "DELETE",
  TOGGLE_VISIBILITY = "TOGGLE_VISIBILITY",
}
export type LayerEvent =
  | { type: LayerEventType.DELETE }
  | { type: LayerEventType.TOGGLE_VISIBILITY }
  | { type: LayerEventType.HIDE };

export const createLayerMachine = (
  layer: DataLayer
): StateMachine<LayerContext, LayerState, LayerEvent> =>
  createMachine<LayerContext, LayerEvent, LayerState>(
    {
      id: "layer",
      initial: "created",
      context: {
        ...layer,
        opacity: 1,
        visible: true,
      },
      on: { DELETE: "deleted" },
      states: {
        created: {
          always: [
            { target: "loading", cond: "isTilejsonUrl" },
            { target: "ready" },
          ],
        },
        loading: {
          invoke: {
            id: "fetchTilejson",
            src: (_ctx) => fetchTilejson(_ctx.url),
            onDone: {
              target: "ready",
              actions: [
                assign({
                  tilejson: (_ctx, event: DoneInvokeEvent<TileJSON>) => {
                    fitBounds(event.data);
                    return event.data;
                  },
                }),
              ],
            },
          },
        },
        ready: {
          on: {
            TOGGLE_VISIBILITY: {
              target: "ready",
              actions: ["handleTogleVisibility"],
            },
          },
        },
        deleted: {
          onEntry: sendParent((context) => ({
            type: "DELETE_LAYER",
            id: context.id,
          })),
        },
      },
    },
    {
      actions: { handleTogleVisibility },
      guards: { isTilejsonUrl },
    }
  );

async function fetchTilejson(url: string): Promise<TileJSON> {
  const response = await fetch(url);
  return await response.json();
}

const isTilejsonUrl = (_ctx: LayerContext) => _ctx.urlType === "tilejson";

const handleTogleVisibility = assign<LayerContext, LayerEvent>({
  visible: (_ctx, event) => {
    assertEventType(event, LayerEventType.TOGGLE_VISIBILITY);

    return !_ctx.visible;
  },
});

const fitBounds = (tilejson: TileJSON): void => {
  const bounds = tilejson?.bounds;

  if (!bounds) {
    console.error("Layer bounds was not found in tilejson", tilejson);
    return;
  }

  mapbox.map.fitBounds(bounds, { animate: false });
};
