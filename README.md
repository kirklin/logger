# logger

A simple JavaScript logging library that allows you to log messages with levels (Trace, Debug, Info, Warn, and Error)
and optional fields and custom colors.

- Built for node and the browser
- Use groups in the browser to reduce clutter

## Install

```bash
pnpm i @kirklin/logger
```
## Example Usage

```javascript
import { field, logger } from "@kirklin/logger";

logger.info("Loading container",
	field("msg", 1),
	field("msg2", {"key":value}));
```

## Formatting

By default, the logger uses a different formatter depending on whether it detects
it is running in the browser or not. A custom formatter can be set:

```javascript
import { logger, Formatter } from "@kirklin/logger";

class MyFormatter extends Formatter {
	// implementation ...
}

logger.formatter = new MyFormatter();
```

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Kirk Lin](https://github.com/kirklin)
