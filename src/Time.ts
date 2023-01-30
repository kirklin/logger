/**
 * A time field.
 */
export class Time {
  public constructor(public readonly expected: number, public readonly ms: number) {}
}

/**
 * Log how long something took. Call this before doing the thing then pass it
 * into the logger after finished to log the time it took.
 */
export const time = (expected: number): Time => {
  return new Time(expected, Date.now());
};
