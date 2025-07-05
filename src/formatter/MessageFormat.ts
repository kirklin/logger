import type { Field } from "../Field";
import type { Argument } from "../types";

/**
 * Represents a message formatted for use with something like `console.log`.
 */
export interface MessageFormat {
  /**
   * For example, something like `[%s] %s`.
   */
  format: "";
  /**
   * The arguments that get applied to the format string.
   */
  args: string[];
  /**
   * The fields to add under the message.
   */
  fields: Field<Argument>[];
}
