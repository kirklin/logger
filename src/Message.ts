import type { FieldArray, LogCallback } from "./types";
import type { Level } from "./Level";

/**
 * Represents a log message, its fields, level, and color.
 */
export interface Message {
  message: string | LogCallback;
  fields?: FieldArray;
  level: Level;
  tagColor: string;
}

/**
 * An extra function to call with a message.
 */
export type Extender = (msg: Message & { section?: string }) => void;
