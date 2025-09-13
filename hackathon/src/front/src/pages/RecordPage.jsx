import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

export default function RecordPage() {
  const [selectedAnimal, setSelectedAnimal] = useState('')
  const [selectedPart, setSelectedPart] = useState('')
  const [memo, setMemo] = useState('')
  const [eatenDate, setEatenDate] = useState(new Date().toISOString().split('T')[0])
  const [restaurantName, setRestaurantName] = useState('')
  const [address, setAddress] = useState('')
  const [roundNumber, setRoundNumber] = useState(1)
  const navigate = useNavigate()

  const animalData = {
    beef: {
      name: '牛',
      emoji: '🐄',
      color: '#dc3545',
      lightColor: '#f8d7da',
      parts: ['ロース', 'ヒレ', 'サーロイン', 'リブロース', 'カルビ', 'ハラミ', 'タン', 'ミスジ']
    },
    pork: {
      name: '豚',
      emoji: '🐷', 
      color: '#fd7e14',
      lightColor: '#ffecd1',
      parts: ['ロース', 'ヒレ', 'バラ', 'カタ', 'モモ', 'トンソク', 'ホルモン', 'タン']
    },
    chicken: {
      name: '鳥',
      emoji: '🐓',
      color: '#ffc107',
      lightColor: '#fff3cd',
      parts: ['モモ', 'ムネ', 'ササミ', '手羽元', '手羽先', 'ボンジリ', 'ハツ', 'レバー']
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedAnimal && selectedPart) {
      // 記録データをまとめる
      const recordData = {
        animal: selectedAnimal,
        animalName: animalData[selectedAnimal].name,
        part: selectedPart,
        memo,
        eatenDate,
        restaurantName,
        address,
        roundNumber
      }
      
      console.log('記録データ:', recordData)
      alert(`${animalData[selectedAnimal].name}の${selectedPart}を記録しました！`)
      navigate('/')
    }
  }

  return (
    <PageLayout title="🍖 部位を記録する" showBackButton={true}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: 'calc(100vh - 120px)',
        padding: '20px',
        borderRadius: '20px 20px 0 0',
        marginTop: '-10px'
      }}>
        <form onSubmit={handleSubmit} style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {/* 動物選択カード */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              textAlign: 'center',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>🎯 1. 動物を選択</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(animalData).map(([key, animal]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedAnimal(key)
                    setSelectedPart('')
                  }}
                  style={{
                    padding: '20px 16px',
                    backgroundColor: selectedAnimal === key ? animal.color : 'white',
                    color: selectedAnimal === key ? 'white' : animal.color,
                    border: `3px solid ${animal.color}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    transform: selectedAnimal === key ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedAnimal === key ? `0 8px 25px ${animal.color}40` : '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{animal.emoji}</div>
                  <div>{animal.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 部位選択カード */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '20px',
              textAlign: 'center',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>🥩 2. 部位を選択</h2>
            
            {selectedAnimal ? (
              <div style={{ 
                marginBottom: '20px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: animalData[selectedAnimal].lightColor,
                border: `2px solid ${animalData[selectedAnimal].color}`,
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  marginBottom: '16px',
                  color: animalData[selectedAnimal].color,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>{animalData[selectedAnimal].emoji}</span>
                  {animalData[selectedAnimal].name}の部位
                  <span style={{ 
                    fontSize: '14px', 
                    backgroundColor: animalData[selectedAnimal].color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    marginLeft: 'auto'
                  }}>選択中</span>
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '12px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  {animalData[selectedAnimal].parts.map((part) => (
                    <button
                      key={`${selectedAnimal}-${part}`}
                      type="button"
                      onClick={() => setSelectedPart(part)}
                      style={{
                        padding: '14px 8px',
                        backgroundColor: selectedPart === part ? animalData[selectedAnimal].color : 'white',
                        color: selectedPart === part ? 'white' : animalData[selectedAnimal].color,
                        border: `2px solid ${animalData[selectedAnimal].color}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: selectedPart === part ? 'bold' : 'normal',
                        transition: 'all 0.2s ease',
                        transform: selectedPart === part ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: selectedPart === part ? `0 4px 12px ${animalData[selectedAnimal].color}40` : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
                fontSize: '16px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                まず上で動物を選択してください
              </div>
            )}
          </div>

          {/* 詳細情報入力カード */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '24px',
              textAlign: 'center',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>📝 3. 詳細情報を入力</h2>
            
            {selectedAnimal && selectedPart ? (
              <>

            {/* メモ入力 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '16px'
              }}>
                💭 メモ（任意）
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="どんな味だった？どこで食べた？お気に入りの食べ方は？など自由に記録してください ✨"
                rows={4}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: '0',
                  padding: '16px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: '#f8faff',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e7ff'}
              />
            </div>

            {/* 日付・お店情報 */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px', 
                  fontWeight: 'bold',
                  color: '#555',
                  fontSize: '16px'
                }}>
                  📅 食べた日付
                </label>
                <input
                  type="date"
                  value={eatenDate}
                  onChange={(e) => setEatenDate(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '12px',
                    border: '2px solid #e0e7ff',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px', 
                  fontWeight: 'bold',
                  color: '#555',
                  fontSize: '16px'
                }}>
                  🔢 何週目？
                </label>
                <select
                  value={roundNumber}
                  onChange={(e) => setRoundNumber(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '12px',
                    border: '2px solid #e0e7ff',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value={1}>1週目 🥇</option>
                  <option value={2}>2週目 🥈</option>
                  <option value={3}>3週目 🥉</option>
                  <option value={4}>4週目 🏆</option>
                  <option value={5}>5週目 👑</option>
                </select>
              </div>
            </div>

            {/* お店情報 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '16px'
              }}>
                🏪 お店の名前（任意）
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="例: 焼肉○○、家庭料理など"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  padding: '14px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e7ff'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px', 
                fontWeight: 'bold',
                color: '#555',
                fontSize: '16px'
              }}>
                📍 住所・場所（任意）
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 東京都渋谷区、自宅など"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  padding: '14px',
                  border: '2px solid #e0e7ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e7ff'}
              />
            </div>


            {/* 記録確認 */}
            {selectedAnimal && selectedPart && (
              <div style={{ 
                padding: '20px', 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '16px',
                marginBottom: '20px',
                color: 'white',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}>
                <h3 style={{ 
                  fontSize: '18px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>✅ 記録内容の確認</h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{animalData[selectedAnimal].emoji}</span>
                    <strong>動物:</strong> {animalData[selectedAnimal].name}
                  </p>
                  <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🥩</span>
                    <strong>部位:</strong> {selectedPart}
                  </p>
                  <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span>
                    <strong>日付:</strong> {eatenDate}
                  </p>
                  <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔢</span>
                    <strong>週目:</strong> {roundNumber}週目
                  </p>
                  {restaurantName && (
                    <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🏪</span>
                      <strong>お店:</strong> {restaurantName}
                    </p>
                  )}
                  {address && (
                    <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📍</span>
                      <strong>場所:</strong> {address}
                    </p>
                  )}
                    {memo && (
                    <p style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span>💭</span>
                      <span><strong>メモ:</strong> {memo}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
            
                <button
                  type="submit"
                  disabled={!selectedAnimal || !selectedPart}
                  style={{
                    padding: '20px 32px',
                    background: selectedAnimal && selectedPart 
                      ? 'linear-gradient(45deg, #ff6b6b, #ff8e8e)' 
                      : 'linear-gradient(45deg, #6c757d, #8d959d)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: selectedAnimal && selectedPart ? 'pointer' : 'not-allowed',
                    width: '100%',
                    boxShadow: selectedAnimal && selectedPart 
                      ? '0 8px 25px rgba(255, 107, 107, 0.3)' 
                      : '0 4px 12px rgba(108, 117, 125, 0.2)',
                    transition: 'all 0.3s ease',
                    transform: selectedAnimal && selectedPart ? 'scale(1)' : 'scale(0.98)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>💾</span>
                  記録を保存する
                </button>
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
                fontSize: '16px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                動物と部位を選択してから入力できます
              </div>
            )}
          </div>
        </form>
      </div>
    </PageLayout>
  )
}