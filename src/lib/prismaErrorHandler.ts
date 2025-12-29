import { Prisma } from '@prisma/client';
import { NotFoundError, DuplicateError, InternalServerError } from './errors';

export function handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2025':
                // Record not found
                throw new NotFoundError('ユーザーが見つかりませんでした');
            case 'P2002':
                // Unique constraint violation
                const target = (error.meta?.target as string[]) || [];
                if (target.includes('email')) {
                    throw new DuplicateError('このメールアドレスは既に登録されています');
                }
                throw new DuplicateError('重複するデータが存在します');
            default:
                throw new InternalServerError('データベース操作に失敗しました', error.message);
        }
    }

    if (error instanceof Error) {
        throw new InternalServerError('予期しないエラーが発生しました', error.message);
    }

    throw new InternalServerError();
}
