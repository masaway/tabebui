import React, { useState } from 'react'
import PageLayout from '../components/PageLayout'

export default function ConciergePage() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'こんにちは！たべぶいコンシェルジュです🐄🐷🐔\nどんなお肉の部位について知りたいですか？'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      type: 'user',
      content: inputMessage
    }

    setMessages(prev => [...prev, userMessage])

    // 簡単なボット応答
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        content: generateBotResponse(inputMessage)
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)

    setInputMessage('')
  }

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('牛') || input.includes('ビーフ')) {
      return '🐄 牛肉について聞かれましたね！\n牛肉はタンパク質と鉄分が豊富です。\nサーロインやリブロースがおすすめです。まだ食べていない部位はありますか？'
    } else if (input.includes('豚') || input.includes('ポーク')) {
      return '🐷 豚肉ですね！\n豚肉はビタミンB1が豊富で疲労回復に効果的です。\nロースやヒレがヘルシーでおすすめです。'
    } else if (input.includes('鳥') || input.includes('鶏') || input.includes('チキン')) {
      return '🐔 鶏肉について！\n鶏肉は高タンパク・低カロリーでダイエットにも最適です。\nササミやムネ肉が特にヘルシーですよ。'
    } else if (input.includes('おすすめ') || input.includes('何を食べ')) {
      return '🍽️ おすすめの部位をご提案しますね！\n\n制覇率を上げるなら：\n• 牛タン（食べやすくて美味しい）\n• 豚バラ（焼肉の定番）\n• 鶏モモ（ジューシー）\n\nどれか気になるものはありますか？'
    } else {
      return `「${userInput}」について詳しく教えて差し上げたいのですが、もう少し具体的に教えていただけますか？\n\n例：\n• 牛のおすすめ部位は？\n• 豚肉の栄養について\n• 鶏肉のヘルシーな食べ方`
    }
  }

  return (
    <PageLayout title="コンシェルジュ (Agent)" showBackButton={true}>

      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: 8, 
        height: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          flex: 1, 
          padding: 16, 
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor: message.type === 'user' ? '#007bff' : '#e9ecef',
                  color: message.type === 'user' ? 'white' : 'black'
                }}
              >
                <div style={{ whiteSpace: 'pre-line' }}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid #ddd' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="メッセージを入力してください..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}