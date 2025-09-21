import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuth()

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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      navigate('/')
    } catch (error) {
      console.error('Googleログインエラー:', error)
      alert('Googleログインに失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout title="ログイン">
      <div style={{ 
        maxWidth: 400,
        margin: '0 auto',
        marginTop: 50
      }}>

      <div style={{ marginBottom: 24 }}>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#db4437',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'ログイン中...' : '🔍 Googleでログイン'}
        </button>

        <div style={{
          textAlign: 'center',
          margin: '20px 0',
          position: 'relative'
        }}>
          <span style={{
            backgroundColor: '#ffffff',
            padding: '0 15px',
            color: '#666',
            fontSize: '14px'
          }}>
            または
          </span>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: '#ddd',
            zIndex: -1
          }} />
        </div>
      </div>

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