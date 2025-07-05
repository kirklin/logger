import type { Level } from "./Level";
import type { FieldArray, LogCallback } from "./types";

/**
 * Represents a log message, its fields, level, and color.
 */
export interface Message {
  message: string | LogCallback;
  fields?: FieldArray;
  level: Level;
}

/**
 * An extra function to call with a message.
 */
export type Extender = (msg: Message & { section?: string }) => void;
