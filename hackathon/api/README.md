# たべぶい API ドキュメント

## Swagger UIでAPIドキュメントを確認する方法

### 1. Swagger UIを起動

```bash
# hackathonディレクトリから実行
./start-swagger.sh
```

または、手動で起動する場合：

```bash
cd src
docker-compose up swagger-ui -d
```

### 2. ブラウザでアクセス

http://localhost:8080 にアクセスしてSwagger UIを確認してください。

### 3. 停止する場合

```bash
cd src
docker-compose down swagger-ui
```

## ファイル構成

- `swagger.yaml` - OpenAPI 3.0.3仕様書
- `README.md` - このファイル

## API概要

たべぶいアプリのAPIドキュメントです。以下の機能を提供します：

- **TOP画面API**: ユーザー進捗情報取得、最近の食事記録取得
- **食べた部位ページAPI**: 食事記録一覧取得、部位マスターデータ取得
- **部位記録API**: 動物別部位一覧取得、食事記録作成

詳細な仕様はSwagger UIで確認してください。