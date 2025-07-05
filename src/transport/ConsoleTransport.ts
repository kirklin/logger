import type { Formatter } from "../formatter/Formatter";
import type { LogObject } from "../types";
import type { Transport } from "./Transport";
import { doLog } from "../utils";

export class ConsoleTransport implements Transport {
  constructor(private formatter: Formatter) {}

  public log(logObject: LogObject): void {
    const message = this.formatter.format(logObject);

    // In a browser, fields are displayed in a group, but only if there's a message.
    if (logObject.message && message.fields.length > 0 && typeof console.groupCollapsed === "function") {
      console.groupCollapsed(message.format, ...message.args);
      message.fields.forEach((item) => {
        // Handle Field instances
        if (item && typeof item === "object" && "identifier" in item && "value" in item) {
          const style = "color: #3794ff; font-weight: bold";
          let name = "";
          if (
            typeof item.value !== "undefined"
            && item.value.constructor
            && item.value.constructor.name
          ) {
            name = ` (${item.value.constructor.name})`;
          }
          doLog(logObject.level, `%c${item.identifier}%c${name}:`, style, "color: inherit", item.value);
        } else {
          // Handle raw objects
          doLog(logObject.level, item);
        }
      });
      console.groupEnd();
    } else {
      const finalArgs = [...message.args, ...message.fields];
      doLog(logObject.level, message.format, ...finalArgs);
    }
  }
}
