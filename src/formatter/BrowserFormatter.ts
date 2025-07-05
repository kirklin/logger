import type { Argument, LogObject } from "../types";
import type { MessageFormat } from "./MessageFormat";
import { Field } from "../Field";
import { Level } from "../Level";
import { Time } from "../Time";
import { Formatter } from "./Formatter";

/**
 * Display logs in the browser using CSS in the output. Fields are displayed on
 * individual lines within a group.
 */
export class BrowserFormatter extends Formatter {
  private readonly minimumTagWidth = 5;

  public constructor() {
    super("%c", true);
  }

  public format(logObject: LogObject): MessageFormat {
    const { level, message, args, date, name } = logObject;

    const messageFormat: MessageFormat = {
      format: "",
      args: [],
      fields: [], // Will be populated with actual Field instances for the transport
    };

    const push = (arg: Argument, color?: string, weight?: string) => {
      if (this.useColors && (color || weight)) {
        messageFormat.format += `%c${this.getType(arg)}%c`;
        messageFormat.args.push(this.style(color, weight), arg, this.reset());
      } else {
        messageFormat.format += `${this.getType(arg)}`;
        messageFormat.args.push(arg);
      }
    };

    const tag = (tagName: string, color: string) => {
      let spaced = tagName;
      for (let i = tagName.length; i < this.minimumTagWidth; ++i) {
        spaced += " ";
      }
      push(`${spaced} `, color);
    };

    // Level Tag
    tag(Level[level].toLowerCase(), this.getLevelColor(level));

    // Name Tag
    if (name) {
      tag(name, this.hashStringToColor(name));
    }

    // Message
    if (message) {
      push(message);
    }

    const now = date.getTime();
    const otherArgs: any[] = [];
    const fields: Field<any>[] = [];

    args.forEach((arg) => {
      if (arg instanceof Field) {
        fields.push(arg);
      } else {
        otherArgs.push(arg);
      }
    });

    const times = fields.filter((f): f is Field<Time> => f.value instanceof Time);

    // Pass other fields and args to the transport to be rendered in the group.
    messageFormat.fields = fields.filter(f => !(f.value instanceof Time)).concat(otherArgs);

    // Time Fields
    if (times.length > 0) {
      times.forEach((time) => {
        const diff = now - time.value.ms;
        const expPer = diff / time.value.expected;
        const min = 125 * (1 - expPer);
        const max = 125 + min;
        const green = expPer < 1 ? max : min;
        const red = expPer >= 1 ? max : min;
        push(` ${time.identifier}=`, "#3390ff");
        push(`${diff}ms`, this.rgbToHex(red > 0 ? red : 0, green > 0 ? green : 0, 0));
      });
    }

    return messageFormat;
  }

  protected style(color?: string, weight?: string): string {
    return (color ? `color: ${color};` : "") + (weight ? `font-weight: ${weight};` : "");
  }

  protected reset(): string {
    return this.style("inherit", "normal");
  }

  private getLevelColor(level: Level): string {
    switch (level) {
      case Level.Trace:
        return "#9e9e9e";
      case Level.Debug:
        return "#ffb8da";
      case Level.Info:
        return "#66ccff";
      case Level.Warn:
        return "#ffae00";
      case Level.Error:
        return "#ff0000";
      default:
        return "#ffffff";
    }
  }

  private djb2(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const integer
      = ((Math.round(r) & 0xFF) << 16)
        + ((Math.round(g) & 0xFF) << 8)
        + (Math.round(b) & 0xFF);
    const str = integer.toString(16);
    return `#${"000000".substring(str.length)}${str}`;
  }

  private hashStringToColor(str: string): string {
    const hash = this.djb2(str);
    return this.rgbToHex(
      (hash & 0xFF0000) >> 16,
      (hash & 0x00FF00) >> 8,
      hash & 0x0000FF,
    );
  }
}
