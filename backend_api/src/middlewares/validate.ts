import { ZodError, ZodObject, AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware untuk validasi body, query, dan params menggunakan Zod.
 */

export function validateSchema(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Remove the .body access
      next();
    } catch (err: any) {
      console.error("Validation error:", err.errors);
      res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
    }
  };
}
