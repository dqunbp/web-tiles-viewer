import {
  createMachine,
  assign,
  interpret,
  EventObject,
  AssignAction,
  sendParent,
} from "xstate";
import { DataLayer } from "./mapbox-helpers";

type Context = {
  opacity: number;
} & DataLayer;

export enum LayerEventType {
  DELETE = "DELETE",
  SHOW = "SHOW",
  HIDE = "HIDE",
}
export type LayerEvent =
  | { type: LayerEventType.DELETE }
  | { type: LayerEventType.SHOW }
  | { type: LayerEventType.HIDE };

export const createLayerMachine = (layer: DataLayer) =>
  createMachine<Context, LayerEvent>({
    id: "layer",
    initial: "visible",
    context: {
      ...layer,
      opacity: 1,
    },
    on: {
      DELETE: "deleted",
    },
    states: {
      visible: {
        on: {
          HIDE: "invisible",
        },
      },
      invisible: {
        on: {
          SHOW: "visible",
        },
      },
      deleted: {
        onEntry: sendParent((context) => ({
          type: "DELETE_LAYER",
          id: context.id,
        })),
      },
    },
  });
