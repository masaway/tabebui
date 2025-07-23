// 部位マスターデータとユーティリティ関数

// 部位マスターデータ
const ANIMAL_PARTS = {
    beef: [
        { id: 'beef_1', name: 'サーロイン', nameKana: 'さーろいん', rarity: 'rare', description: '柔らかく脂身と赤身のバランスが絶妙な高級部位' },
        { id: 'beef_2', name: 'ヒレ', nameKana: 'ひれ', rarity: 'legendary', description: '最も柔らかく脂肪が少ない最高級部位' },
        { id: 'beef_3', name: 'リブロース', nameKana: 'りぶろーす', rarity: 'rare', description: '霜降りが美しく、ステーキに最適な部位' },
        { id: 'beef_4', name: 'バラ', nameKana: 'ばら', rarity: 'common', description: '赤身と脂身が層になった焼肉の定番部位' },
        { id: 'beef_5', name: 'モモ', nameKana: 'もも', rarity: 'common', description: '赤身が多く、煮込み料理にも適した部位' },
        { id: 'beef_6', name: 'スネ', nameKana: 'すね', rarity: 'common', description: 'コラーゲンが豊富で、煮込むと美味しくなる部位' },
        { id: 'beef_7', name: 'タン', nameKana: 'たん', rarity: 'uncommon', description: '牛の舌で、独特の食感と旨味がある' },
        { id: 'beef_8', name: 'ハラミ', nameKana: 'はらみ', rarity: 'uncommon', description: '横隔膜の一部で、柔らかく濃厚な味わい' },
        { id: 'beef_9', name: 'カルビ', nameKana: 'かるび', rarity: 'common', description: 'あばら骨周辺の肉で、脂身が多い焼肉の王道' },
        { id: 'beef_10', name: 'ミノ', nameKana: 'みの', rarity: 'uncommon', description: '第一胃で、コリコリとした食感が特徴' },
        { id: 'beef_11', name: 'センマイ', nameKana: 'せんまい', rarity: 'uncommon', description: '第三胃で、さっぱりとした味わい' },
        { id: 'beef_12', name: 'ハツ', nameKana: 'はつ', rarity: 'uncommon', description: '心臓で、歯ごたえがあり濃厚な味' },
        { id: 'beef_13', name: 'レバー', nameKana: 'ればー', rarity: 'common', description: '肝臓で、栄養豊富で独特の風味' },
        { id: 'beef_14', name: 'テール', nameKana: 'てーる', rarity: 'rare', description: '尻尾で、煮込み料理に使われる' },
        { id: 'beef_15', name: 'ユッケ', nameKana: 'ゆっけ', rarity: 'rare', description: '生食用の新鮮な赤身肉' }
    ],
    pork: [
        { id: 'pork_1', name: 'ロース', nameKana: 'ろーす', rarity: 'common', description: '背中の肉で、トンカツに最適' },
        { id: 'pork_2', name: 'バラ', nameKana: 'ばら', rarity: 'common', description: '三枚肉とも呼ばれ、脂身と赤身が層になっている' },
        { id: 'pork_3', name: 'モモ', nameKana: 'もも', rarity: 'common', description: '後ろ脚の肉で、脂肪が少なくヘルシー' },
        { id: 'pork_4', name: '肩', nameKana: 'かた', rarity: 'common', description: '前脚の肉で、煮込み料理に向いている' },
        { id: 'pork_5', name: 'ヒレ', nameKana: 'ひれ', rarity: 'uncommon', description: '最も柔らかく脂肪が少ない部位' },
        { id: 'pork_6', name: 'タン', nameKana: 'たん', rarity: 'uncommon', description: '豚の舌で、コリコリとした食感' },
        { id: 'pork_7', name: 'ガツ', nameKana: 'がつ', rarity: 'uncommon', description: '胃で、独特の歯ごたえがある' },
        { id: 'pork_8', name: 'ハツ', nameKana: 'はつ', rarity: 'uncommon', description: '心臓で、しっかりとした食感' },
        { id: 'pork_9', name: 'レバー', nameKana: 'ればー', rarity: 'common', description: '肝臓で、栄養価が高い' },
        { id: 'pork_10', name: 'カシラ', nameKana: 'かしら', rarity: 'uncommon', description: '頬肉で、程よい脂身がある' },
        { id: 'pork_11', name: 'トントロ', nameKana: 'とんとろ', rarity: 'rare', description: '首から肩にかけての希少部位' },
        { id: 'pork_12', name: 'テール', nameKana: 'てーる', rarity: 'rare', description: '尻尾で、コラーゲンが豊富' }
    ],
    chicken: [
        { id: 'chicken_1', name: '胸肉', nameKana: 'むねにく', rarity: 'common', description: '胸部の肉で、あっさりとしてヘルシー' },
        { id: 'chicken_2', name: 'モモ肉', nameKana: 'ももにく', rarity: 'common', description: '脚の肉で、ジューシーで旨味が強い' },
        { id: 'chicken_3', name: 'ササミ', nameKana: 'ささみ', rarity: 'common', description: '胸肉の一部で、最も脂肪が少ない' },
        { id: 'chicken_4', name: '手羽先', nameKana: 'てばさき', rarity: 'common', description: '翼の先端部分で、ゼラチン質が豊富' },
        { id: 'chicken_5', name: '手羽元', nameKana: 'てばもと', rarity: 'common', description: '翼の根元部分で、骨付きで食べ応えあり' },
        { id: 'chicken_6', name: '皮', nameKana: 'かわ', rarity: 'uncommon', description: '焼くとパリパリになる脂身の多い部位' },
        { id: 'chicken_7', name: '砂肝', nameKana: 'すなぎも', rarity: 'uncommon', description: '筋胃で、コリコリとした独特の食感' },
        { id: 'chicken_8', name: 'ハツ', nameKana: 'はつ', rarity: 'uncommon', description: '心臓で、小さいが濃厚な味わい' }
    ]
};

