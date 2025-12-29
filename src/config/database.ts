import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL接続プール設定
export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // 最大接続数
    idleTimeoutMillis: 30000, // アイドルタイムアウト
    connectionTimeoutMillis: 2000, // 接続タイムアウト
});

// 接続確認
pool.on('connect', () => {
    console.log('データベースに接続しました');
});

pool.on('error', (err) => {
    console.error('データベース接続エラー:', err);
    process.exit(-1);
});

// データベーステーブル初期化関数（オプション）
export const initDatabase = async () => {
    try {
        // サンプルテーブル作成
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('データベーステーブルを初期化しました');
    } catch (error) {
        console.error('テーブル初期化エラー:', error);
        throw error;
    }
};
