import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { pool } from './config/database';

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
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'OK',
            database: '接続成功',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            status: 'エラー',
            database: '接続失敗',
            error: error instanceof Error ? error.message : '不明なエラー'
        });
    }
});

// サンプルAPI: ユーザー一覧取得
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({
            error: 'ユーザーの取得に失敗しました',
            details: error instanceof Error ? error.message : '不明なエラー'
        });
    }
});

// エラーハンドリングミドルウェア
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// アプリケーションをエクスポート（テスト用）
export default app;

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました`);
    console.log(`http://localhost:${PORT}`);
});
