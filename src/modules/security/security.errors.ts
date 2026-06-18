export class TokenExpiredException extends Error {
  constructor() {
    super('JWT_TOKEN_EXPIRED');
  }
}

export class InvalidTokenException extends Error {
  constructor() {
    super('INVALID_JWT_TOKEN');
  }
}

export class InvalidTokenTypeException extends Error {
  constructor() {
    super('INVALID_TOKEN_TYPE');
  }
}
