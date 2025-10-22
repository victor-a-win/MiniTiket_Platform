import { ZodError, ZodObject, AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware untuk validasi body, query, dan params menggunakan Zod.
 */

export function validateSchema(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      res.status(400).json({ error: err.errors });
    }
  };
}
