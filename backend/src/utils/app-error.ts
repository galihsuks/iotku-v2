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
export const unauthorized = (message = "Please sign in first.") =>
  new AppError(401, message);
export const forbidden = (message = "You do not have access to perform this action.") =>
  new AppError(403, message);
export const notFound = (message = "Data not found.") => new AppError(404, message);
