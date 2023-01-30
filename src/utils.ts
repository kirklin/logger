import { Level } from "./Level";
import type { Argument } from "./types";

export function doLog(level: Level, ...args: Argument): void {
  switch (level) {
    case Level.Trace:
      return console.trace(...args);
    case Level.Debug:
      return console.debug(...args);
    case Level.Info:
      return console.info(...args);
    case Level.Warn:
      return console.warn(...args);
    case Level.Error:
      return console.error(...args);
  }
}
