import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Har bir route handlerda try/catch takrorlamaslik uchun (DRY).
 * Handler ichida throw qilingan xato avtomatik errorHandler middleware'ga boradi.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
