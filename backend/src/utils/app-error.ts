export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, message, details);
export const unauthorized = (message = "Unauthorized.") => new AppError(401, message);
export const forbidden = (message = "Forbidden.") => new AppError(403, message);
export const notFound = (message = "Data not found.") => new AppError(404, message);
