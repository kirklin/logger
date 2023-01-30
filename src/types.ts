import type { Field } from "./Field";

/**
 * A generic argument to log alongside a message.
 */
export type Argument = any;

/**
 * `undefined` is allowed to make it easier to conditionally display a field.
 * For example: `error && field("error", error)`
 */
export type FieldArray = Array<Field<Argument> | undefined>;

/**
 * Functions can be used to remove the need to perform operations when the
 * logging level won't output the result anyway.
 */
export type LogCallback = () => [string, ...FieldArray];
