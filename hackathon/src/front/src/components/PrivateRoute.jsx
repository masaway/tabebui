import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children }) {
  const { currentUser, dbUser } = useAuth()

  // Firebase認証されていない場合はログインページへ
  if (!currentUser) {
    return <Navigate to="/login" />
  }

  // Firebase認証はされているがDBユーザー情報がない場合は読み込み中と判断
  if (!dbUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '24px' }}>⏳</div>
        <div>ユーザー情報を読み込み中...</div>
      </div>
    )
  }

  return children
}