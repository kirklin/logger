import type { LogObject } from "../types";

export interface Transport {
  log: (logObject: LogObject) => void;
}
