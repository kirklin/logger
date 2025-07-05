import type { Level } from "./Level";

/**
 * Represents a log message, its fields, level, and color.
 */
export interface Message {
  level: Level;
  args: any[];
}

/**
 * An extra function to call with a message.
 */
export type Extender = (msg: Message & { section?: string }) => void;
