import type { Response } from "express";
import type { z } from "zod";

/** Error body for every mock-server error response. */
export function sendError(
  res: Response,
  status: number,
  error: string,
  zodError?: z.ZodError,
) {
  res.status(status).json({
    error,
    ...(zodError && {
      issues: zodError.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    }),
  });
}
