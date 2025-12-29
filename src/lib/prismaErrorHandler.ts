import { Prisma } from '@prisma/client';
import { NotFoundError, DuplicateError, InternalServerError } from './errors';
import {
    MSG_DB_FAILURE,
    MSG_DUPLICATE_DATA,
    MSG_DUPLICATE_EMAIL,
    MSG_USER_NOT_FOUND
} from './messages';

export function handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2025':
                // Record not found
                throw new NotFoundError(MSG_USER_NOT_FOUND);
            case 'P2002':
                // Unique constraint violation
                const target = (error.meta?.target as string[]) || [];
                if (target.includes('email')) {
                    throw new DuplicateError(MSG_DUPLICATE_EMAIL);
                }
                throw new DuplicateError(MSG_DUPLICATE_DATA);
            default:
                throw new InternalServerError(MSG_DB_FAILURE, error.message);
        }
    }

    if (error instanceof Error) {
        throw new InternalServerError('予期しないエラーが発生しました', error.message);
    }

    throw new InternalServerError();
}
