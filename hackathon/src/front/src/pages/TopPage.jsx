import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const styles = {
  container: {
    maxWidth: '480px',
    margin: '0 auto',
    paddingBottom: '80px'
  },
  welcomeSection: {
    background: 'linear-gradient(135deg, #d73027 0%, #fc4e2a 50%, #fd8c3c 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(215, 48, 39, 0.3)'
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '0 0 6px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  welcomeSubtitle: {
    fontSize: '15px',
    opacity: 0.95,
    margin: 0,
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
  },
  statsRow: {
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    padding: '14px 18px',
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    border: '2px solid #CD853F',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0'
  },
  statItem: {
    textAlign: 'center',
    padding: '0 4px'
  },
  statNumber: {
    fontSize: '19px',
    fontWeight: 'bold',
    color: '#FFE4B5',
    margin: '0 0 3px 0',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
  },
  statLabel: {
    fontSize: '11px',
    color: '#F5DEB3',
    margin: 0,
    lineHeight: 1.2,
    fontWeight: '500'
  },
  progressSection: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '17px',
    fontWeight: 'bold',
    color: '#FFE4B5',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  progressCard: {
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    padding: '18px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    border: '2px solid #CD853F'
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF4500 0%, #FF6347 50%, #FFA500 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
    boxShadow: '0 1px 3px rgba(255, 69, 0, 0.4)'
  },
  animalProgress: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
    gap: '8px'
  },
  animalItem: {
    flex: 1,
    textAlign: 'center',
    padding: '12px 8px',
    background: 'linear-gradient(135deg, #D2691E 0%, #CD853F 100%)',
    borderRadius: '8px',
    border: '1px solid #DAA520',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
  },
  animalEmoji: {
    fontSize: '20px',
    marginBottom: '4px'
  },
  animalName: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#2F1B14',
    margin: '0 0 3px 0',
    textShadow: '0 1px 1px rgba(255,255,255,0.3)'
  },
  animalProgressText: {
    fontSize: '12px',
    color: '#2F1B14',
    margin: 0,
    fontWeight: '600',
    textShadow: '0 1px 1px rgba(255,255,255,0.2)'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  actionCard: {
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    border: '2px solid #CD853F',
    textDecoration: 'none',
    color: '#FFE4B5',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    textAlign: 'center'
  },
  actionCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
  },
  actionIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  actionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 6px 0',
    color: '#FFE4B5',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  actionDescription: {
    fontSize: '12px',
    color: '#F5DEB3',
    margin: 0,
    lineHeight: 1.3
  },
  recentSection: {
    marginBottom: '32px'
  },
  recentList: {
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    border: '2px solid #CD853F',
    overflow: 'hidden'
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px',
    borderBottom: '1px solid rgba(205, 133, 63, 0.3)',
    gap: '12px'
  },
  recentItemLast: {
    borderBottom: 'none'
  },
  recentImage: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #D2691E 0%, #CD853F 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    border: '1px solid #DAA520'
  },
  recentContent: {
    flex: 1
  },
  recentTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFE4B5',
    margin: '0 0 3px 0',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  recentMeta: {
    fontSize: '11px',
    color: '#F5DEB3',
    margin: 0
  },
  floatingConcierge: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000
  },
  conciergeButton: {
    width: '68px',
    height: '68px',
    borderRadius: '34px',
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6347 30%, #FFA500 70%, #FF8C00 100%)',
    border: '3px solid #8B0000',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    boxShadow: '0 6px 25px rgba(255, 69, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    animation: 'fireGlow 1.5s infinite alternate',
    textDecoration: 'none'
  },
  conciergeButtonHover: {
    transform: 'scale(1.15)',
    boxShadow: '0 8px 30px rgba(255, 69, 0, 0.7), inset 0 1px 3px rgba(255, 255, 255, 0.4)'
  },
  conciergeTooltip: {
    position: 'absolute',
    bottom: '76px',
    right: '0',
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    color: '#FFE4B5',
    padding: '10px 14px',
    borderRadius: '20px',
    border: '2px solid #CD853F',
    fontSize: '13px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    opacity: 0,
    transform: 'translateY(10px)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  conciergeTooltipVisible: {
    opacity: 1,
    transform: 'translateY(0)'
  },
  conciergeTooltipArrow: {
    position: 'absolute',
    bottom: '-6px',
    right: '22px',
    width: '10px',
    height: '10px',
    background: '#8B4513',
    border: '1px solid #CD853F',
    transform: 'rotate(45deg)'
  }
}

