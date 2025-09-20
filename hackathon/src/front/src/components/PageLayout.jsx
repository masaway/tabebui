import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    padding: 24,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #ddd'
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  backButton: {
    textDecoration: 'none',
    color: '#007bff',
    fontSize: '16px'
  },
  title: {
    margin: 0,
    color: '#333'
  },
  menuButton: {
    background: 'none',
    border: '2px solid #007bff',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  menuButtonHover: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.3s ease'
  },
  overlayVisible: {
    opacity: 1,
    visibility: 'visible'
  },
  menu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '300px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    zIndex: 1000,
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
  },
  menuVisible: {
    transform: 'translateX(0)'
  },
  menuHeader: {
    padding: '24px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  menuTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#666',
    cursor: 'pointer',
    padding: '4px'
  },
  menuContent: {
    flex: 1,
    padding: '16px 0'
  },
  menuItem: {
    display: 'block',
    padding: '16px 24px',
    textDecoration: 'none',
    color: '#333',
    fontSize: '16px',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  menuItemHover: {
    backgroundColor: '#f8f9fa'
  },
  menuIcon: {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center'
  },
  loginItem: {
    color: '#28a745',
    fontWeight: 'bold'
  }
}

export default function PageLayout({ title, showBackButton = false, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(false)
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null)

  useEffect(() => {
    document.title = `${title} - たべぶい`
  }, [title])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const menuItems = [
    { to: '/', label: 'TOP', icon: '🏠' },
    { to: '/parts', label: '部位一覧', icon: '🥩' },
    { to: '/record', label: '記録', icon: '📝' },
    { to: '/concierge', label: 'コンシェルジュ', icon: '🤖' },
    { to: '/login', label: 'ログイン', icon: '👤', isLogin: true }
  ]

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            {showBackButton && (
              <Link to="/" style={styles.backButton}>
                ← 戻る
              </Link>
            )}
            <h1 style={styles.title}>{title}</h1>
          </div>
          
          {/* メニューボタン */}
          <button 
            style={{
              ...styles.menuButton,
              ...(hoveredButton ? styles.menuButtonHover : {})
            }}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
            onClick={toggleMenu}
          >
            <span>☰</span>
            メニュー
          </button>
        </div>
      </header>

      {/* オーバーレイ */}
      <div 
        style={{
          ...styles.overlay,
          ...(isMenuOpen ? styles.overlayVisible : {})
        }}
        onClick={closeMenu}
      />

      {/* スライドメニュー */}
      <div 
        style={{
          ...styles.menu,
          ...(isMenuOpen ? styles.menuVisible : {})
        }}
      >
        <div style={styles.menuHeader}>
          <h2 style={styles.menuTitle}>メニュー</h2>
          <button style={styles.closeButton} onClick={closeMenu}>
            ✕
          </button>
        </div>
        
        <div style={styles.menuContent}>
          {menuItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                ...styles.menuItem,
                ...(item.isLogin ? styles.loginItem : {}),
                ...(hoveredMenuItem === index ? styles.menuItemHover : {})
              }}
              onMouseEnter={() => setHoveredMenuItem(index)}
              onMouseLeave={() => setHoveredMenuItem(null)}
              onClick={closeMenu}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main>
        {children}
      </main>
    </div>
  )
}