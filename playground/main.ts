import { field, logger, time } from "../src";

logger.info("Hello from the playground!");
logger.warn("This is a warning message.");
logger.error("This is an error message.", field("user", { id: 1, name: "John Doe" }));

const subLogger = logger.named("database");
subLogger.info("Connecting to the database...");

const timer = time(200);
setTimeout(() => {
  subLogger.info("Database connected", field("time", timer));
}, 150);

const failingTimer = time(100);
setTimeout(() => {
  subLogger.error("Database connection failed", field("time", failingTimer));
}, 200);

logger.debug(() => {
  // This will only be evaluated if the log level is debug or lower
  const complexData = { a: 1, b: 2 };
  return ["This is a debug message with complex data", field("data", complexData)];
});

// Test throttling
for (let i = 0; i < 100; i++) {
  logger.info("This is a spam message");
}
