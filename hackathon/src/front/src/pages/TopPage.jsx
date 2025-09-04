import React from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

export default function TopPage() {
  return (
    <PageLayout title="TOP画面">
      <section style={{ marginBottom: 32 }}>
        <h2>記録状況</h2>
        <div style={{ 
          padding: 16, 
          backgroundColor: '#ffffff', 
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid #e9ecef'
        }}>
          <p>総制覇率: 25%</p>
          <p>今週の記録: 5部位</p>
          <p>連続記録: 3日</p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>アクション</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link 
            to="/record" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 'bold'
            }}
          >
            記録する
          </Link>
          
          <Link 
            to="/parts" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 'bold'
            }}
          >
            食べた部位を見る
          </Link>
          
          <Link 
            to="/concierge" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#ffc107',
              color: 'black',
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 'bold'
            }}
          >
            コンシェルジュ
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}