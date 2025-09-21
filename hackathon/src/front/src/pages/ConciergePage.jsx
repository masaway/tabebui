import React, { useState } from 'react'
import PageLayout from '../components/PageLayout'
import { useAuth } from '../contexts/AuthContext'
import { chatAPI } from '../utils/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'こんにちは！たべぶいコンシェルジュです🐄🐷🐔\nどんなお肉の部位について知りたいですか？'
}

export default function ConciergePage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { dbUser } = useAuth()

  const handleSendMessage = async (event) => {
    event.preventDefault()
    const trimmed = inputMessage.trim()
    if (!trimmed || isLoading) return

    if (!dbUser?.id) {
      setError('ユーザー情報の取得に失敗しました。ログインし直してください。')
      return
    }

    const userMessage = { role: 'user', content: trimmed }
    const nextHistory = [...messages, userMessage].map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const payload = await chatAPI.sendMessage(trimmed, dbUser.id, nextHistory)

      const reply = payload?.data?.reply
      const historyFromServer = Array.isArray(payload?.data?.history) ? payload.data.history : null

      if (historyFromServer) {
        setMessages(
          historyFromServer.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content || ''
          }))
        )
      } else if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      } else {
        throw new Error('応答メッセージが空でした。')
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '申し訳ありません。応答を生成できませんでした。少し時間をおいて再度お試しください。'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout title='コンシェルジュ (Agent)' showBackButton={true}>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          height: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            flex: 1,
            padding: 16,
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor: message.role === 'user' ? '#007bff' : '#e9ecef',
                  color: message.role === 'user' ? 'white' : 'black'
                }}
              >
                <div style={{ whiteSpace: 'pre-line' }}>{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  fontStyle: 'italic'
                }}
              >
                コンシェルジュが考えています...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid #ddd' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type='text'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder='メッセージを入力してください...'
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
              disabled={isLoading}
            />
            <button
              type='submit'
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: isLoading ? 'default' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? '送信中...' : '送信'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 8, color: '#dc3545', fontSize: '12px' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </PageLayout>
  )
}

