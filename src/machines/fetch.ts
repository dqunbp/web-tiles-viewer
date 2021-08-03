import { createMachine, assign, DoneInvokeEvent } from "xstate";

interface FetchContext<T> {
  data: T;
  message: string;
}

type FetchEvent = { type: "FETCH" };

export const createFetchMachine = <T>(initialResult: T) =>
  createMachine<FetchContext<T>, FetchEvent>({
    id: "fetchMachine",
    context: {
      data: initialResult,
      message: "",
    },
    states: {
      idle: { on: { FETCH: "pending" } },
      pending: {
        invoke: {
          src: "fetchData",
          onDone: {
            target: "successful",
            actions: assign((_ctx, event: DoneInvokeEvent<T>) => ({
              data: event.data,
            })),
          },
          onError: {
            target: "failed",
            actions: assign((_ctx, event: DoneInvokeEvent<string>) => ({
              message: event.data,
            })),
          },
        },
      },
      successful: { on: { FETCH: "pending" } },
      failed: { on: { FETCH: "pending" } },
    },
  });
