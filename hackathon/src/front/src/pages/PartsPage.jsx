import React, { useState } from 'react'
import PageLayout from '../components/PageLayout'

export default function PartsPage() {
  const [selectedAnimal, setSelectedAnimal] = useState('beef')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)

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

  const animalData = {
    beef: {
      name: '牛',
      illustration: { color: '#d2a679' },
      parts: [
        { name: 'ロース', isConquered: true, conqueredDate: '2023-10-01', description: 'きめの細かい肉質で柔らかい部位。脂肪がほど良く霜降り状に分散し、コクのある風味が楽しめる。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ロースのイラスト' },
        { name: 'ヒレ', isConquered: false, conqueredDate: null, description: '極めてきめの細かい柔らかな部位。脂肪が少なく、上品な風味が持ち味。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ヒレのイラスト' },
        { name: 'サーロイン', isConquered: true, conqueredDate: '2023-11-20', description: 'きめが細かく柔らかい、牛肉の最高部位のひとつ。ステーキに最適。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=サーロインのイラスト' },
        { name: 'リブロース', isConquered: false, conqueredDate: null, description: '赤身と脂身のバランスが良く、コクがあって風味の良い部位。ローストビーフやステーキに最適。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=リブロースのイラスト' },
        { name: 'カルビ', isConquered: true, conqueredDate: '2023-09-15', description: '赤身と脂肪が層になった三枚肉。濃厚な風味が特徴で、焼肉や牛丼、すき焼に向いている。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=カルビのイラスト' },
        { name: 'ハラミ', isConquered: false, conqueredDate: null, description: '赤身肉に近い肉質と風味。網焼きやカレー、シチューなどの煮込み料理に向いている。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ハラミのイラスト' },
        { name: 'タン', isConquered: true, conqueredDate: '2024-01-05', description: 'つけ根は脂肪が多くて柔らかく、舌尖はやや筋っぽい。塩焼きやシチューに利用される。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=タンのイラスト' },
        { name: 'ミスジ', isConquered: false, conqueredDate: null, description: '特徴は準備中です。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ミスジのイラスト' },
      ]
    },
    pork: {
      name: '豚',
      illustration: { color: '#f0aabf' },
      parts: [
        { name: 'ロース', isConquered: true, conqueredDate: '2023-10-02', description: 'きめ細かさと脂身のおいしさが持ち味。とんかつやポークソテーに最適。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ロースのイラスト' },
        { name: 'ヒレ', isConquered: false, conqueredDate: null, description: '豚肉の中で最もきめが細かく柔らかい。上品で淡白な味で、かつやソテーなど油を使った料理に適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ヒレのイラスト' },
        { name: 'バラ', isConquered: true, conqueredDate: '2023-11-21', description: '赤身と脂身が三層になった三枚肉。角煮、シチュー、酢豚、炒め物などに適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=バラのイラスト' },
        { name: 'カタ', isConquered: false, conqueredDate: null, description: '肉のきめはやや粗い。薄切りは焼肉や炒め物、角切りは煮込み料理に適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=カタのイラスト' },
        { name: 'モモ', isConquered: false, conqueredDate: null, description: '脂肪が少なくきめが細かい赤身肉。炒め物、煮込み、ローストポークなどに適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=モモのイラスト' },
        { name: 'トンソク', isConquered: true, conqueredDate: '2024-02-10', description: 'ほとんどがゼラチン質で、トロリとした舌ざわり。甘辛味の煮物にするのが定番。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=トンソクのイラスト' },
        { name: 'ホルモン', isConquered: false, conqueredDate: null, description: '特徴は準備中です。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ホルモンのイラスト' },
        { name: 'タン', isConquered: true, conqueredDate: '2024-01-06', description: '特徴は準備中です。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=タンのイラスト' },
      ]
    },
    chicken: {
      name: '鳥',
      illustration: { color: '#f5d66a' },
      parts: [
        { name: 'モモ', isConquered: true, conqueredDate: '2023-10-03', description: 'むね肉に比べてコクがある。照り焼き、ロースト、フライ、から揚げなどに適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=モモのイラスト' },
        { name: 'ムネ', isConquered: false, conqueredDate: null, description: '柔らかくて脂肪が少なく、味は淡白。から揚げやフライ、焼き物や炒め物に適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ムネのイラスト' },
        { name: 'ササミ', isConquered: true, conqueredDate: '2023-11-22', description: '低脂肪で肉質は柔らかく、あっさりとした味。サラダや和え物、新鮮なものは刺身にもされる。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ササミのイラスト' },
        { name: '手羽元', isConquered: false, conqueredDate: null, description: 'ゼラチン質で脂肪が多く、コクがある。水炊きやカレーなどの煮込み料理、揚げ物や焼き物に向いている。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=手羽元のイラスト' },
        { name: '手羽先', isConquered: true, conqueredDate: '2023-12-25', description: 'ゼラチン質で脂肪が多く、コクがある。水炊きやカレーなどの煮込み料理、揚げ物や焼き物に向いている。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=手羽先のイラスト' },
        { name: 'ボンジリ', isConquered: false, conqueredDate: null, description: '尾骨の周りの肉。脂がのってジューシーで、とろけるような口当たり。塩焼きやタレ焼きがおすすめ。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ボンジリのイラスト' },
        { name: 'ハツ', isConquered: false, conqueredDate: null, description: '独特の歯ざわりがある。塩焼き、揚げ物、炒め物などに適している。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=ハツのイラスト' },
        { name: 'レバー', isConquered: true, conqueredDate: '2024-01-07', description: '脂肪が少なく高タンパク。串焼きや煮物、揚げ物、炒め物、レバーペーストなどに向いている。', imageUrl: 'https://placehold.co/300x200/e0e0e0/7f7f7f?text=レバーのイラスト' },
      ]
    }
  }

  const handlePartClick = (part) => {
    setSelectedPart(part)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPart(null)
  }

  const currentAnimalParts = animalData[selectedAnimal].parts;
  const conqueredCount = currentAnimalParts.filter(p => p.isConquered).length;
  const totalCount = currentAnimalParts.length;
  const percentage = totalCount > 0 ? Math.floor((conqueredCount / totalCount) * 100) : 0;

  return (
    <PageLayout title="食べた部位ページ" showBackButton={true}>
      <div style={{ backgroundColor: colors.base, color: colors.text, padding: '1px 24px 24px', minHeight: '100vh' }}>

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h2>動物を選択</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '16px 0' }}>
            {Object.entries(animalData).map(([key, animal]) => (
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
                  backgroundColor: animal.illustration.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  {animal.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ textAlign: 'center' }}>{animalData[selectedAnimal].name}の部位制覇状況</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12 
          }}>
            {currentAnimalParts.map((part) => (
              <div
                key={selectedAnimal + '-' + part.name}
                onClick={() => handlePartClick(part)}
                style={{
                  padding: 16,
                  backgroundColor: part.isConquered ? colors.conqueredBg : colors.unconqueredBg,
                  border: `1px solid ${part.isConquered ? colors.conqueredBorder : colors.unconqueredBorder}`,
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
                <strong style={{ color: colors.text }}>{part.name}</strong>
                <div style={{ fontSize: '12px', marginTop: 4 }}>
                  {part.isConquered ? '✅ 制覇済み' : '❌ 未制覇'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3>制覇率</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              flex: 1,
              backgroundColor: colors.progressBarBg,
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: `${percentage}%`,
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
            <span style={{ fontWeight: 'bold', fontSize: '1.2em', minWidth: 50, textAlign: 'right' }}>
              {`${percentage}%`}
            </span>
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
              <img 
                src={selectedPart.imageUrl} 
                alt={`${selectedPart.name}のイラスト`} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 8, 
                  marginBottom: 16, 
                  backgroundColor: '#f0f0f0' 
                }} 
              />
              <h2 style={{ marginTop: 0, marginBottom: 16, color: colors.text }}>{selectedPart.name}</h2>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16, textAlign: 'left' }}>
                <h3 style={{ marginTop: 0 }}>特徴</h3>
                <p style={{ color: colors.text, lineHeight: 1.6 }}>
                  {selectedPart.description}
                </p>
              </div>

              <p style={{ textAlign: 'right', fontSize: '0.9em', color: '#555', marginTop: 16 }}>
                <strong>制覇日:</strong> {selectedPart.isConquered ? selectedPart.conqueredDate : '未制覇'}
              </p>

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