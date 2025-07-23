// 記録管理とデータ永続化

// LocalStorageキー
const STORAGE_KEYS = {
    RECORDS: 'tabebui_records',
    USER_LEVEL: 'tabebui_user_level',
    USER_EXP: 'tabebui_user_experience',
    USER_BADGES: 'tabebui_user_badges',
    EATEN_PARTS: 'tabebui_eaten_parts'
};

// 記録データ構造
/*
Record: {
    id: string (UUID),
    partId: string,
    date: string (YYYY-MM-DD),
    memo: string,
    rating: number (1-5),
    restaurant: string,
    createdAt: timestamp
}
*/

// ユーティリティ関数

// UUID生成
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 記録関連

// 全記録取得
function getRecords() {
    const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return saved ? JSON.parse(saved) : [];
}

// 記録保存
function saveRecords(records) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

// 記録追加
function addRecord(recordData) {
    const records = getRecords();
    
    // 新しい記録作成
    const record = {
        id: generateUUID(),
        partId: recordData.partId,
        date: recordData.date,
        memo: recordData.memo || '',
        rating: recordData.rating || 5,
        restaurant: recordData.restaurant || '',
        createdAt: new Date().toISOString()
    };
    
    // 部位が初回記録かチェック
    const isNewPart = markPartAsEaten(recordData.partId);
    
    // 記録追加
    records.push(record);
    saveRecords(records);
    
    return isNewPart; // 新しい部位かどうかを返す
}

// 記録更新
function updateRecord(recordId, updates) {
    const records = getRecords();
    const index = records.findIndex(r => r.id === recordId);
    
    if (index !== -1) {
        records[index] = { ...records[index], ...updates };
        saveRecords(records);
        return true;
    }
    
    return false;
}

// 記録削除
function deleteRecord(recordId) {
    const records = getRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);
    
    if (filteredRecords.length !== records.length) {
        saveRecords(filteredRecords);
        
        // 食べた部位リストを再構築
        rebuildEatenParts();
        return true;
    }
    
    return false;
}

// 部位IDで記録検索
function getRecordsByPartId(partId) {
    const records = getRecords();
    return records.filter(r => r.partId === partId);
}

// 日付範囲で記録検索
function getRecordsByDateRange(startDate, endDate) {
    const records = getRecords();
    return records.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
}

// 今日の記録取得
function getTodayRecords() {
    const today = new Date().toISOString().split('T')[0];
    return getRecordsByDateRange(today, today);
}

// 今月の記録取得
function getThisMonthRecords() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return getRecordsByDateRange(startOfMonth, endOfMonth);
}

// 食べた部位リスト再構築
function rebuildEatenParts() {
    const records = getRecords();
    const eatenParts = [...new Set(records.map(r => r.partId))];
    saveEatenParts(eatenParts);
}

// ユーザーレベル・経験値管理

// ユーザーレベル取得
function getUserLevel() {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_LEVEL);
    return saved ? parseInt(saved) : 1;
}

// ユーザー経験値取得
function getUserExperience() {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_EXP);
    return saved ? parseInt(saved) : 0;
}

// ユーザーレベル保存
function saveUserLevel(level) {
    localStorage.setItem(STORAGE_KEYS.USER_LEVEL, level.toString());
}

// ユーザー経験値保存
function saveUserExperience(exp) {
    localStorage.setItem(STORAGE_KEYS.USER_EXP, exp.toString());
}

// 経験値更新とレベルアップチェック
function updateUserExperience(expGain) {
    const currentExp = getUserExperience();
    const currentLevel = getUserLevel();
    const newExp = currentExp + expGain;
    
    // 経験値保存
    saveUserExperience(newExp);
    
    // レベルアップチェック
    const newLevel = calculateLevel(newExp);
    if (newLevel > currentLevel) {
        saveUserLevel(newLevel);
        return newLevel; // 新しいレベルを返す
    }
    
    return currentLevel;
}

// レベル計算（経験値から）
function calculateLevel(exp) {
    // 100XPごとにレベルアップ
    return Math.floor(exp / 100) + 1;
}

// 次のレベルまでの経験値
function getExpToNextLevel() {
    const currentExp = getUserExperience();
    const currentLevel = getUserLevel();
    const expForNextLevel = currentLevel * 100;
    return Math.max(0, expForNextLevel - currentExp);
}

// 現在レベルでの進捗率
function getCurrentLevelProgress() {
    const currentExp = getUserExperience();
    const currentLevel = getUserLevel();
    const expInCurrentLevel = currentExp - ((currentLevel - 1) * 100);
    return Math.min(100, expInCurrentLevel);
}

// バッジ管理

// バッジ定義
const BADGES = {
    'はじめの一歩': { condition: 'firstRecord', description: '初回記録達成' },
    '牛マスター': { condition: 'beefComplete', description: '牛の全部位制覇' },
    '豚マスター': { condition: 'porkComplete', description: '豚の全部位制覇' },
    '鳥マスター': { condition: 'chickenComplete', description: '鳥の全部位制覇' },
    '部位コレクター': { condition: 'parts10', description: '10部位制覇' },
    '部位マニア': { condition: 'parts25', description: '25部位制覇' },
    '制覇王': { condition: 'allComplete', description: '全動物制覇達成' },
    '連続記録': { condition: 'streak3', description: '3日連続記録' },
    '今日も頑張る': { condition: 'todayRecord', description: '今日の記録達成' },
    'グルメ': { condition: 'rating4plus', description: '高評価記録10回' },
    '冒険家': { condition: 'rareEaten', description: '希少部位を制覇' }
};

