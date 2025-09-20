-- tabebui データベースを使用
USE tabebui;
-- 文字化け対策: クライアント接続文字コードをUTF-8に固定
SET NAMES utf8mb4;

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
