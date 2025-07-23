// メイン機能とゲーミフィケーション要素

// 初期化とイベント管理

// ページ共通初期化
function initializeApp() {
    // 初回訪問チェック
    if (isFirstVisit()) {
        showWelcomeModal();
    }
    
    // 開発用：サンプルデータ生成ボタン（デモ用）
    if (isDevelopmentMode()) {
        addDevelopmentTools();
    }
}

// 初回訪問チェック
function isFirstVisit() {
    const hasVisited = localStorage.getItem('tabebui_has_visited');
    if (!hasVisited) {
        localStorage.setItem('tabebui_has_visited', 'true');
        return true;
    }
    return false;
}

// 開発モード判定
function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
}

// ゲーミフィケーション関連

// 経験値計算とレベルアップ
function calculateExperience(action, data = {}) {
    let exp = 0;
    
    switch (action) {
        case 'new_part':
            exp = 10; // 新しい部位記録
            break;
        case 'repeat_part':
            exp = 5; // 同じ部位の再記録
            break;
        case 'daily_login':
            exp = 2; // 日次ログイン
            break;
        case 'streak_bonus':
            exp = data.days * 5; // 連続記録ボーナス
            break;
        case 'rare_part':
            exp = 15; // 希少部位
            break;
        case 'legendary_part':
            exp = 25; // 伝説部位
            break;
        case 'complete_animal':
            exp = 50; // 動物制覇
            break;
        case 'complete_all':
            exp = 100; // 全制覇
            break;
        default:
            exp = 1;
    }
    
    return exp;
}

// アチーブメント通知
function showAchievementNotification(type, data) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 3s;
        max-width: 300px;
    `;
    
    let content = '';
    switch (type) {
        case 'levelup':
            content = `🎉 レベルアップ！<br>レベル ${data.level} になりました！`;
            break;
        case 'badge':
            content = `🏅 バッジ獲得！<br>「${data.badge}」を獲得しました！`;
            break;
        case 'streak':
            content = `🔥 連続記録！<br>${data.days}日連続で記録中！`;
            break;
        case 'completion':
            content = `🏆 制覇達成！<br>${data.animal}を制覇しました！`;
            break;
        default:
            content = '🎊 おめでとうございます！';
    }
    
    notification.innerHTML = content;
    document.body.appendChild(notification);
    
    // 4秒後に削除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// アニメーション用CSS追加
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .achievement-notification {
            font-weight: bold;
            text-align: center;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);
}

// ウェルカムモーダル
function showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 400px;">
            <div class="modal-header">
                <h3 class="modal-title">🥩 たべぶいへようこそ！</h3>
            </div>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px; line-height: 1.6;">
                    肉部位制覇アプリ「たべぶい」にようこそ！<br>
                    牛・豚・鳥の様々な部位を食べて、制覇を目指しましょう。
                </p>
                <div style="margin-bottom: 20px;">
                    <div style="margin-bottom: 10px;">✅ 部位を記録してレベルアップ</div>
                    <div style="margin-bottom: 10px;">🏅 バッジを集めて達成感を味わう</div>
                    <div style="margin-bottom: 10px;">📊 進捗を確認して次の目標を決める</div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="closeWelcomeModal(); loadSampleData();">
                        サンプルデータで始める
                    </button>
                    <button class="btn btn-outline" onclick="closeWelcomeModal();">
                        空の状態で始める
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // グローバル関数として定義
    window.closeWelcomeModal = function() {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };
}

// 開発ツール追加
function addDevelopmentTools() {
    const devPanel = document.createElement('div');
    devPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        display: none;
    `;
    
    devPanel.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">開発ツール</div>
        <button onclick="loadSampleData()" style="margin: 2px; padding: 5px 8px; font-size: 11px;">サンプルデータ</button>
        <button onclick="resetAllData()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #e74c3c; border: none; color: white;">リセット</button>
        <button onclick="showAllBadges()" style="margin: 2px; padding: 5px 8px; font-size: 11px;">全バッジ</button>
        <button onclick="addExperience(100)" style="margin: 2px; padding: 5px 8px; font-size: 11px;">+100XP</button>
    `;
    
    document.body.appendChild(devPanel);
    
    // トグルボタン
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '🔧';
    toggleBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: #764ba2;
        color: white;
        font-size: 16px;
        cursor: pointer;
        z-index: 1001;
    `;
    
    toggleBtn.onclick = () => {
        devPanel.style.display = devPanel.style.display === 'none' ? 'block' : 'none';
    };
    
    document.body.appendChild(toggleBtn);
    
    // 開発用グローバル関数
    window.showAllBadges = function() {
        Object.keys(BADGES).forEach(badge => addBadge(badge));
        alert('全てのバッジを獲得しました！');
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        }
    };
    
    window.addExperience = function(exp) {
        updateUserExperience(exp);
        alert(`${exp}XPを獲得しました！`);
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        }
    };
}

