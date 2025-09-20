# データベース設計書

## 概要
「たべぶい」アプリのデータベース設計書です。
牛・豚・鳥の部位を記録し、Agent食べ歩きコンシェルジュ機能を提供します。

## 技術スタック
- データベース: MySQL
- Docker環境での運用

## 設計思想
### 食事セッション管理
- 1回の食事で複数部位を食べることを想定し、「食事セッション」という概念を導入
- `eating_sessions`テーブルで食事の基本情報（お店、日時、メモ、評価など）を管理
- `eating_records`テーブルで各部位の記録を管理し、`session_id`で関連付け
- これにより「1回の食事」単位でのデータ取得・表示が可能

## テーブル設計

### 1. users（ユーザーテーブル）
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**説明**: Googleアカウントでログインするユーザー情報を管理

**カラム詳細**:
- `google_id`: Google OAuth認証のユニークID
- `email`: ユーザーのメールアドレス
- `name`: 表示名
- `profile_image_url`: プロフィール画像URL

### 2. animal_parts（部位マスターテーブル）
```sql
CREATE TABLE animal_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    animal_type ENUM('beef', 'pork', 'chicken') NOT NULL,
    part_category ENUM('meat', 'organ') NOT NULL,
    part_name VARCHAR(100) NOT NULL,
    part_name_jp VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level INT DEFAULT 1, -- 1:易しい, 5:難しい
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_animal_part (animal_type, part_name)
);
```

**説明**: 牛・豚・鳥の各部位のマスターデータ

**カラム詳細**:
- `animal_type`: 動物の種類（beef:牛, pork:豚, chicken:鳥）
- `part_category`: 部位カテゴリ（meat:赤身系, organ:内臓系）
- `part_name`: 部位名（英語）
- `part_name_jp`: 部位名（日本語）
- `difficulty_level`: レア度（1-5段階）

### 3. eating_sessions（食事セッションテーブル）
```sql
CREATE TABLE eating_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_name TEXT,
    eaten_at TIMESTAMP,
    memo TEXT,
    rating INT, -- 1-5段階評価
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**説明**: 1回の食事セッションの基本情報を管理

**カラム詳細**:
- `restaurant_name`: お店の名前（フリーテキスト）
- `eaten_at`: 実際に食べた日時
- `memo`: 感想やメモ
- `rating`: 5段階評価
- `photo_url`: 撮影した写真のURL
- `updated_at`: 更新日時（セッション情報の変更時に更新）

### 4. eating_records（食べた部位記録テーブル）
```sql
CREATE TABLE eating_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    animal_part_id INT NOT NULL,
    session_id INT NOT NULL,
    eaten_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (animal_part_id) REFERENCES animal_parts(id),
    FOREIGN KEY (session_id) REFERENCES eating_sessions(id) ON DELETE CASCADE
);
```

**説明**: ユーザーが食べた各部位の記録（食事セッションに紐づく）

**カラム詳細**:
- `session_id`: 所属する食事セッションのID
- `eaten_at`: 実際に食べた日時（通常はセッションと同じ）

**変更点**:
- レストラン名、メモ、評価、写真URLは`eating_sessions`に移管
- `session_id`で食事セッションと関連付け



## インデックス設計

```sql
-- 検索用
CREATE INDEX idx_eating_sessions_user_eaten_at ON eating_sessions(user_id, eaten_at DESC);
CREATE INDEX idx_eating_records_session ON eating_records(session_id);
CREATE INDEX idx_eating_records_user_eaten_at ON eating_records(user_id, eaten_at DESC);
CREATE INDEX idx_animal_parts_type ON animal_parts(animal_type);
```

## 初期データ例

### 部位マスターデータ（エバラ食品サイト参考）
```sql
-- 牛肉部位
INSERT INTO animal_parts (animal_type, part_category, part_name, part_name_jp, difficulty_level, description) VALUES
-- 赤身系
('beef', 'meat', 'neck', 'ネック', 3, '硬いがうま味豊富、煮込み向き'),
('beef', 'meat', 'shoulder_loin', 'かたロース', 2, 'きめが細かく適度な脂身'),
('beef', 'meat', 'shoulder', 'かた', 2, '赤身主体でタンパク質豊富'),
('beef', 'meat', 'rib_loin', 'リブロース', 1, '脂肪と赤身のバランス良好'),
('beef', 'meat', 'sirloin', 'サーロイン', 1, '最高級部位、風味抜群'),
('beef', 'meat', 'tenderloin', 'ヒレ', 1, '最も柔らかく脂肪少ない'),
('beef', 'meat', 'rump', 'ランプ', 2, '柔らかく味が良い'),
('beef', 'meat', 'round', 'もも', 2, '最も脂肪が少ない赤身'),
('beef', 'meat', 'outer_round', 'そともも', 2, 'ややきめが粗く赤身'),
('beef', 'meat', 'belly', 'バラ', 1, '脂肪と赤身が層になっている'),
('beef', 'meat', 'shank', 'すね', 3, '硬いが長時間煮込むと美味'),

