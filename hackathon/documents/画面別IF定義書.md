# 画面別APIインターフェース定義書

## 1. TOP画面 API

### 1.1. ユーザーの進捗情報取得

#### 基本情報
| 項目 | 内容 |
|------|------|
| **メソッド** | `GET` |
| **エンドポイント** | `/api/user/progress` |
| **説明** | ログインユーザーの各動物カテゴリ（牛・豚・鳥）ごとの部位制覇率と、全体の制覇率を取得 |

#### リクエスト
- **ヘッダー**
  ```
  ```
- **パラメータ**: なし

#### レスポンス
- **成功時**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "total_progress": 0.45,
      "beef": {
        "eaten_count": 10,
        "total_count": 20,
        "progress": 0.5
      },
      "pork": {
        "eaten_count": 5,
        "total_count": 15,
        "progress": 0.33
      },
      "chicken": {
        "eaten_count": 8,
        "total_count": 10,
        "progress": 0.8
      }
    },
    "message": "Success",
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

- **エラー時**: `401 Unauthorized`
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "認証が必要です"
    },
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

---

### 1.2. 最近の食事記録を取得

#### 基本情報
| 項目 | 内容 |
|------|------|
| **メソッド** | `GET` |
| **エンドポイント** | `/api/eating-records/recent` |
| **説明** | ログインユーザーの最近の食事記録を取得 |

#### リクエスト
- **ヘッダー**
  ```
  ```
- **クエリパラメータ**
  | パラメータ | 型 | 必須 | 説明 | デフォルト |
  |-----------|-----|------|------|-----------|
  | limit | number | × | 取得件数 | 5 |

#### レスポンス
- **成功時**: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 101,
        "animal_part": {
          "part_name_jp": "ハラミ",
          "animal_type": "beef"
        },
        "restaurant_name": "焼肉○○",
        "eaten_at": "2024-08-15T19:00:00Z",
        "rating": 5,
        "photo_url": "https://example.com/photo.jpg"
      }
    ],
    "message": "Success",
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

---

## 2. 食べた部位ページ API

### 2.1. ユーザーの食事記録一覧を取得

#### 基本情報
| 項目 | 内容 |
|------|------|
| **メソッド** | `GET` |
| **エンドポイント** | `/api/eating-records` |
| **説明** | ログインユーザーの食事記録を取得 |

#### リクエスト
- **ヘッダー**
  ```
  ```
- **クエリパラメータ**
  | パラメータ | 型 | 必須 | 説明 | デフォルト |
  |-----------|-----|------|------|-----------|
  | animal_type | string | × | 動物種別でフィルタ (beef/pork/chicken) | - |
  | page | number | × | ページ番号 | 1 |
  | per_page | number | × | 1ページあたりの件数 | 20 |
  | sort | string | × | ソート順 (eaten_at_desc/eaten_at_asc) | eaten_at_desc |

#### レスポンス
- **成功時**: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 101,
        "animal_part": {
          "id": 15,
          "part_name_jp": "ハラミ",
          "animal_type": "beef",
          "part_category": "organ",
          "difficulty_level": 1
        },
        "restaurant_name": "焼肉○○",
        "eaten_at": "2024-08-15T19:00:00Z",
        "memo": "とても美味しかった",
        "rating": 5,
        "photo_url": null
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 45,
      "total_pages": 3
    },
    "message": "Success",
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

---

### 2.2. 部位マスターデータを取得

#### 基本情報
| 項目 | 内容 |
|------|------|
| **メソッド** | `GET` |
| **エンドポイント** | `/api/animal-parts` |
| **説明** | 全ての動物の部位マスターデータを取得 |

#### リクエスト
- **クエリパラメータ**
  | パラメータ | 型 | 必須 | 説明 | デフォルト |
  |-----------|-----|------|------|-----------|
  | animal_type | string | × | 動物種別でフィルタ (beef/pork/chicken) | - |
  | part_category | string | × | カテゴリでフィルタ (meat/organ) | - |

#### レスポンス
- **成功時**: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "animal_type": "beef",
        "part_category": "meat",
        "part_name": "neck",
        "part_name_jp": "ネック",
        "description": "硬いがうま味豊富、煮込み向き",
        "difficulty_level": 3
      }
    ],
    "message": "Success",
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

