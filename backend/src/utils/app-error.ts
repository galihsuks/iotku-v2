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
export const unauthorized = (message = "Silakan login terlebih dahulu.") =>
  new AppError(401, message);
export const forbidden = (message = "Kamu tidak punya akses untuk melakukan aksi ini.") =>
  new AppError(403, message);
export const notFound = (message = "Data tidak ditemukan.") => new AppError(404, message);
