/**
 * A message field.
 */
export class Field<T> {
  public constructor(public readonly identifier: string, public readonly value: T) {}

  public toJSON(): { identifier: string; value: T } {
    return {
      identifier: this.identifier,
      value: this.value,
    };
  }
}

/**
 * A field to show with the message.
 */
export function field<T>(name: string, value: T): Field<T> {
  return new Field(name, value);
}