-- 内臓系
('beef', 'organ', 'tongue', 'タン', 2, '舌、柔らかく人気部位'),
('beef', 'organ', 'head_meat', 'カシラニク', 3, '頭部の肉'),
('beef', 'organ', 'heart', 'ハツ', 2, '心臓、歯ごたえある'),
('beef', 'organ', 'sagari', 'サガリ', 2, '横隔膜、ハラミに近い'),
('beef', 'organ', 'harami', 'ハラミ', 1, '横隔膜の薄い部分、柔らかい'),
('beef', 'organ', 'tripe', 'ミノ', 3, '第一胃、コリコリした食感'),
('beef', 'organ', 'liver', 'レバー', 2, '肝臓、栄養豊富'),

-- 豚肉部位
-- 赤身系
('pork', 'meat', 'shoulder_loin', 'かたロース', 1, 'きめが細かく適度な脂身'),
('pork', 'meat', 'shoulder', 'かた', 1, '赤身主体の部位'),
('pork', 'meat', 'loin', 'ロース', 1, '背中の肉、柔らかい'),
('pork', 'meat', 'tenderloin', 'ヒレ', 1, '最も柔らかい部位'),
('pork', 'meat', 'ham', 'もも', 1, '後ろ足の肉'),
('pork', 'meat', 'outer_ham', 'そともも', 2, 'ももの外側'),
('pork', 'meat', 'belly', 'バラ', 1, '脂肪と赤身が層になっている'),

-- 内臓系
('pork', 'organ', 'ear', 'ミミ', 4, '耳、コリコリした食感'),
('pork', 'organ', 'trotter', 'トンソク', 4, '足先、コラーゲン豊富'),

-- 鶏肉部位
-- 赤身系
('chicken', 'meat', 'breast', 'むね', 1, '胸の肉、脂肪少なく淡泊'),
('chicken', 'meat', 'tender', 'ささみ', 1, '胸肉の一部、最も柔らかい'),
('chicken', 'meat', 'wing', '手羽', 1, '翼の部分'),
('chicken', 'meat', 'thigh', 'もも', 1, '脚の肉、ジューシー'),
('chicken', 'meat', 'skin', '皮', 1, '皮、脂肪分多い'),

-- 内臓系
('chicken', 'organ', 'neck_meat', 'せせり', 2, '首回りの肉、歯ごたえある'),
('chicken', 'organ', 'tail', 'ぼんじり', 2, '尻尾部分、脂肪多い'),
('chicken', 'organ', 'heart', 'ハツ', 2, '心臓、小ぶりで柔らかい'),
('chicken', 'organ', 'liver', 'レバー', 2, '肝臓、クリーミー'),
('chicken', 'organ', 'gizzard', '砂肝', 2, '砂嚢、コリコリした食感');
```

## 便利なクエリ例

### 食事セッション一覧の取得
```sql
-- ユーザーの食事セッション一覧（部位数付き）
SELECT es.*,
       COUNT(er.id) as parts_count,
       GROUP_CONCAT(ap.part_name_jp ORDER BY ap.part_name_jp) as parts_list
FROM eating_sessions es
LEFT JOIN eating_records er ON es.id = er.session_id
LEFT JOIN animal_parts ap ON er.animal_part_id = ap.id
WHERE es.user_id = ?
GROUP BY es.id
ORDER BY es.eaten_at DESC;
```

### 特定セッションの詳細
```sql
-- 特定セッションの詳細と含まれる部位
SELECT er.*, ap.animal_type, ap.part_category, ap.part_name_jp, ap.description
FROM eating_records er
JOIN animal_parts ap ON er.animal_part_id = ap.id
WHERE er.session_id = ?
ORDER BY ap.animal_type, ap.part_category, ap.part_name_jp;
```

## Agent食べ歩きコンシェルジュ機能のためのビュー

```sql
CREATE VIEW user_missing_parts AS
SELECT
    u.id as user_id,
    u.name,
    ap.id as animal_part_id,
    ap.animal_type,
    ap.part_name_jp
FROM users u
CROSS JOIN animal_parts ap
LEFT JOIN eating_records er ON u.id = er.user_id AND ap.id = er.animal_part_id
WHERE er.id IS NULL;
```

このビューにより、「渋谷で未制覇の牛部位が食べられる店教えて」といったクエリに対して、ユーザーがまだ食べていない部位を特定できます。お店情報は外部API（Google Places APIなど）から取得する想定です。

## 主要API仕様

### 1. 食事記録作成
- **エンドポイント**: `POST /api/eating-records`
- **動作**:
  1. `eating_sessions`レコードを作成（食事の基本情報）
  2. 各部位に対して`eating_records`レコードを作成
  3. すべてのレコードに同じ`session_id`を設定

### 2. 食事セッション一覧取得
- **エンドポイント**: `GET /api/eating-sessions`
- **機能**: ページング付きでセッション一覧を取得、各セッションの部位数も表示

### 3. 食事セッション詳細取得
- **エンドポイント**: `GET /api/eating-sessions/{sessionId}`
- **機能**: 特定セッションの詳細と含まれる全部位の情報を取得