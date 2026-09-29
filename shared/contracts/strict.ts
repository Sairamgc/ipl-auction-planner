import { z } from "zod";

/**
 * Returns a copy of `schema` that rejects unknown keys at every depth.
 *
 * Contracts are defined with `z.object`, which strips unknown keys; that is
 * what the app uses when parsing responses. The mock server and seed
 * validation use this strict copy instead (decision N9).
 */
export function toStrict<T extends z.ZodType>(schema: T): T {
  // Only unknown-key handling changes; input and output types are identical,
  // so the rebuilt schema is still a T.
  return rebuild(schema) as T;
}

function rebuild(schema: z.core.$ZodType): z.core.$ZodType {
  if (schema instanceof z.ZodObject) {
    const shape = Object.fromEntries(
      // `shape` is typed `any` on the unparameterised ZodObject; its values
      // are always Zod schemas
      Object.entries(schema.shape).map(
        ([key, value]: [string, z.core.$ZodType]) => [key, rebuild(value)],
      ),
    );
    return schema.clone({ ...schema.def, shape, catchall: z.never() });
  }
  if (schema instanceof z.ZodArray) {
    return schema.clone({ ...schema.def, element: rebuild(schema.element) });
  }
  if (schema instanceof z.ZodOptional) {
    return schema.clone({ ...schema.def, innerType: rebuild(schema.unwrap()) });
  }
  if (schema instanceof z.ZodNullable) {
    return schema.clone({ ...schema.def, innerType: rebuild(schema.unwrap()) });
  }
  if (schema instanceof z.ZodDefault) {
    return schema.clone({ ...schema.def, innerType: rebuild(schema.unwrap()) });
  }
  if (schema instanceof z.ZodUnion) {
    return schema.clone({
      ...schema.def,
      options: schema.options.map(rebuild),
    });
  }
  if (schema instanceof z.ZodPipe) {
    return schema.clone({
      ...schema.def,
      in: rebuild(schema.in),
      out: rebuild(schema.out),
    });
  }
  return schema;
}
