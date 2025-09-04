**テンプレート概要**
- 3 コンテナ構成: `front`(React + Vite), `server`(FastAPI), `db`(MySQL 8)
- 1 コマンド起動: `docker compose up --build`
- 開発用構成: ホットリロード(HMR)と `uvicorn --reload` を有効化

**構成**
- `docker-compose.yml`: ルートに配置。開発用ポート: front=5173, server=8000, db=3306
- `src/front`: React + Vite プロジェクト
- `src/server`: FastAPI アプリケーション
- `src/db/init.sql`: MySQL 初期化 SQL

**起動**
- 前提: Docker / Docker Compose が利用可能
## 起動
### 初回起動
```bash
docker compose build
```

### 通常起動
```bash
docker compose up
```

- アクセス:
  - Frontend: http://localhost:5173
  - Backend(API): http://localhost:8000
  - MySQL: `localhost:3306` ユーザ=app パスワード=app DB=app

## 終了
docker compose stop

## コンテナ削除
docker compose down -v


**API とプロキシ**
- 開発時はフロントからの API 呼び出しを Vite の devServer で `/api -> server:8000` にプロキシ
- フロントコードでは `/api/health` や `/api/db-version` を叩けば OK（CORS を意識する必要なし）

**環境変数(デフォルト)**
- MySQL: `MYSQL_ROOT_PASSWORD=root`, `MYSQL_DATABASE=app`, `MYSQL_USER=app`, `MYSQL_PASSWORD=app`
- FastAPI: `DB_HOST=db`, `DB_PORT=3306`, `DB_USER=app`, `DB_PASSWORD=app`, `DB_NAME=app`, `CORS_ORIGINS=http://localhost:5173`

**よくある操作**
- 初回ビルドと起動: `docker compose up --build`
- バックグラウンド起動: `docker compose up -d`
- 停止: `docker compose down`
- DB データ永続化: Docker ボリューム `db_data` を使用

**備考**
- 本テンプレートは開発用途向けです。本番運用ではマルチステージビルド（フロントの静的配信）、機密情報の秘匿、ヘルスチェックや監視の強化等をご検討ください。

