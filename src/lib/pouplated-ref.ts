import type { PopulatedRef } from "@/api/types/results";

/** Returns the object if the ref came back populated, otherwise null. */
export function asPopulated<T>(ref: PopulatedRef<T>): (T & { _id: string }) | null {
  return typeof ref === "string" ? null : ref;
}

/** Returns a display id string regardless of whether the ref is populated. */
export function refId<T>(ref: PopulatedRef<T>): string {
  return typeof ref === "string" ? ref : ref._id;
}