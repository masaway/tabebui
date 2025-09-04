import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // 簡単なダミーログイン処理
    if (email && password) {
      alert('ログインしました！')
      navigate('/')
    } else {
      alert('メールアドレスとパスワードを入力してください')
    }
  }

  return (
    <PageLayout title="ログイン">
      <div style={{ 
        maxWidth: 400,
        margin: '0 auto',
        marginTop: 50
      }}>

      <form onSubmit={handleLogin} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px'
            }}
            placeholder="example@email.com"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px'
            }}
            placeholder="パスワードを入力"
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ログイン
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <p>アカウントをお持ちでない方は</p>
        <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
          新規登録はこちら
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/" style={{ color: '#6c757d', textDecoration: 'none' }}>
          ← TOPページに戻る
        </Link>
      </div>
      </div>
    </PageLayout>
  )
}