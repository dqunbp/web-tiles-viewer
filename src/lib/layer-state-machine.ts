import { createMachine, assign, sendParent, DoneInvokeEvent } from "xstate";
import { assertEventType } from "./assert-event-type";
import { DataLayer } from "./mapbox-helpers";
import mapbox from "./map-wrapper";
import { MapEventType } from "./map-state-machine";

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
  data: DataLayer;
  opacity: number;
  visible: boolean;
  tilejson?: TileJSON;
};

type LayerState =
  | { value: "created"; context: LayerContext }
  | { value: "loading"; context: LayerContext }
  | { value: "idle"; context: LayerContext }
  | { value: "deleted"; context: LayerContext };

export enum LayerEventType {
  HIDE = "HIDE",
  DELETE = "DELETE",
  DUPLICATE = "DUPLICATE",
  TOGGLE_VISIBILITY = "TOGGLE_VISIBILITY",
  MOVE_TO_TOP = "MOVE_TO_TOP",
}
export type LayerEvent =
  | { type: LayerEventType.DELETE }
  | { type: LayerEventType.DUPLICATE }
  | { type: LayerEventType.MOVE_TO_TOP }
  | { type: LayerEventType.TOGGLE_VISIBILITY };

export const createLayerMachine = (layer: DataLayer) =>
  createMachine<LayerContext, LayerEvent, LayerState>(
    {
      id: "layer",
      initial: "created",
      context: {
        data: layer,
        opacity: 1,
        visible: true,
      },
      on: {
        DELETE: ".deleted",
        DUPLICATE: {
          actions: sendParent((_ctx) => ({
            type: MapEventType.DUPLICATE_LAYER,
            id: _ctx.data.id,
          })),
        },
        MOVE_TO_TOP: {
          actions: sendParent((_ctx) => ({
            type: MapEventType.MOVE_TO_TOP_LAYER,
            id: _ctx.data.id,
          })),
        },
      },
      states: {
        created: {
          always: [
            { target: "loading", cond: "isTilejsonUrl" },
            { target: "idle" },
          ],
        },
        loading: {
          invoke: {
            id: "fetchTilejson",
            src: (_ctx) => fetchTilejson(_ctx.data.url),
            onDone: {
              target: "idle",
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
        idle: {
          on: {
            TOGGLE_VISIBILITY: {
              internal: true,
              actions: ["handleTogleVisibility"],
            },
          },
        },
        deleted: {
          type: "final",
          onEntry: sendParent((_ctx) => ({
            type: MapEventType.DELETE_LAYER,
            id: _ctx.data.id,
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

const isTilejsonUrl = (_ctx: LayerContext) => _ctx.data.urlType === "tilejson";

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
