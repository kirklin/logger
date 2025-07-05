import type { Formatter } from "../formatter/Formatter";
import type { LogObject } from "../types";
import type { Transport } from "./Transport";
import { doLog } from "../utils";

export class ConsoleTransport implements Transport {
  constructor(private formatter: Formatter) {}

  public log(logObject: LogObject): void {
    const message = this.formatter.format(logObject);

    // In a browser, fields are displayed in a group.
    if (message.fields.length > 0 && typeof console.groupCollapsed === "function") {
      console.groupCollapsed(message.format, ...message.args);
      message.fields.forEach((field) => {
        const style = "color: #3794ff; font-weight: bold";
        let name = "";
        if (
          typeof field.value !== "undefined"
          && field.value.constructor
          && field.value.constructor.name
        ) {
          name = ` (${field.value.constructor.name})`;
        }
        doLog(logObject.level, `%c${field.identifier}%c${name}:`, style, "color: inherit", field.value);
      });
      console.groupEnd();
    } else {
      doLog(logObject.level, message.format, ...message.args);
    }
  }
}
