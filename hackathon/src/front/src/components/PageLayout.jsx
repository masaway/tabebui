import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PageLayout({ title, showBackButton = false, children }) {
  useEffect(() => {
    document.title = `${title} - たべぶい`
  }, [title])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, minHeight: '100vh' }}>
      {/* ヘッダー */}
      <header style={{ 
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {showBackButton && (
              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#007bff',
                  fontSize: '16px'
                }}
              >
                ← 戻る
              </Link>
            )}
            <h1 style={{ margin: 0, color: '#333' }}>{title}</h1>
          </div>
          
          {/* ナビゲーションメニュー */}
          <nav>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#007bff',
                  fontSize: '14px'
                }}
              >
                TOP
              </Link>
              <Link 
                to="/parts" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#007bff',
                  fontSize: '14px'
                }}
              >
                部位一覧
              </Link>
              <Link 
                to="/record" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#007bff',
                  fontSize: '14px'
                }}
              >
                記録
              </Link>
              <Link 
                to="/concierge" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#007bff',
                  fontSize: '14px'
                }}
              >
                コンシェルジュ
              </Link>
              <Link 
                to="/login" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#28a745',
                  fontSize: '14px'
                }}
              >
                ログイン
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {children}
      </main>
    </div>
  )
}