import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { AppError } from './lib/errors';
import { UserController } from './controllers/userController';

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

// ユーザーAPI
app.get('/api/users', UserController.getUserList);
app.get('/api/users/:id', UserController.getUser);
app.post('/api/users', UserController.createUser);
app.patch('/api/users/:id', UserController.updateUser);
app.delete('/api/users/:id', UserController.deleteUser);

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