// 希少度情報
const RARITY_INFO = {
    common: { stars: 1, color: '#95a5a6', label: '一般的' },
    uncommon: { stars: 2, color: '#f39c12', label: '珍しい' },
    rare: { stars: 3, color: '#e74c3c', label: '希少' },
    legendary: { stars: 4, color: '#9b59b6', label: '伝説' }
};

// 動物情報
const ANIMAL_INFO = {
    beef: { 
        name: '牛', 
        icon: '🐄', 
        color: '#e74c3c',
        totalParts: 15,
        description: '高級部位から庶民的な部位まで、様々な味わいが楽しめる'
    },
    pork: { 
        name: '豚', 
        icon: '🐷', 
        color: '#f368e0',
        totalParts: 12,
        description: '柔らかく食べやすい部位が多く、様々な料理に活用される'
    },
    chicken: { 
        name: '鳥', 
        icon: '🐔', 
        color: '#f39c12',
        totalParts: 8,
        description: 'ヘルシーで食べやすく、部位による食感の違いが楽しめる'
    }
};

// ユーティリティ関数

// 全部位取得
function getAllParts() {
    const allParts = [];
    Object.keys(ANIMAL_PARTS).forEach(animalType => {
        ANIMAL_PARTS[animalType].forEach(part => {
            allParts.push({ ...part, animalType });
        });
    });
    return allParts;
}

// 動物別部位取得
function getPartsByAnimal(animalType) {
    return ANIMAL_PARTS[animalType] || [];
}

// 部位ID取得
function getPartById(partId) {
    const allParts = getAllParts();
    return allParts.find(part => part.id === partId);
}

// 希少度星マーク生成
function getRarityStars(rarity) {
    const info = RARITY_INFO[rarity];
    if (!info) return '';
    
    return '⭐'.repeat(info.stars);
}

// 希少度情報取得
function getRarityInfo(rarity) {
    return RARITY_INFO[rarity] || RARITY_INFO.common;
}

// 動物情報取得
function getAnimalInfo(animalType) {
    return ANIMAL_INFO[animalType];
}

// 動物別総部位数取得
function getTotalPartsByAnimal(animalType) {
    return ANIMAL_PARTS[animalType]?.length || 0;
}

// 食べた部位ID取得（LocalStorageから）
function getEatenParts() {
    const saved = localStorage.getItem('tabebui_eaten_parts');
    return saved ? JSON.parse(saved) : [];
}

// 食べた部位保存
function saveEatenParts(eatenParts) {
    localStorage.setItem('tabebui_eaten_parts', JSON.stringify(eatenParts));
}

// 部位が食べられているかチェック
function isPartEaten(partId) {
    const eatenParts = getEatenParts();
    return eatenParts.includes(partId);
}

// 部位を食べたとしてマーク
function markPartAsEaten(partId) {
    const eatenParts = getEatenParts();
    if (!eatenParts.includes(partId)) {
        eatenParts.push(partId);
        saveEatenParts(eatenParts);
        return true; // 新規記録
    }
    return false; // 既に記録済み
}

// 動物別制覇率計算
function getCompletionRate(animalType) {
    const totalParts = getTotalPartsByAnimal(animalType);
    if (totalParts === 0) return 0;
    
    const eatenParts = getEatenParts();
    const animalParts = getPartsByAnimal(animalType);
    const eatenCount = animalParts.filter(part => eatenParts.includes(part.id)).length;
    
    return Math.round((eatenCount / totalParts) * 100);
}

// 全体制覇率計算
function getOverallCompletionRate() {
    const allParts = getAllParts();
    const eatenParts = getEatenParts();
    
    if (allParts.length === 0) return 0;
    return Math.round((eatenParts.length / allParts.length) * 100);
}

// 動物別統計取得
function getAnimalStats(animalType) {
    const totalParts = getTotalPartsByAnimal(animalType);
    const eatenParts = getEatenParts();
    const animalParts = getPartsByAnimal(animalType);
    const eatenCount = animalParts.filter(part => eatenParts.includes(part.id)).length;
    const completionRate = getCompletionRate(animalType);
    
    return {
        total: totalParts,
        eaten: eatenCount,
        remaining: totalParts - eatenCount,
        completionRate
    };
}

// 全体統計取得
function getOverallStats() {
    const allParts = getAllParts();
    const eatenParts = getEatenParts();
    const completionRate = getOverallCompletionRate();
    
    const animalStats = {};
    Object.keys(ANIMAL_PARTS).forEach(animalType => {
        animalStats[animalType] = getAnimalStats(animalType);
    });
    
    return {
        total: allParts.length,
        eaten: eatenParts.length,
        remaining: allParts.length - eatenParts.length,
        completionRate,
        animals: animalStats
    };
}