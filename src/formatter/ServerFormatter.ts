import type { Level } from "../Level";
import type { Argument } from "../types";
import type { MessageFormat } from "./MessageFormat";
import { doLog } from "../utils";
import { Formatter } from "./Formatter";

/**
 * Display logs on the command line using ANSI color codes. Fields are displayed
 * in a single stringified object inline.
 */
export class ServerFormatter extends Formatter {
  public constructor() {
    super("%s", !!process.stdout.isTTY);
  }

  protected style(color?: string, weight?: string): string {
    return (weight === "bold" ? "\u001B[1m" : "") + (color ? this.hex(color) : "");
  }

  protected reset(): string {
    return "\u001B[0m";
  }

  private hex(hex: string): string {
    const [r, g, b] = this.hexToRgb(hex);
    return `\u001B[38;2;${r};${g};${b}m`;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const integer = Number.parseInt(hex.substring(1), 16);
    return [(integer >> 16) & 0xFF, (integer >> 8) & 0xFF, integer & 0xFF];
  }

  protected doWrite(level: Level, message: MessageFormat): void {
    if (message.fields.length === 0) {
      return doLog(level, `[%s] ${message.format}`, new Date().toISOString(), ...message.args);
    }
    const obj: { [key: string]: Argument } = {};
    message.fields.forEach(field => (obj[field.identifier] = field.value));
    doLog(
      level,
      `[%s] ${message.format} %s%s%s`,
      new Date().toISOString(),
      ...message.args,
      this.style("#8c8c8c"),
      JSON.stringify(obj),
      this.reset(),
    );
  }
}
