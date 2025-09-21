import React, { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'

export default function PartsPage() {
  const [selectedAnimal, setSelectedAnimal] = useState('beef')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewFilter, setViewFilter] = useState('all') // 'all', 'conquered', 'unconquered'

  // --- Color Palette ---
  const colors = {
    base: '#fdf6f6',
    text: '#333',
    primary: '#d9534f',
    conqueredBg: '#fcf8e3',
    conqueredBorder: '#faebcc',
    unconqueredBg: '#f2dede',
    unconqueredBorder: '#ebcccc',
    progressBarBg: '#f5f5f5',
  }

  // APIからデータを取得
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user-progress?user_id=1')
        const result = await response.json()

        if (result.success) {
          setProgressData(result.data)
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

    fetchProgressData()
  }, [])

  const animalNames = {
    beef: '牛',
    pork: '豚',
    chicken: '鳥'
  }

  const animalColors = {
    beef: '#d2a679',
    pork: '#f0aabf',
    chicken: '#f5d66a'
  }

  const handlePartClick = (part) => {
    setSelectedPart(part)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPart(null)
  }

  // ローディング中の表示
  if (loading) {
    return (
      <PageLayout title="食べた部位ページ" showBackButton={true}>
        <div style={{ backgroundColor: colors.base, color: colors.text, padding: '24px', minHeight: '100vh', textAlign: 'center' }}>
          <div style={{ marginTop: '100px' }}>
            <div style={{ fontSize: '18px', color: colors.text }}>データを読み込み中...</div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // エラー時の表示
  if (error) {
    return (
      <PageLayout title="食べた部位ページ" showBackButton={true}>
        <div style={{ backgroundColor: colors.base, color: colors.text, padding: '24px', minHeight: '100vh', textAlign: 'center' }}>
          <div style={{ marginTop: '100px' }}>
            <div style={{ fontSize: '18px', color: colors.primary }}>エラーが発生しました</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>{error}</div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // データが読み込まれていない場合
  if (!progressData) {
    return (
      <PageLayout title="食べた部位ページ" showBackButton={true}>
        <div style={{ backgroundColor: colors.base, color: colors.text, padding: '24px', minHeight: '100vh', textAlign: 'center' }}>
          <div style={{ marginTop: '100px' }}>
            <div style={{ fontSize: '18px', color: colors.text }}>データがありません</div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // 現在選択されている動物のデータを取得
  const currentAnimalData = progressData.progress[selectedAnimal]
  const currentStats = progressData.stats[selectedAnimal]

  // フィルタリング関数
  const filterParts = (conquered, unconquered) => {
    if (viewFilter === 'conquered') {
      return [conquered, []]
    } else if (viewFilter === 'unconquered') {
      return [[], unconquered]
    }
    return [conquered, unconquered]
  }

  return (
    <PageLayout title="食べた部位ページ" showBackButton={true}>
      <div style={{ backgroundColor: colors.base, color: colors.text, padding: '1px 24px 24px', minHeight: '100vh' }}>

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h2>動物を選択</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '16px 0' }}>
            {Object.entries(animalNames).map(([key, name]) => (
              <div
                key={key}
                onClick={() => setSelectedAnimal(key)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: selectedAnimal === key ? `3px solid ${colors.primary}` : '3px solid transparent',
                  borderRadius: '50%',
                  padding: 4,
                  transition: 'border-color 0.3s'
                }}
              >
                <div style={{
                  width: 80,
                  height: 80,
                  backgroundColor: animalColors[key],
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  {name}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: colors.text }}>
                  {currentStats ? `${currentStats.conquered_count}/${currentStats.total_count}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0 }}>{animalNames[selectedAnimal]}の部位制覇状況</h2>

            {/* フィルタボタン */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: '全て' },
                { key: 'conquered', label: '制覇済み' },
                { key: 'unconquered', label: '未制覇' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setViewFilter(filter.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 16,
                    border: 'none',
                    backgroundColor: viewFilter === filter.key ? colors.primary : '#f0f0f0',
                    color: viewFilter === filter.key ? 'white' : colors.text,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* カテゴリ別表示 */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>🥩 赤身系</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 12,
              marginBottom: '24px'
            }}>
              {(() => {
                const [conquered, unconquered] = filterParts(currentAnimalData.meat.conquered, currentAnimalData.meat.unconquered)
                return [...conquered, ...unconquered]
              })().map((part) => {
                const isConquered = 'first_conquered_date' in part
                return (
                  <div
                    key={`${selectedAnimal}-meat-${part.id}`}
                    onClick={() => handlePartClick(part)}
                    style={{
                      padding: 16,
                      backgroundColor: isConquered ? colors.conqueredBg : colors.unconqueredBg,
                      border: `1px solid ${isConquered ? colors.conqueredBorder : colors.unconqueredBorder}`,
                      borderRadius: 8,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <strong style={{ color: colors.text }}>{part.part_name_jp}</strong>
                    <div style={{ fontSize: '12px', marginTop: 4 }}>
                      {isConquered ? '✅ 制覇済み' : '❌ 未制覇'}
                    </div>
                    <div style={{ fontSize: '10px', marginTop: 2, color: '#666' }}>
                      難易度: {'★'.repeat(part.difficulty_level)}
                    </div>
                  </div>
                )
              })}
            </div>

            <h3 style={{ marginBottom: '16px' }}>🫀 内臓系</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 12
            }}>
              {(() => {
                const [conquered, unconquered] = filterParts(currentAnimalData.organ.conquered, currentAnimalData.organ.unconquered)
                return [...conquered, ...unconquered]
              })().map((part) => {
                const isConquered = 'first_conquered_date' in part
                return (
                  <div
                    key={`${selectedAnimal}-organ-${part.id}`}
                    onClick={() => handlePartClick(part)}
                    style={{
                      padding: 16,
                      backgroundColor: isConquered ? colors.conqueredBg : colors.unconqueredBg,
                      border: `1px solid ${isConquered ? colors.conqueredBorder : colors.unconqueredBorder}`,
                      borderRadius: 8,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <strong style={{ color: colors.text }}>{part.part_name_jp}</strong>
                    <div style={{ fontSize: '12px', marginTop: 4 }}>
                      {isConquered ? '✅ 制覇済み' : '❌ 未制覇'}
                    </div>
                    <div style={{ fontSize: '10px', marginTop: 2, color: '#666' }}>
                      難易度: {'★'.repeat(part.difficulty_level)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 全体統計の可視化 */}
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <h3>全体の制覇状況</h3>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: 24
          }}>
            {/* 全体制覇率 */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
                {progressData.overall_stats.overall_conquest_rate}%
              </div>
              <div style={{ fontSize: '16px', color: colors.text }}>
                全体制覇率 ({progressData.overall_stats.total_conquered}/{progressData.overall_stats.total_parts}部位)
              </div>
            </div>

            {/* 動物別比較 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : 'repeat(3, 1fr)',
              gap: 16
            }}>
              {Object.entries(animalNames).map(([animalType, name]) => {
                const stats = progressData.stats[animalType]
                return (
                  <div
                    key={animalType}
                    onClick={() => setSelectedAnimal(animalType)}
                    style={{
                      textAlign: 'center',
                      padding: 16,
                      backgroundColor: colors.base,
                      borderRadius: 8,
                      border: selectedAnimal === animalType ? `2px solid ${colors.primary}` : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (selectedAnimal !== animalType) {
                        e.currentTarget.style.backgroundColor = '#f8f8f8'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedAnimal !== animalType) {
                        e.currentTarget.style.backgroundColor = colors.base
                      }
                    }}
                  >
                    <div style={{
                      width: 60,
                      height: 60,
                      backgroundColor: animalColors[animalType],
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: 'white',
                      fontWeight: 'bold',
                      margin: '0 auto 8px'
                    }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>
                      {stats.conquest_rate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {stats.conquered_count}/{stats.total_count}部位
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3>{animalNames[selectedAnimal]}の制覇率</h3>

          {/* 全体の制覇率 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '8px' }}>
              <div style={{
                flex: 1,
                backgroundColor: colors.progressBarBg,
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: `${currentStats.conquest_rate}%`,
                  backgroundColor: colors.primary,
                  height: 24,
                  transition: 'width 0.5s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }} />
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '1.2em', minWidth: 60, textAlign: 'right' }}>
                {`${currentStats.conquest_rate}%`}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
              {currentStats.conquered_count}部位 / {currentStats.total_count}部位制覇
            </div>
          </div>

          {/* カテゴリ別制覇率 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : '1fr 1fr',
            gap: 16
          }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>🥩 赤身系</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>
                {Math.round((currentAnimalData.meat.conquered.length / (currentAnimalData.meat.conquered.length + currentAnimalData.meat.unconquered.length) * 100) || 0)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {currentAnimalData.meat.conquered.length}/{currentAnimalData.meat.conquered.length + currentAnimalData.meat.unconquered.length}部位
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>🫀 内臓系</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>
                {Math.round((currentAnimalData.organ.conquered.length / (currentAnimalData.organ.conquered.length + currentAnimalData.organ.unconquered.length) * 100) || 0)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {currentAnimalData.organ.conquered.length}/{currentAnimalData.organ.conquered.length + currentAnimalData.organ.unconquered.length}部位
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && selectedPart && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: 12,
              width: '90%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '100%',
                height: 200,
                backgroundColor: '#f0f0f0',
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#999'
              }}>
                {selectedPart.part_name_jp}のイラスト
              </div>

              <h2 style={{ marginTop: 0, marginBottom: 16, color: colors.text }}>
                {selectedPart.part_name_jp}
              </h2>

              {/* 制覇情報 */}
              {'first_conquered_date' in selectedPart ? (
                <div style={{
                  backgroundColor: colors.conqueredBg,
                  border: `1px solid ${colors.conqueredBorder}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.primary, marginBottom: '8px' }}>
                    ✅ 制覇済み
                  </div>
                  <div style={{ fontSize: '14px', color: colors.text }}>
                    初回制覇: {new Date(selectedPart.first_conquered_date).toLocaleDateString()}
                  </div>
                  {selectedPart.eat_count > 1 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      食べた回数: {selectedPart.eat_count}回
                    </div>
                  )}
                  {selectedPart.restaurants && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      お店: {selectedPart.restaurants}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  backgroundColor: colors.unconqueredBg,
                  border: `1px solid ${colors.unconqueredBorder}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.primary }}>
                    ❌ 未制覇
                  </div>
                </div>
              )}

              {/* 部位の詳細情報 */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16, textAlign: 'left' }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>カテゴリ:</strong> {selectedPart.part_category === 'meat' ? '赤身系' : '内臓系'}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>難易度:</strong> {'★'.repeat(selectedPart.difficulty_level)} ({selectedPart.difficulty_level}/5)
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>英名:</strong> {selectedPart.part_name}
                </div>
                {selectedPart.description && (
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '8px' }}>特徴</h3>
                    <p style={{ color: colors.text, lineHeight: 1.6, margin: 0 }}>
                      {selectedPart.description}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={closeModal}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 16,
                  marginTop: 16,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c9302c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}