---

## 3. 部位を記録する API

### 3.1. 動物別の部位一覧を取得

#### 基本情報
| 項目 | 内容 |
|------|------|
| **メソッド** | `GET` |
| **エンドポイント** | `/api/animal-parts/{animalType}` |
| **説明** | 指定された動物の部位一覧を取得 |

#### リクエスト
- **パスパラメータ**
  | パラメータ | 型 | 必須 | 説明 | 値の例 |
  |-----------|-----|------|------|--------|
  | animalType | string | ○ | 動物の種類 | beef / pork / chicken |

- **クエリパラメータ**
  | パラメータ | 型 | 必須 | 説明 | デフォルト |
  |-----------|-----|------|------|-----------|
  | part_category | string | × | カテゴリでフィルタ (meat/organ) | - |

#### レスポンス
- **成功時**: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 15,
        "animal_type": "beef",
        "part_category": "organ",
        "part_name": "harami",
        "part_name_jp": "ハラミ",
        "description": "横隔膜の薄い部分、柔らかい",
        "difficulty_level": 1
      }
    ],
    "message": "Success",
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

- **エラー時**: `400 Bad Request`
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_ANIMAL_TYPE",
      "message": "無効な動物タイプです"
    },
    "timestamp": "2024-08-15T19:00:00Z"
  }
  ```

---

### 3.2. 食事記録を作成

#### 基本情報
| 項目 | 内容 |
|------|------|
| **メソッド** | `POST` |
| **エンドポイント** | `/api/eating-records` |
| **説明** | 新しい食事記録を作成 |

#### リクエスト
- **ヘッダー**
  ```
  Content-Type: application/json
  ```

- **リクエストボディ**
  | フィールド | 型 | 必須 | 説明 | 制約 |
  |-----------|-----|------|------|------|
  | animal_part_id | number | ○ | 部位ID | 存在する部位IDのみ |
  | restaurant_name | string | × | レストラン名 | 最大100文字 |
  | eaten_at | string | × | 食事日時（ISO 8601形式） | デフォルト: 現在時刻 |
  | memo | string | × | メモ | 最大500文字 |
  | rating | number | × | 評価 | 1〜5の整数 |
  | photo_url | string | × | 写真URL | 有効なURL形式 |

- **リクエスト例**
  ```json
  {
    "animal_part_id": 15,
    "restaurant_name": "焼肉やまちゃん",
    "eaten_at": "2024-09-01T18:30:00Z",
    "memo": "タレが絶品だった！",
    "rating": 5,
    "photo_url": "https://example.com/photo.jpg"
  }
  ```

#### レスポンス
- **成功時**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": 102,
      "animal_part_id": 15,
      "restaurant_name": "焼肉やまちゃん",
      "eaten_at": "2024-09-01T18:30:00Z",
      "created_at": "2024-09-01T19:00:00Z"
    },
    "message": "Eating record created successfully",
    "timestamp": "2024-09-01T19:00:00Z"
  }
  ```

- **エラー時**: `400 Bad Request`
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_PART_ID",
      "message": "指定された部位IDが存在しません",
      "details": {
        "animal_part_id": 999
      }
    },
    "timestamp": "2024-09-01T19:00:00Z"
  }
  ```

---

## 共通仕様

### エラーコード一覧
| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| UNAUTHORIZED | 401 | 認証が必要です |
| FORBIDDEN | 403 | アクセス権限がありません |
| NOT_FOUND | 404 | リソースが見つかりません |
| INVALID_REQUEST | 400 | リクエストが不正です |
| INVALID_ANIMAL_TYPE | 400 | 無効な動物タイプです |
| INVALID_PART_ID | 400 | 無効な部位IDです |
| SERVER_ERROR | 500 | サーバーエラー |

### 日付形式
- **すべての日付**: ISO 8601形式（例: `2024-08-15T19:00:00Z`）
- **タイムゾーン**: UTC

### ページネーション
- **デフォルト件数**: 20件
- **最大件数**: 100件
- **レスポンス形式**:
  ```json
  {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  }
  ```
