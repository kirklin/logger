import type { Field } from "./Field";
import type { Extender, Message } from "./Message";
import type { Transport } from "./transport/Transport";
import type { Argument, FieldArray, LogCallback, LogObject } from "./types";
import { field } from "./Field";
import { BrowserFormatter } from "./formatter/BrowserFormatter";
import { ServerFormatter } from "./formatter/ServerFormatter";
import { Level } from "./Level";
import { ConsoleTransport } from "./transport/ConsoleTransport";

export class Logger {
  public level = Level.Info;
  public throttle = 1000;
  public throttleMin = 5;
  public transports: Transport[] = [];

  private readonly nameColor?: string;
  private muted = false;
  private _lastLog: {
    message?: Message;
    serialized?: string;
    count?: number;
    time?: Date;
    timeout?: ReturnType<typeof setTimeout>;
  } = {};

  public constructor(
    transports: Transport[],
    private readonly name?: string,
    private readonly defaultFields?: FieldArray,
    private readonly extenders: Extender[] = [],
  ) {
    this.transports = transports;
    if (name) {
      this.nameColor = this.hashStringToColor(name);
    }
    if (typeof process !== "undefined" && typeof process.env !== "undefined") {
      switch (process.env.LOG_LEVEL) {
        case "trace":
          this.level = Level.Trace;
          break;
        case "debug":
          this.level = Level.Debug;
          break;
        case "info":
          this.level = Level.Info;
          break;
        case "warn":
          this.level = Level.Warn;
          break;
        case "error":
          this.level = Level.Error;
          break;
      }
    }
  }

  /**
   * Suppresses all output
   */
  public mute(): void {
    this.muted = true;
  }

  public extend(extender: Extender): void {
    this.extenders.push(extender);
  }

  public info(fn: LogCallback): void;
  public info(message: string, ...fields: FieldArray): void;
  public info(message: LogCallback | string, ...fields: FieldArray): void {
    this.handle({
      message,
      fields,
      level: Level.Info,
    });
  }

  public warn(fn: LogCallback): void;
  public warn(message: string, ...fields: FieldArray): void;
  public warn(message: LogCallback | string, ...fields: FieldArray): void {
    this.handle({
      message,
      fields,
      level: Level.Warn,
    });
  }

  public trace(fn: LogCallback): void;
  public trace(message: string, ...fields: FieldArray): void;
  public trace(message: LogCallback | string, ...fields: FieldArray): void {
    this.handle({
      message,
      fields,
      level: Level.Trace,
    });
  }

  public debug(fn: LogCallback): void;
  public debug(message: string, ...fields: FieldArray): void;
  public debug(message: LogCallback | string, ...fields: FieldArray): void {
    this.handle({
      message,
      fields,
      level: Level.Debug,
    });
  }

  public error(fn: LogCallback): void;
  public error(message: string, ...fields: FieldArray): void;
  public error(message: LogCallback | string, ...fields: FieldArray): void {
    this.handle({
      message,
      fields,
      level: Level.Error,
    });
  }

  /**
   * Returns a sub-logger with a name.
   * Each name is deterministically generated a color.
   */
  public named(name: string, ...fields: FieldArray): Logger {
    const l = new Logger(this.transports, name, fields, this.extenders);
    if (this.muted) {
      l.mute();
    }
    return l;
  }

  private _log(message: Message) {
    let passedFields = message.fields || [];
    if (typeof message.message === "function") {
      const values = message.message();
      message.message = values.shift() as string;
      passedFields = values as FieldArray;
    }

    const fields = (
      this.defaultFields
        ? passedFields.concat(this.defaultFields)
        : passedFields
    ).filter((f): f is Field<Argument> => !!f);

    const logObject: LogObject = {
      level: message.level,
      message: message.message,
      fields,
      date: new Date(),
      name: this.name,
    };

    for (const transport of this.transports) {
      transport.log(logObject);
    }

    this.extenders.forEach((extender) => {
      extender({
        section: this.name,
        ...message,
      });
    });
  }

  private handle(message: Message): void {
    if (this.level > message.level || this.muted) {
      return;
    }

    const resolveLog = (newLog = false) => {
      const repeated = (this._lastLog.count || 0) - this.throttleMin;
      if (this._lastLog.message && repeated > 0) {
        const lastMessage = this._lastLog.message;
        const fields = lastMessage.fields || [];
        if (repeated > 1) {
          fields.push(field("repeated", `${repeated} times`));
        }
        this._log({ ...lastMessage, fields });
        this._lastLog.count = 1;
      }

      if (newLog) {
        this._lastLog.message = message;
        this._log(message);
      }
    };

    clearTimeout(this._lastLog.timeout);
    const now = new Date();
    const diffTime = this._lastLog.time ? now.getTime() - this._lastLog.time.getTime() : 0;
    this._lastLog.time = now;

    if (diffTime < this.throttle) {
      try {
        const serializedLog = JSON.stringify([message.message, message.fields]);
        const isSameLog = this._lastLog.serialized === serializedLog;
        this._lastLog.serialized = serializedLog;
        if (isSameLog) {
          this._lastLog.count = (this._lastLog.count || 0) + 1;
          if (this._lastLog.count > this.throttleMin) {
            this._lastLog.timeout = setTimeout(resolveLog, this.throttle);
            return;
          }
        }
      } catch {
        // Circular References
      }
    }

    resolveLog(true);
  }

  /**
   * Hashes a string.
   */
  private djb2(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const integer
      = ((Math.round(r) & 0xFF) << 16) + ((Math.round(g) & 0xFF) << 8) + (Math.round(b) & 0xFF);
    const str = integer.toString(16);
    return `#${"000000".substring(str.length)}${str}`;
  }

  /**
   * Generates a deterministic color from a string using hashing.
   */
  private hashStringToColor(str: string): string {
    const hash = this.djb2(str);
    return this.rgbToHex((hash & 0xFF0000) >> 16, (hash & 0x00FF00) >> 8, hash & 0x0000FF);
  }
}

export const logger = new Logger([
  new ConsoleTransport(
    typeof process === "undefined" || typeof process.stdout === "undefined"
      ? new BrowserFormatter()
      : new ServerFormatter(),
  ),
]);
