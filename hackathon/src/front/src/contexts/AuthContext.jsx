import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { userAPI } from '../utils/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ユーザーをDBに登録または更新
  const syncUserWithDB = async (firebaseUser) => {
    if (!firebaseUser) {
      setDbUser(null)
      return
    }

    try {
      const userData = {
        google_id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email,
        profile_image_url: firebaseUser.photoURL,
      }

      const response = await userAPI.createOrUpdateUser(userData)

      if (response.success) {
        setDbUser(response.data)
        console.log(response.message)
      }
    } catch (error) {
      console.error('ユーザーDB登録エラー:', error)
      // エラーが発生してもFirebase認証は継続
    }
  }

  // Googleでサインイン
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      // ログイン成功後、DBにユーザー情報を保存
      await syncUserWithDB(result.user)
      return result
    } catch (error) {
      console.error('Google認証エラー:', error)
      throw error
    }
  }

  // サインアウト
  const logout = () => {
    setDbUser(null)
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        // ログイン状態が復元された場合、DBユーザー情報も取得
        await syncUserWithDB(user)
      } else {
        setDbUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    dbUser,
    signInWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}