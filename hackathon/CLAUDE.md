# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「たべぶい」は牛・豚・鳥の各部位を食べた記録を管理するWebアプリケーションです。Agent食べ歩きコンシェルジュ機能により、ユーザーの進捗に基づいて未制覇の部位が食べられるお店を推薦します。

## 技術スタック

- **フロントエンド**: React + Vite
- **バックエンド**: FastAPI (Python)
- **データベース**: MySQL 8.0
- **コンテナ**: Docker Compose
- **認証**: Google OAuth

## 開発コマンド

### プロジェクト起動
```bash
# 初回起動（ビルド含む）
docker compose up --build

# 通常起動
docker compose up

# バックグラウンド起動
docker compose up -d

# 停止
docker compose down

# データも含めた完全削除
docker compose down -v
```

### フロントエンド開発
```bash
# npm パッケージのインストール
docker compose exec front npm install

# フロントエンド単体起動（開発時）
cd src/front && npm run dev
```

### Swagger UI起動
```bash
# Swagger UI起動スクリプト
./start-swagger.sh
```

## アクセス先

- **フロントエンド**: http://localhost:5173
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8080
- **MySQL**: localhost:3306 (user: app, password: app, database: tabebui)

## アーキテクチャ

### プロジェクト構造
```
src/
├── front/          # React + Vite フロントエンド
├── server/         # FastAPI バックエンド
├── db/            # MySQL初期化スクリプト
└── docker-compose.yml
```

### データベース設計
- **users**: ユーザー情報（Google認証）
- **animal_parts**: 部位マスターデータ（牛・豚・鳥）
- **eating_records**: 食べた部位記録

### API設計
- フロントエンドからAPIへの呼び出しはViteのdevServerで `/api -> server:8000` にプロキシ
- CORS設定済み（development環境）

## 主要機能

1. **部位記録機能**: 牛・豚・鳥の各部位を写真付きで記録
2. **進捗管理**: 制覇率の計算と表示
3. **Agent食べ歩きコンシェルジュ**: 未制覇部位に基づく店舗推薦
4. **Google認証**: Googleアカウントでのログイン

## 開発時の注意事項

- データベース接続情報などの機密情報はdocker-compose.ymlの環境変数で管理
- 初期データは `src/db/init.sql` で投入
- フロントエンドの変更はホットリロード対応
- バックエンドの変更はuvicorn --reload対応