# TypeScript + Express + PostgreSQL プロジェクト

Node.js、TypeScript、Express、PostgreSQLを使用したWebアプリケーションです。

## セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`をコピーして`.env`ファイルを作成し、データベース接続情報を設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集して、PostgreSQLの接続情報を設定してください：
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
PORT=3000
NODE_ENV=development
```

### 3. PostgreSQLデータベースの準備（Docker使用）
Dockerを使用してPostgreSQLを起動します。

```bash
# PostgreSQLコンテナの起動
docker-compose up -d

# コンテナの状態確認
docker-compose ps

# ログ確認
docker-compose logs postgres
```

**注意**: `.env`ファイルにデータベース接続情報が既に設定されています。必要に応じて変更してください。

## 開発

### 開発サーバーの起動
```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### ビルド
```bash
npm run build
```

### 本番環境での起動
```bash
npm start
```

## Docker操作

### PostgreSQLコンテナの起動
```bash
docker-compose up -d
```

### PostgreSQLコンテナの停止
```bash
docker-compose down
```

### データベースへの接続（コンテナ内）
```bash
docker-compose exec postgres psql -U postgres -d myapp_db
```

### ログの確認
```bash
docker-compose logs -f postgres
```

### データベースボリュームの削除（データを完全に削除）
```bash
docker-compose down -v
```

## APIエンドポイント

- `GET /` - ウェルカムメッセージ
- `GET /health` - データベース接続確認
- `GET /api/users` - ユーザー一覧取得

## プロジェクト構造

```
typescript_copilot_test/
├── src/
│   ├── index.ts              # メインアプリケーションファイル
│   └── config/
│       └── database.ts       # データベース接続設定
├── dist/                     # ビルド出力ディレクトリ
├── .env                      # 環境変数（gitignore済み）
├── .env.example              # 環境変数のテンプレート
├── package.json              # プロジェクト設定
├── tsconfig.json             # TypeScript設定
└── README.md                 # このファイル
```

## 使用技術

- **Node.js** - JavaScriptランタイム
- **TypeScript** - 型安全なJavaScript
- **Express** - Webフレームワーク
- **PostgreSQL** - リレーショナルデータベース（Docker上で実行）
- **Docker** - コンテナ環境
- **pg** - PostgreSQLクライアント
- **dotenv** - 環境変数管理
- **ts-node-dev** - 開発用TypeScript実行環境
