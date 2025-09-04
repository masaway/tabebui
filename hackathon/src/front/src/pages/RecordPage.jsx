import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

export default function RecordPage() {
  const [selectedAnimal, setSelectedAnimal] = useState('')
  const [selectedPart, setSelectedPart] = useState('')
  const navigate = useNavigate()

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedAnimal && selectedPart) {
      alert(`${animalData[selectedAnimal].name}の${selectedPart}を記録しました！`)
      navigate('/')
    }
  }

  return (
    <PageLayout title="部位を記録する" showBackButton={true}>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <h2>1. 動物を選択</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(animalData).map(([key, animal]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedAnimal(key)
                  setSelectedPart('')
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: selectedAnimal === key ? '#007bff' : '#f8f9fa',
                  color: selectedAnimal === key ? 'white' : 'black',
                  border: '2px solid #007bff',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {animal.name}
              </button>
            ))}
          </div>
        </div>

        {selectedAnimal && (
          <div style={{ marginBottom: 24 }}>
            <h2>2. 部位を選択</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 12 
            }}>
              {animalData[selectedAnimal].parts.map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => setSelectedPart(part)}
                  style={{
                    padding: '12px 8px',
                    backgroundColor: selectedPart === part ? '#28a745' : '#f8f9fa',
                    color: selectedPart === part ? 'white' : 'black',
                    border: '2px solid #28a745',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedAnimal && selectedPart && (
          <div style={{ marginBottom: 24 }}>
            <h2>3. 記録する</h2>
            <div style={{ 
              padding: 16, 
              backgroundColor: '#e9ecef', 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <p><strong>選択内容:</strong></p>
              <p>動物: {animalData[selectedAnimal].name}</p>
              <p>部位: {selectedPart}</p>
            </div>
            
            <button
              type="submit"
              style={{
                padding: '16px 32px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              記録する
            </button>
          </div>
        )}
      </form>
    </PageLayout>
  )
}