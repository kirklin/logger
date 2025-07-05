import { field, logger, time } from "../src";

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
