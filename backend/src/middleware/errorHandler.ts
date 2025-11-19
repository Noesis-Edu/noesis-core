import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);
  res.status(500).json({ message: 'Unexpected error', details: error instanceof Error ? error.message : undefined });
}
