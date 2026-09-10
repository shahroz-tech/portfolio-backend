import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: "Resource not found." });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  // Never leak raw backend errors (stack traces, DB errors) to the client.
  const message =
    statusCode < 500
      ? err.message || "Request could not be processed."
      : "Something went wrong on our end. Please try again shortly.";

  res.status(statusCode).json({ success: false, message });
};
