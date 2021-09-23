import { TileJSON } from "lib/constants";
import { fetchTilejson } from "lib/fetch-tilejson";
import { validate } from "tilejson-validator";
import { createMachine, assign, DoneInvokeEvent } from "xstate";

interface FetchTilejsonContext {
  url: string;
  tilejson: null | TileJSON;
}

type UrlChangeEvent = { type: "URL_CHANGE"; value: string };

/**
 * On url changed
 * 1. Validate url
 *  if valid go to (2)
 *  else show invalid url message
 * 2. Fetch tilejson
 *  if fetched go to (3)
 *  else show failed to fetch message
 * 3. Validate tilejson
 *  if valid show available layers
 *  else show invalid tilejson message
 */

export const fetchTilejsonMachine = createMachine<
  FetchTilejsonContext,
  UrlChangeEvent
>(
  {
    id: "tilejson",
    initial: "input",
    context: { url: "", tilejson: null },
    states: {
      input: {
        initial: "idle",
        states: {
          idle: {
            on: {
              URL_CHANGE: {
                target: "validating",
                actions: assign({ url: (_, event) => event.value }),
              },
            },
          },
          validating: {
            always: [
              { target: "valid", cond: "isUrlValid" },
              { target: "#tilejson.invalid.url" },
            ],
          },
          valid: { always: "#tilejson.fetching" },
        },
      },

      fetching: {
        invoke: {
          src: "fetchTilejson",
          onDone: {
            target: "#tilejson.validating",
            actions: assign((_, event: DoneInvokeEvent<TileJSON>) => ({
              tilejson: event.data,
            })),
          },
          onError: { target: "#tilejson.invalid.network" },
        },
      },
      validating: {
        always: [
          { target: "#tilejson.valid", cond: "isTilejsonValid" },
          { target: "#tilejson.invalid.tilejson" },
        ],
      },
      invalid: {
        on: {
          URL_CHANGE: {
            target: "input.validating",
            actions: assign({ url: (_, event) => event.value }),
          },
        },
        states: {
          url: {},
          network: {},
          tilejson: {},
        },
      },
      valid: {
        on: {
          URL_CHANGE: {
            target: "input.validating",
            actions: assign({ url: (_, event) => event.value }),
          },
        },
      },
    },
  },
  {
    guards: {
      isUrlValid: (_) => _.url.includes(".json"),
      isTilejsonValid: (_) => typeof _.tilejson === "object",
    },
    services: { fetchTilejson: (_) => fetchTilejson(_.url) },
  }
);
