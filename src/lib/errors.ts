export class AppError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly statusCode: number = 500,
        public readonly details?: string
    ) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: string) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, details?: string) {
        super('NOT_FOUND', message, 404, details);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class DuplicateError extends AppError {
    constructor(message: string, details?: string) {
        super('DUPLICATE_ERROR', message, 400, details);
        this.name = 'DuplicateError';
        Object.setPrototypeOf(this, DuplicateError.prototype);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'サーバーエラーが発生しました', details?: string) {
        super('INTERNAL_SERVER_ERROR', message, 500, details);
        this.name = 'InternalServerError';
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
