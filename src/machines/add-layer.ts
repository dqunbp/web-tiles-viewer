import { LayerType, UrlType } from "lib/constants";
import { createMachine, assign } from "xstate";

interface Inputs {
  layerType: LayerType;
  urlType: UrlType;
  url: string;
  name: string;
  sourceLayer: string;
}

type Errors = Record<keyof Inputs, string>;

type Context = Inputs & { errors: Partial<Errors> };

enum AddLayerEventType {
  CHANGE_LAYER_TYPE = "CHANGE_LAYER_TYPE",
  CHANGE_URL_TYPE = "CHANGE_URL_TYPE",
  CHANGE_NAME = "CHANGE_NAME",
  CHANGE_URL = "CHANGE_URL",
  CHANGE_SOURCE_LAYER = "CHANGE_SOURCE_LAYER",
  SUBMIT = "SUBMIT",
}

type AddLayerEvent =
  | { type: AddLayerEventType.CHANGE_LAYER_TYPE; value: LayerType }
  | { type: AddLayerEventType.CHANGE_URL_TYPE; value: UrlType }
  | { type: AddLayerEventType.CHANGE_NAME; value: string }
  | { type: AddLayerEventType.CHANGE_URL; value: string }
  | { type: AddLayerEventType.CHANGE_SOURCE_LAYER; value: string }
  | { type: AddLayerEventType.SUBMIT };

export const addLayerMachine = createMachine<Context, AddLayerEvent>({
  id: "addLayerMachine",
  initial: "editing",
  context: {
    layerType: "raster",
    urlType: "xyz",
    name: "",
    url: "",
    sourceLayer: "",
    errors: {},
  },

  states: {
    editing: {
      initial: "idle",
      states: {
        idle: {},
        invalid: {},
      },
      on: {
        CHANGE_SOURCE_LAYER: {
          target: ".idle",
          actions: assign({ sourceLayer: (_ctx, event) => event.value }),
        },
        CHANGE_URL: {
          target: ".idle",
          actions: assign({ url: (_ctx, event) => event.value }),
        },
        CHANGE_NAME: {
          target: ".idle",
          actions: assign({ name: (_ctx, event) => event.value }),
        },
        CHANGE_URL_TYPE: {
          target: ".idle",
          actions: assign({ urlType: (_ctx, event) => event.value }),
        },
        CHANGE_LAYER_TYPE: {
          target: ".idle",
          actions: assign({ layerType: (_ctx, event) => event.value }),
        },
        SUBMIT: "validating",
      },
    },
    validating: {
      invoke: {
        src: "validate",
        onDone: "validated",
        onError: {
          target: "editing.invalid",
          actions: assign({ errors: (_ctx, event) => event.data }),
        },
      },
    },
    validated: {
      entry: "submit",
      type: "final",
    },
  },
});
