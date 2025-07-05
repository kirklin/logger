import type { Level } from "../Level";
import type { MessageFormat } from "./MessageFormat";
import { doLog } from "../utils";
import { Formatter } from "./Formatter";

/**
 * Display logs in the browser using CSS in the output. Fields are displayed on
 * individual lines within a group.
 */
export class BrowserFormatter extends Formatter {
  public constructor() {
    super("%c");
  }

  protected style(color?: string, weight?: string): string {
    return (color ? `color: ${color};` : "") + (weight ? `font-weight: ${weight};` : "");
  }

  protected reset(): string {
    return this.style("inherit", "normal");
  }

  public doWrite(level: Level, message: MessageFormat): void {
    console.groupCollapsed(message.format, ...message.args);
    message.fields.forEach((field) => {
      this.push(field.identifier, "#3794ff", "bold");
      if (
        typeof field.value !== "undefined"
        && field.value.constructor
        && field.value.constructor.name
      ) {
        this.push(` (${field.value.constructor.name})`);
      }
      this.push(": ");
      this.push(field.value);
      const m = this.flush();
      doLog(level, m.format, ...m.args);
    });
    console.groupEnd();
  }
}
