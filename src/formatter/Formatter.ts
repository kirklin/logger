import { Field } from "../Field";
import type { Argument } from "../types";
import type { Level } from "../Level";
import type { MessageFormat } from "./MessageFormat";

/**
 * Abstract formatter for log entry
 */
export abstract class Formatter {
  private message: MessageFormat;

  private readonly minimumTagWidth = 5;

  protected constructor(
    private readonly formatType: string = "%s",
    private readonly useColors: boolean = true,
  ) {
    this.message = { format: "", args: [], fields: [] };
  }

  /**
   * Add tag
   */
  public tag(name: string, color: string): void {
    let spaced = name;
    for (let i = name.length; i < this.minimumTagWidth; ++i) {
      spaced += " ";
    }
    this.push(`${spaced} `, color);
  }

  /**
   * Add field or argument
   */
  public push(fields: Field<Argument>[]): void;
  public push(arg: Argument, color?: string, weight?: string): void;
  public push(arg: Argument | Field<Argument>[], color?: string, weight?: string): void {
    if (Array.isArray(arg) && arg.every(a => a instanceof Field)) {
      this.message.fields.push(...arg);
      return;
    }
    if (this.useColors && (color || weight)) {
      this.message.format += `${this.formatType}${this.getType(arg)}${this.formatType}`;
      this.message.args.push(this.style(color, weight), arg, this.reset());
    } else {
      this.message.format += `${this.getType(arg)}`;
      this.message.args.push(arg);
    }
  }

  /**
   * Write log entry
   */
  public write(level: Level): void {
    const message = this.flush();
    this.doWrite(level, message);
  }

  /**
   * Reset state and return message
   */
  protected flush(): MessageFormat {
    const message = this.message;
    this.message = { format: "", args: [], fields: [] };
    return message;
  }

  /**
   * Return string with style
   */
  protected abstract style(color?: string, weight?: string): string;

  /**
   * Return string to reset style
   */
  protected abstract reset(): string;

  /**
   * Write log entry
   */
  protected abstract doWrite(level: Level, message: MessageFormat): void;

  /**
   * Return format string based on argument type
   */
  private getType(arg: Argument): string {
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