// ユーザーバッジ取得
function getUserBadges() {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_BADGES);
    return saved ? JSON.parse(saved) : [];
}

// ユーザーバッジ保存
function saveUserBadges(badges) {
    localStorage.setItem(STORAGE_KEYS.USER_BADGES, JSON.stringify(badges));
}

// バッジ追加
function addBadge(badgeName) {
    const badges = getUserBadges();
    if (!badges.includes(badgeName)) {
        badges.push(badgeName);
        saveUserBadges(badges);
        return true; // 新しいバッジ
    }
    return false; // 既に持っている
}

// バッジ獲得チェック
function checkAndAwardBadges() {
    const newBadges = [];
    const records = getRecords();
    const eatenParts = getEatenParts();
    const stats = getOverallStats();
    
    // はじめの一歩
    if (records.length >= 1 && addBadge('はじめの一歩')) {
        newBadges.push('はじめの一歩');
    }
    
    // 部位コレクター
    if (eatenParts.length >= 10 && addBadge('部位コレクター')) {
        newBadges.push('部位コレクター');
    }
    
    // 部位マニア
    if (eatenParts.length >= 25 && addBadge('部位マニア')) {
        newBadges.push('部位マニア');
    }
    
    // 動物マスター
    ['beef', 'pork', 'chicken'].forEach(animal => {
        const animalStats = getAnimalStats(animal);
        if (animalStats.completionRate === 100) {
            const badgeName = animal === 'beef' ? '牛マスター' : 
                             animal === 'pork' ? '豚マスター' : '鳥マスター';
            if (addBadge(badgeName)) {
                newBadges.push(badgeName);
            }
        }
    });
    
    // 制覇王
    if (stats.completionRate === 100 && addBadge('制覇王')) {
        newBadges.push('制覇王');
    }
    
    // 今日の記録
    const todayRecords = getTodayRecords();
    if (todayRecords.length > 0 && addBadge('今日も頑張る')) {
        newBadges.push('今日も頑張る');
    }
    
    // グルメ（4つ星以上の記録が10回）
    const highRatingRecords = records.filter(r => r.rating >= 4);
    if (highRatingRecords.length >= 10 && addBadge('グルメ')) {
        newBadges.push('グルメ');
    }
    
    // 冒険家（希少部位を食べた）
    const rarePartsEaten = eatenParts.some(partId => {
        const part = getPartById(partId);
        return part && (part.rarity === 'rare' || part.rarity === 'legendary');
    });
    if (rarePartsEaten && addBadge('冒険家')) {
        newBadges.push('冒険家');
    }
    
    return newBadges;
}

// 統計データ

// 月別記録統計
function getMonthlyStats(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const records = getRecordsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );
    
    return {
        recordCount: records.length,
        uniqueParts: new Set(records.map(r => r.partId)).size,
        averageRating: records.length > 0 ? 
            records.reduce((sum, r) => sum + r.rating, 0) / records.length : 0,
        topRatedParts: getTopRatedParts(records)
    };
}

// 高評価部位取得
function getTopRatedParts(records) {
    const partRatings = {};
    
    records.forEach(record => {
        if (!partRatings[record.partId]) {
            partRatings[record.partId] = { sum: 0, count: 0 };
        }
        partRatings[record.partId].sum += record.rating;
        partRatings[record.partId].count += 1;
    });
    
    return Object.entries(partRatings)
        .map(([partId, data]) => ({
            partId,
            averageRating: data.sum / data.count,
            recordCount: data.count
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);
}

// 連続記録日数計算
function getStreakDays() {
    const records = getRecords().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (records.length === 0) return 0;
    
    const today = new Date();
    const recordDates = [...new Set(records.map(r => r.date))].sort().reverse();
    
    let streak = 0;
    let checkDate = new Date(today);
    
    for (const dateStr of recordDates) {
        const recordDate = new Date(dateStr);
        const diffDays = Math.floor((checkDate - recordDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
            checkDate = new Date(recordDate);
        } else if (diffDays === streak + 1) {
            // 今日の記録がない場合、昨日から数える
            if (streak === 0) {
                streak++;
                checkDate = new Date(recordDate);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    
    return streak;
}

// データ初期化・リセット

// 全データリセット
function resetAllData() {
    if (confirm('本当に全てのデータをリセットしますか？この操作は取り消せません。')) {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // ページリロード
        window.location.reload();
    }
}

// サンプルデータ投入
function loadSampleData() {
    if (getRecords().length > 0) {
        if (!confirm('既存のデータがあります。サンプルデータを追加しますか？')) {
            return;
        }
    }
    
    const sampleRecords = [
        {
            partId: 'beef_1', // サーロイン
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            memo: '柔らかくて美味しかった！高級レストランで食べました。',
            rating: 5,
            restaurant: '高級ステーキ店'
        },
        {
            partId: 'pork_1', // ロース
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            memo: 'トンカツにして食べました。サクサクで最高！',
            rating: 4,
            restaurant: 'とんかつ店'
        },
        {
            partId: 'chicken_1', // 胸肉
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            memo: 'ヘルシーで食べやすい。鶏ハムにして食べました。',
            rating: 4,
            restaurant: '自宅'
        },
        {
            partId: 'beef_7', // タン
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            memo: 'コリコリした食感が癖になる！焼肉で食べました。',
            rating: 5,
            restaurant: '焼肉店'
        }
    ];
    
    sampleRecords.forEach(data => {
        addRecord(data);
    });
    
    // 経験値とバッジ更新
    updateUserExperience(40); // 4記録 × 10XP
    checkAndAwardBadges();
    
    alert('サンプルデータを追加しました！');
}