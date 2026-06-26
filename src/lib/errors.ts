export type HttpStatusCode = 400 | 422 | 500;

export class AppError extends Error {
  constructor(
    public readonly statusCode: HttpStatusCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function badRequest(message: string): AppError {
  return new AppError(400, message);
}

export function unprocessableEntity(message: string): AppError {
  return new AppError(422, message);
}

export function internalError(message = "An internal error occurred"): AppError {
  return new AppError(500, message);
}

export function safeErrorResponse(error: unknown): {
  status: HttpStatusCode;
  body: { error: string };
} {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: { error: error.message },
    };
  }

  // Log the full error server-side
  console.error("Unexpected error:", error);
  return {
    status: 500,
    body: { error: "An internal error occurred" },
  };
}