// ユーティリティ関数

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 相対日付表示
function getRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今日';
    } else if (diffDays === 1) {
        return '昨日';
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks}週間前`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months}ヶ月前`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years}年前`;
    }
}

// 数値フォーマット
function formatNumber(num) {
    return num.toLocaleString('ja-JP');
}

// パーセンテージ計算
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// ランダム要素

// 今日の名言・メッセージ
function getTodayMessage() {
    const messages = [
        '今日はどの部位に挑戦しますか？',
        '新しい味との出会いがあなたを待っています',
        '制覇への道のりを楽しみましょう！',
        '美味しい発見は人生を豊かにします',
        '一歩ずつ、確実に制覇を目指しましょう',
        '今日も素晴らしい食体験を！',
        'あなたの味覚の冒険が始まります',
        '部位制覇マスターへの道のり、頑張って！'
    ];
    
    const today = new Date();
    const index = today.getDate() % messages.length;
    return messages[index];
}

// おすすめ部位提案
function getRecommendedPart() {
    const eatenParts = getEatenParts();
    const allParts = getAllParts();
    const uneatnParts = allParts.filter(part => !eatenParts.includes(part.id));
    
    if (uneatnParts.length === 0) {
        return null; // 全制覇済み
    }
    
    // 希少度でソート（珍しいものを優先）
    uneatnParts.sort((a, b) => {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, legendary: 4 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
    
    return uneatnParts[0];
}

// データ同期・バックアップ

// データエクスポート
function exportData() {
    const data = {
        records: getRecords(),
        eatenParts: getEatenParts(),
        userLevel: getUserLevel(),
        userExperience: getUserExperience(),
        userBadges: getUserBadges(),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabebui_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// データインポート
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.version || !data.records) {
                throw new Error('無効なデータファイルです');
            }
            
            if (confirm('現在のデータを上書きしてインポートしますか？')) {
                // データ復元
                localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data.records));
                localStorage.setItem(STORAGE_KEYS.EATEN_PARTS, JSON.stringify(data.eatenParts));
                localStorage.setItem(STORAGE_KEYS.USER_LEVEL, data.userLevel.toString());
                localStorage.setItem(STORAGE_KEYS.USER_EXP, data.userExperience.toString());
                localStorage.setItem(STORAGE_KEYS.USER_BADGES, JSON.stringify(data.userBadges));
                
                alert('データをインポートしました！');
                window.location.reload();
            }
        } catch (error) {
            alert('データの読み込みに失敗しました: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// パフォーマンス最適化

// LocalStorage容量チェック
function checkStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length;
        }
    }
    
    // 5MB以上で警告
    if (totalSize > 5 * 1024 * 1024) {
        console.warn('LocalStorage使用量が大きくなっています:', (totalSize / 1024 / 1024).toFixed(2) + 'MB');
    }
    
    return totalSize;
}

// 古いデータの自動削除
function cleanupOldData() {
    const records = getRecords();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const filteredRecords = records.filter(record => 
        new Date(record.date) > twoYearsAgo
    );
    
    if (filteredRecords.length < records.length) {
        saveRecords(filteredRecords);
        rebuildEatenParts();
        console.log(`古いデータを${records.length - filteredRecords.length}件削除しました`);
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', function() {
    addNotificationStyles();
    initializeApp();
    
    // 定期的なメンテナンス
    setTimeout(() => {
        checkStorageUsage();
        cleanupOldData();
    }, 5000);
});

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('アプリケーションエラー:', e.error);
    
    // 重要なエラーの場合はユーザーに通知
    if (e.error && e.error.message.includes('localStorage')) {
        alert('データの保存に問題があります。ブラウザの設定を確認してください。');
    }
});