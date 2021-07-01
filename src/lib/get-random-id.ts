import crypto from "crypto";

export function randomID() {
  return crypto.randomBytes(3).toString("hex");
}
