import { createMachine, assign, sendParent } from "xstate";
import { addMapLayer, DataLayer, removeMapLayer } from "../lib/mapbox-helpers";
import mapbox from "../lib/map-wrapper";
import { MapEventType } from "./mapbox-map";
import { randomID } from "../lib/get-random-id";
import { mapUtils } from "../lib/mapbox-api-utils";
import { TileJSON } from "../lib/constants";

export type LayerContext = {
  data: DataLayer;
  opacity: number;
  visible: boolean;
  tilejson?: TileJSON;
};

type LayerState =
  | { value: "created"; context: LayerContext }
  | { value: "idle"; context: LayerContext }
  | { value: "deleted"; context: LayerContext };

export enum LayerEventType {
  HIDE = "HIDE",
  DELETE = "DELETE",
  DUPLICATE = "DUPLICATE",
  TOGGLE_VISIBILITY = "TOGGLE_VISIBILITY",
  MOVE_TO_TOP = "MOVE_TO_TOP",
  CHANGE_OPACITY = "CHANGE_OPACITY",
}
export type LayerEvent =
  | { type: LayerEventType.DELETE }
  | { type: LayerEventType.DUPLICATE }
  | { type: LayerEventType.MOVE_TO_TOP }
  | { type: LayerEventType.TOGGLE_VISIBILITY }
  | { type: LayerEventType.CHANGE_OPACITY; value: number };

export const createLayerMachine = (layer: DataLayer, tilejson?: TileJSON) =>
  createMachine<LayerContext, LayerEvent, LayerState>(
    {
      id: "layer",
      initial: "created",
      context: {
        data: layer,
        opacity: 1,
        visible: true,
        tilejson,
      },
      on: {
        DELETE: "deleted",
        DUPLICATE: {
          actions: sendParent((_ctx) => ({
            type: MapEventType.ADD_LAYER,
            tilejson: _ctx.tilejson,
            layer: {
              ..._ctx.data,
              id: randomID(),
              name: `${_ctx.data.name}-copy`,
            },
          })),
        },
        MOVE_TO_TOP: {
          actions: [
            (_ctx) => mapbox.map.moveLayer(_ctx.data.id),
            sendParent((_ctx) => ({
              type: MapEventType.MOVE_TO_TOP_LAYER,
              id: _ctx.data.id,
            })),
          ],
        },
      },
      states: {
        created: {
          entry: (_ctx) => {
            addMapLayer(mapbox.map, _ctx.data);
          },
          always: [
            { target: "fitting", cond: "isTilejsonUrl" },
            { target: "idle" },
          ],
        },
        fitting: {
          always: {
            target: "idle",
            actions: (_ctx) => fitBounds(_ctx.tilejson!),
          },
        },
        idle: {
          on: {
            CHANGE_OPACITY: {
              actions: [
                assign({ opacity: (_ctx, event) => event.value }),
                (_ctx, event) =>
                  mapUtils(mapbox.map)
                    .getLayer(_ctx.data.id)
                    .setOpacity(event.value),
              ],
            },
            TOGGLE_VISIBILITY: {
              actions: [
                assign({ visible: (_ctx) => !_ctx.visible }),
                (_ctx) =>
                  mapUtils(mapbox.map)
                    .getLayer(_ctx.data.id)
                    .toggleVisibility(),
              ],
            },
          },
        },
        deleted: {
          type: "final",
          entry: [
            (_ctx) => removeMapLayer(mapbox.map, _ctx.data.id),
            sendParent((_ctx) => ({
              type: MapEventType.DELETE_LAYER,
              id: _ctx.data.id,
            })),
          ],
        },
      },
    },
    {
      guards: {
        isTilejsonUrl: (_ctx: LayerContext) => _ctx.data.urlType === "tilejson",
      },
    }
  );

const fitBounds = (tilejson: TileJSON): void => {
  console.log({ tilejson });

  const bounds = tilejson?.bounds;

  if (!bounds) {
    console.error("Layer bounds was not found in tilejson", tilejson);
    return;
  }

  mapbox.map.fitBounds(bounds, { animate: false });
};
