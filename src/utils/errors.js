class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed.") {
    super(400, "VALIDATION_ERROR", message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(401, "UNAUTHORIZED", message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "You are not allowed to perform this action.") {
    super(403, "FORBIDDEN", message);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(404, "NOT_FOUND", message);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict.") {
    super(409, "CONFLICT", message);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
};
