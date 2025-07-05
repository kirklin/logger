# @kirklin/logger

[![npm version](https://img.shields.io/npm/v/@kirklin/logger.svg?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/@kirklin/logger)
[![npm downloads](https://img.shields.io/npm/dm/@kirklin/logger.svg?style=flat&colorA=18181B&colorB=28CF8D)](https://www.npmjs.com/package/@kirklin/logger)
[![license](https://img.shields.io/npm/l/@kirklin/logger.svg?style=flat&colorA=18181B&colorB=28CF8D)](https://github.com/kirklin/logger/blob/main/LICENSE)

A modern, flexible, and elegant logger for Node.js and the browser.

- **Elegant & Intuitive API**: Works just like `console.log` but with levels and superpowers.
- **Structured & Raw Logging**: Supports both structured `field()` logging for clarity and raw object logging for quick debugging.
- **Node.js & Browser Support**: First-class, optimized experience in both environments.
- **Smart Browser Grouping**: Intelligently groups logs in the browser to reduce clutter without hiding important information.
- **Named Loggers**: Create sub-loggers with automatic, deterministic coloring to easily distinguish log sources.
- **Performance Timers**: Simple `time()` utility to measure and log execution times.
- **Extensible**: Easily create custom `Transports` and `Formatters` to fit your needs.
- **Lightweight & Typed**: Written in TypeScript with zero dependencies.

## Install

```bash
# pnpm
pnpm add @kirklin/logger

# yarn
yarn add @kirklin/logger

# npm
npm install @kirklin/logger
```

## Getting Started

```typescript
import { field, logger, time } from "@kirklin/logger";

// --- Basic Logging ---
logger.info("Hello from the playground! This is a standard info message.");
logger.warn("This is a warning message.");
logger.error("This is an error message.");
logger.debug("This is a debug message (won't show by default).");
logger.trace("This is a trace message (won't show by default).");

console.log("\n"); // Spacer

// --- Flexible Object & Argument Logging ---
logger.info("Logging a single object:", { id: 1, name: "Kirk Lin", status: "active" });
logger.info("Logging multiple objects:", { user: "kirk" }, { permissions: ["read", "write"] });
const myVar = { a: 1, b: [2, 3] };
logger.info("Logging a variable:", myVar);
logger.error("An error occurred", new Error("Something went wrong!"));

console.log("\n"); // Spacer

// --- Structured Logging with `field()` ---
logger.info("User logged in successfully", field("userId", 12345), field("tenant", "acme-corp"));

// --- Mixed Logging (message, fields, and raw objects) ---
logger.warn(
  "Request to deprecated endpoint",
  field("endpoint", "/api/v1/legacy"),
  { userAgent: "Mozilla/5.0" },
);

console.log("\n"); // Spacer

// --- Named Loggers ---
const dbLogger = logger.named("database");
const apiLogger = logger.named("api");
dbLogger.info("Connecting to the database...");
apiLogger.info("Incoming request to /users");

console.log("\n"); // Spacer

// --- Timers ---
const timer = time(200);
setTimeout(() => {
  dbLogger.info("Database connected successfully", field("time", timer));
}, 150);

const failingTimer = time(100);
setTimeout(() => {
  apiLogger.error("Request timed out", field("time", failingTimer));
}, 200);

// --- Lazy Evaluation ---
logger.debug(() => {
  // This expensive operation will only be performed if the log level is debug or lower
  const complexData = { a: 1, b: Array.from({ length: 1e6 }, (_, i) => i).reduce((a, b) => a + b, 0) };
  return ["This is a debug message with complex data", field("data", complexData)];
});

// --- Throttling ---
logger.info("\n--- Testing Throttling (you should only see a few messages below) ---");
for (let i = 0; i < 100; i++) {
  logger.info("This is a spam message");
}
```

## Features

### Logging Arguments

You can pass any number of arguments of any type, just like `console.log`.

```typescript
logger.info("Simple string message");
logger.error("An error occurred", new Error("File not found"));
logger.warn("Request to deprecated endpoint", {
  url: "/api/v1/legacy",
  statusCode: 410,
});
```

### Named Loggers

Create context-specific loggers that are automatically colored and tagged.

```typescript
const dbLogger = logger.named("database");
const apiLogger = logger.named("api");

dbLogger.info("Connecting to PostgreSQL...");
// [database] [info] Connecting to PostgreSQL...

apiLogger.info("GET /users request received");
// [api] [info] GET /users request received
```

### Timers

Easily measure the duration of operations.

```typescript
import { field, logger, time } from "@kirklin/logger";

const timer = time(100); // Optional: expected duration in ms for color coding

setTimeout(() => {
  // This will be colored green because it finished within the expected time
  logger.info("Data fetched", field("time", timer));
}, 80);

const slowTimer = time(50);
setTimeout(() => {
  // This will be colored red because it exceeded the expected time
  logger.warn("Task finished late", field("time", slowTimer));
}, 120);
```

### Lazy Evaluation

For performance-critical logs, you can pass a function. The function will only be executed if the corresponding log level is enabled, avoiding unnecessary computations.

```typescript
logger.debug(() => {
  const expensiveData = someComplexCalculation();
  return ["Debug data calculated", field("data", expensiveData)];
});
```

## Extensibility

You can easily extend the logger by creating your own `Transport` or `Formatter`.

### Custom Transport

A transport is responsible for sending the log to a destination (e.g., console, file, remote service).

```typescript
import type { LogObject, Transport } from "@kirklin/logger";

class MyFileTransport implements Transport {
  log(logObject: LogObject) {
    const formattedMessage = myCustomFormatter.format(logObject);
    // Logic to write `formattedMessage` to a file...
  }
}

// Then add it to the logger instance
logger.transports.push(new MyFileTransport());
```

### Custom Formatter

A formatter is responsible for converting a `LogObject` into a string or another printable format.

```typescript
import type { LogObject, MessageFormat } from "@kirklin/logger";
import { Formatter } from "@kirklin/logger";

class MyJSONFormatter extends Formatter {
  format(logObject: LogObject): MessageFormat {
    // In a real implementation, you would return a format string and args.
    // For simplicity, we just stringify the object here.
    const jsonString = JSON.stringify({
      timestamp: logObject.date,
      level: logObject.level,
      message: logObject.message,
      ...logObject.args,
    });
    return { format: "%s", args: [jsonString], fields: [] };
  }
}
```

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Kirk Lin](https://github.com/kirklin)
