import type { Argument, LogObject } from "../types";
import type { MessageFormat } from "./MessageFormat";

/**
 * Abstract formatter for log entry.
 * It is responsible for transforming a LogObject into a MessageFormat.
 */
export abstract class Formatter {
  protected constructor(
    protected readonly formatType: string = "%s",
    protected readonly useColors: boolean = true,
  ) {}

  /**
   * Formats a log object into a message format.
   */
  public abstract format(logObject: LogObject): MessageFormat;

  /**
   * Returns a string with style.
   */
  protected abstract style(color?: string, weight?: string): string;

  /**
   * Returns a string to reset style.
   */
  protected abstract reset(): string;

  /**
   * Returns a format string based on the argument type.
   */
  protected getType(arg: Argument): string {
    switch (typeof arg) {
      case "object":
        return "%o";
      case "number":
        return "%d";
      default:
        return "%s";
    }
  }
}
