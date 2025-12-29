import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { userCreateSchema, userUpdateSchema, userIdParamSchema } from './schemas/user';
import { AppError, ValidationError, NotFoundError } from './lib/errors';
import { handlePrismaError } from './lib/prismaErrorHandler';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルート
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'TypeScript + Express + PostgreSQL API' });
});

// データベース接続テスト
app.get('/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT NOW()`;
        res.json({
            status: 'OK',
            database: '接続成功'
        });
    } catch (error) {
        res.status(500).json({
            status: 'エラー',
            database: '接続失敗',
            error: error instanceof Error ? error.message : '不明なエラー'
        });
    }
});

// ユーザー一覧取得
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({
            error: 'ユーザーの取得に失敗しました',
            details: error instanceof Error ? error.message : '不明なエラー'
        });
    }
});

// ユーザー個別取得
app.get('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = userIdParamSchema.safeParse(req.params);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues[0]?.message ?? '不正なリクエストです');
        }

        const { id } = parsed.data;
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundError('ユーザーが見つかりませんでした');
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// ユーザー作成
app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = userCreateSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues[0]?.message ?? '不正な入力です');
        }

        const { name, email } = parsed.data;
        const user = await prisma.user.create({
            data: { name, email }
        });

        res.status(201).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        try {
            handlePrismaError(error);
        } catch (prismaError) {
            return next(prismaError);
        }
    }
});

// ユーザー更新
app.patch('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramsParsed = userIdParamSchema.safeParse(req.params);
        if (!paramsParsed.success) {
            throw new ValidationError(paramsParsed.error.issues[0]?.message ?? '不正なリクエストです');
        }

        const bodyParsed = userUpdateSchema.safeParse(req.body);
        if (!bodyParsed.success) {
            throw new ValidationError(bodyParsed.error.issues[0]?.message ?? '不正な入力です');
        }

        const { id } = paramsParsed.data;
        const updateData = bodyParsed.data;

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        try {
            handlePrismaError(error);
        } catch (prismaError) {
            return next(prismaError);
        }
    }
});

// ユーザー削除
app.delete('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = userIdParamSchema.safeParse(req.params);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues[0]?.message ?? '不正なリクエストです');
        }

        const { id } = parsed.data;
        const user = await prisma.user.delete({
            where: { id }
        });

        res.json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        try {
            handlePrismaError(error);
        } catch (prismaError) {
            return next(prismaError);
        }
    }
});

// エラーハンドリングミドルウェア
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        console.error(`[${err.code}] ${err.message}`, err.details);
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { details: err.details })
        });
    }

    console.error('[INTERNAL_SERVER_ERROR]', err instanceof Error ? err.message : err);
    return res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サーバーエラーが発生しました'
    });
});

// アプリケーションをエクスポート（テスト用）
export default app;

// サーバー起動（テスト時は起動しない）
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`サーバーがポート ${PORT} で起動しました`);
        console.log(`http://localhost:${PORT}`);
    });
}
