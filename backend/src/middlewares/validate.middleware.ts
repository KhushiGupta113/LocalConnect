import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { sendError } from '../utils/apiResponse.js';

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || 'Validation error';
        const formattedErrors = error.errors.reduce<Record<string, string>>((acc, curr) => {
          const key = curr.path.join('.');
          acc[key] = curr.message;
          return acc;
        }, {});
        sendError(res, firstError, 400, formattedErrors);
        return;
      }
      next(error);
    }
  };
}
