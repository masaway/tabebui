-- tabebui データベースを使用
USE tabebui;
-- 文字化け対策: クライアント接続文字コードをUTF-8に固定
SET NAMES utf8mb4;

-- テストユーザーデータ
INSERT INTO users (google_id, email, name, profile_image_url) VALUES
('test_user_123', 'test@example.com', 'テストユーザー', NULL);

-- テスト用食事セッション
INSERT INTO eating_sessions (user_id, restaurant_name, eaten_at, memo, rating, photo_url) VALUES
(1, '焼肉レストラン山田', '2024-01-15 19:30:00', '美味しかった！', 5, NULL),
(1, '肉処 田中', '2024-02-01 18:00:00', 'タンが特に良かった', 4, NULL),
(1, 'ホルモン酒場', '2024-02-20 20:00:00', 'ホルモンが新鮮', 4, NULL);

-- テスト用食事記録（一部の部位を制覇済みに設定）
INSERT INTO eating_records (user_id, animal_part_id, session_id, eaten_at) VALUES
-- 牛肉部位
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'sirloin'), 1, '2024-01-15 19:30:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'rib_loin'), 1, '2024-01-15 19:30:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'tongue'), 2, '2024-02-01 18:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'harami'), 2, '2024-02-01 18:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'belly'), 1, '2024-01-15 19:30:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'tenderloin'), 3, '2024-02-20 20:00:00'),

-- 豚肉部位
(1, (SELECT id FROM animal_parts WHERE animal_type = 'pork' AND part_name = 'shoulder_loin'), 3, '2024-02-20 20:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'pork' AND part_name = 'belly'), 3, '2024-02-20 20:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'pork' AND part_name = 'loin'), 1, '2024-01-15 19:30:00'),

-- 鶏肉部位
(1, (SELECT id FROM animal_parts WHERE animal_type = 'chicken' AND part_name = 'thigh'), 2, '2024-02-01 18:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'chicken' AND part_name = 'tender'), 2, '2024-02-01 18:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'chicken' AND part_name = 'liver'), 3, '2024-02-20 20:00:00'),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'chicken' AND part_name = 'wing'), 1, '2024-01-15 19:30:00');

-- より最近の記録を追加（過去1週間以内）
INSERT INTO eating_sessions (user_id, restaurant_name, eaten_at, memo, rating, photo_url) VALUES
(1, '牛角 渋谷店', DATE_SUB(NOW(), INTERVAL 2 DAY), '美味しかった', 5, NULL),
(1, 'やきとり屋 鳥心', DATE_SUB(NOW(), INTERVAL 1 DAY), 'せせりが最高', 4, NULL);

-- 最近の記録
INSERT INTO eating_records (user_id, animal_part_id, session_id, eaten_at) VALUES
-- 2日前の記録
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'shoulder_loin'), 4, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'beef' AND part_name = 'sagari'), 4, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 1日前の記録
(1, (SELECT id FROM animal_parts WHERE animal_type = 'chicken' AND part_name = 'neck_meat'), 5, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, (SELECT id FROM animal_parts WHERE animal_type = 'chicken' AND part_name = 'heart'), 5, DATE_SUB(NOW(), INTERVAL 1 DAY));