export default function TopPage() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // APIからダッシュボード統計を取得
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard-stats?user_id=1')
        const result = await response.json()

        if (result.success) {
          setDashboardData(result.data)
        } else {
          throw new Error('データの取得に失敗しました')
        }
      } catch (err) {
        setError(err.message)
        console.error('API Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  // 時間差を表示用に計算する関数
  const getTimeAgo = (dateString) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now - past
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}日前`
    } else if (diffHours > 0) {
      return `${diffHours}時間前`
    } else {
      return '1時間以内'
    }
  }

  // 動物タイプの絵文字を取得
  const getAnimalEmoji = (animalType) => {
    switch (animalType) {
      case 'beef': return '🐄'
      case 'pork': return '🐷'
      case 'chicken': return '🐔'
      default: return '🥩'
    }
  }

  // ローディング中の表示
  if (loading) {
    return (
      <PageLayout title="たべぶい">
        <div style={styles.container}>
          <section style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>データを読み込み中...</h1>
            <p style={styles.welcomeSubtitle}>しばらくお待ちください</p>
          </section>
        </div>
      </PageLayout>
    )
  }

  // エラー時の表示
  if (error) {
    return (
      <PageLayout title="たべぶい">
        <div style={styles.container}>
          <section style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>エラーが発生しました</h1>
            <p style={styles.welcomeSubtitle}>{error}</p>
          </section>
        </div>
      </PageLayout>
    )
  }

  // データが読み込まれていない場合
  if (!dashboardData) {
    return (
      <PageLayout title="たべぶい">
        <div style={styles.container}>
          <section style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>データがありません</h1>
            <p style={styles.welcomeSubtitle}>データを確認してください</p>
          </section>
        </div>
      </PageLayout>
    )
  }

  const { overall_stats, animal_stats, activity_stats, recent_records } = dashboardData

  return (
    <PageLayout title="たべぶい">
      <div style={styles.container}>
        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>おかえりなさい！</h1>
          <p style={styles.welcomeSubtitle}>今日も美味しい部位を制覇していきましょう</p>
        </section>

        {/* Stats Row */}
        <section style={styles.statsRow}>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: '#ff6b6b' }}>{overall_stats.conquest_rate}%</div>
              <p style={styles.statLabel}>総制覇率</p>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: '#4ecdc4' }}>{overall_stats.conquered_parts}</div>
              <p style={styles.statLabel}>食べた部位</p>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: '#45b7d1' }}>{activity_stats.week_records}</div>
              <p style={styles.statLabel}>今週記録</p>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: '#96ceb4' }}>{activity_stats.streak_days}</div>
              <p style={styles.statLabel}>連続日</p>
            </div>
          </div>
        </section>

        {/* Progress Section */}
        <section style={styles.progressSection}>
          <h2 style={styles.sectionTitle}>
            📊 制覇進捗
          </h2>
          <div style={styles.progressCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>総合進捗</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' }}>{overall_stats.conquest_rate}%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${overall_stats.conquest_rate}%` }}></div>
            </div>

            <div style={styles.animalProgress}>
              <div style={styles.animalItem}>
                <div style={styles.animalEmoji}>🐄</div>
                <p style={styles.animalName}>牛</p>
                <p style={styles.animalProgressText}>{animal_stats.beef.rate}%</p>
              </div>
              <div style={styles.animalItem}>
                <div style={styles.animalEmoji}>🐷</div>
                <p style={styles.animalName}>豚</p>
                <p style={styles.animalProgressText}>{animal_stats.pork.rate}%</p>
              </div>
              <div style={styles.animalItem}>
                <div style={styles.animalEmoji}>🐔</div>
                <p style={styles.animalName}>鶏</p>
                <p style={styles.animalProgressText}>{animal_stats.chicken.rate}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Grid */}
        <section>
          <h2 style={styles.sectionTitle}>
            🎯 アクション
          </h2>
          <div style={styles.actionGrid}>
            <Link to="/record" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: '#ff6b6b' }}>📸</div>
              <h3 style={styles.actionTitle}>記録する</h3>
              <p style={styles.actionDescription}>新しい部位を記録</p>
            </Link>
            
            <Link to="/parts" style={styles.actionCard}>
              <div style={{ ...styles.actionIcon, color: '#4ecdc4' }}>🥩</div>
              <h3 style={styles.actionTitle}>部位一覧</h3>
              <p style={styles.actionDescription}>制覇状況を確認</p>
            </Link>
            
          </div>
        </section>

        {/* Recent Records */}
        <section style={styles.recentSection}>
          <h2 style={styles.sectionTitle}>
            📝 最近の記録
          </h2>
          <div style={styles.recentList}>
            {recent_records.length > 0 ? (
              recent_records.map((record, index) => {
                const isLast = index === recent_records.length - 1
                const animalName = record.animal_type === 'beef' ? '牛' :
                                 record.animal_type === 'pork' ? '豚' : '鶏'

                return (
                  <div
                    key={`${record.part_name_jp}-${record.eaten_at}`}
                    style={{
                      ...styles.recentItem,
                      ...(isLast ? styles.recentItemLast : {})
                    }}
                  >
                    <div style={styles.recentImage}>
                      {getAnimalEmoji(record.animal_type)}
                    </div>
                    <div style={styles.recentContent}>
                      <p style={styles.recentTitle}>
                        {record.part_name_jp}（{animalName}）
                      </p>
                      <p style={styles.recentMeta}>
                        {record.restaurant_name || '店舗名なし'} • {getTimeAgo(record.eaten_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={styles.recentItem}>
                <div style={styles.recentImage}>📝</div>
                <div style={styles.recentContent}>
                  <p style={styles.recentTitle}>まだ記録がありません</p>
                  <p style={styles.recentMeta}>最初の部位を記録してみましょう！</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* フローティングコンシェルジュボタン */}
      <div style={styles.floatingConcierge}>
        <div 
          style={{
            ...styles.conciergeTooltip,
            ...(showTooltip ? styles.conciergeTooltipVisible : {})
          }}
        >
          AIコンシェルジュに相談
          <div style={styles.conciergeTooltipArrow}></div>
        </div>
        <Link 
          to="/concierge"
          style={{
            ...styles.conciergeButton,
            ...(showTooltip ? styles.conciergeButtonHover : {})
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          🤖
        </Link>
      </div>

      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
          }
          
          @keyframes fireGlow {
            0% {
              box-shadow: 0 6px 25px rgba(255, 69, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.3);
            }
            100% {
              box-shadow: 0 8px 35px rgba(255, 69, 0, 0.8), 0 0 0 4px rgba(255, 140, 0, 0.1), inset 0 1px 3px rgba(255, 255, 255, 0.4);
            }
          }
        `}
      </style>
    </PageLayout>
  )
}