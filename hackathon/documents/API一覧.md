# API一覧

## フェーズ1 API

### TOP画面
- `GET /api/user/progress` - ユーザーの記録・進捗情報を取得
- `GET /api/eating-records/recent` - 最近の食事記録を取得
- `GET /api/user/stats` - 制覇率などの統計情報を取得

### 食べた部位ページ
- `GET /api/eating-records` - ユーザーの食事記録一覧を取得
- `GET /api/animal-parts` - 部位マスターデータを取得
- `GET /api/user/progress/{animalType}` - 動物別の制覇状況を取得

### 部位を記録する
- `GET /api/animals` - 動物一覧を取得（牛・豚・鳥）→ない。固定値
- `GET /api/animal-parts/{animalType}` - 選択した動物の部位一覧を取得
- `POST /api/eating-records` - 食事記録を作成

### コンシェルジュ
- `POST /api/chat/message` - チャットメッセージを送信
- `GET /api/chat/history` - チャット履歴を取得
- `POST /api/recommendations` - おすすめ部位を取得

## フェーズ2 API

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `POST /api/auth/register` - 新規登録
- `GET /api/auth/profile` - ユーザープロフィール取得
- `PUT /api/auth/profile` - ユーザープロフィール更新

## 共通API

### エラーハンドリング
- 全APIで統一したエラーレスポンス形式
- HTTPステータスコード: 200, 400, 401, 403, 404, 500

### レスポンス形式
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 認証
- JWT Bearer Token認証