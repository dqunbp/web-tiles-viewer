import { EventObject, EventType } from "xstate";

export function assertEventType<E extends EventObject, T extends EventType>(
  event: E,
  eventType: T
): asserts event is E & { type: T } {
  if (event.type !== eventType)
    throw new Error(
      `Invalid event: expected "${eventType}", got "${event.type}"`
    );
}
