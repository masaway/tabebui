import React, { useState } from 'react'
import PageLayout from '../components/PageLayout'

export default function PartsPage() {
  const [selectedAnimal, setSelectedAnimal] = useState('beef')

  const animalData = {
    beef: {
      name: '牛',
      parts: ['ロース', 'ヒレ', 'サーロイン', 'リブロース', 'カルビ', 'ハラミ', 'タン', 'ミスジ']
    },
    pork: {
      name: '豚',
      parts: ['ロース', 'ヒレ', 'バラ', 'カタ', 'モモ', 'トンソク', 'ホルモン', 'タン']
    },
    chicken: {
      name: '鳥',
      parts: ['モモ', 'ムネ', 'ササミ', '手羽元', '手羽先', 'ボンジリ', 'ハツ', 'レバー']
    }
  }

  return (
    <PageLayout title="食べた部位ページ" showBackButton={true}>

      <div style={{ marginBottom: 24 }}>
        <h2>動物を選択</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(animalData).map(([key, animal]) => (
            <button
              key={key}
              onClick={() => setSelectedAnimal(key)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedAnimal === key ? '#007bff' : '#f8f9fa',
                color: selectedAnimal === key ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {animal.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2>{animalData[selectedAnimal].name}の部位制覇状況</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12 
        }}>
          {animalData[selectedAnimal].parts.map((part, index) => (
            <div
              key={part}
              style={{
                padding: 16,
                backgroundColor: index % 3 === 0 ? '#d4edda' : '#f8d7da',
                border: `1px solid ${index % 3 === 0 ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: 8,
                textAlign: 'center'
              }}
            >
              <strong>{part}</strong>
              <div style={{ fontSize: '12px', marginTop: 4 }}>
                {index % 3 === 0 ? '✅ 制覇済み' : '❌ 未制覇'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <p>制覇率: {animalData[selectedAnimal].name} {Math.floor(animalData[selectedAnimal].parts.filter((_, i) => i % 3 === 0).length / animalData[selectedAnimal].parts.length * 100)}%</p>
      </div>
    </PageLayout>
  )
}