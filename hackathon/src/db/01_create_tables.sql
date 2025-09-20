-- tabebui データベースを使用
USE tabebui;
-- 文字化け対策: クライアント接続文字コードをUTF-8に固定
SET NAMES utf8mb4;

-- 1. users（ユーザーテーブル）
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. animal_parts（部位マスターテーブル）
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

-- 3. eating_sessions（食事セッションテーブル）
CREATE TABLE eating_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_name TEXT,
    eaten_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    memo TEXT,
    rating INT, -- 1-5段階評価
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. eating_records（食べた部位記録テーブル）
CREATE TABLE eating_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    animal_part_id INT NOT NULL,
    session_id INT,
    eaten_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (animal_part_id) REFERENCES animal_parts(id),
    FOREIGN KEY (session_id) REFERENCES eating_sessions(id) ON DELETE SET NULL
);

-- インデックス作成
CREATE INDEX idx_eating_records_user_eaten_at ON eating_records(user_id, eaten_at DESC);
CREATE INDEX idx_animal_parts_type ON animal_parts(animal_type);

-- Agent食べ歩きコンシェルジュ機能のためのビュー
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
