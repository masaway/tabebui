import React, { useEffect, useState } from 'react'

export default function App() {
  const [health, setHealth] = useState(null)
  const [db, setDb] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(e => setHealth({ error: String(e) }))

    fetch('/api/db-version')
      .then(r => r.json())
      .then(setDb)
      .catch(e => setDb({ error: String(e) }))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>React + FastAPI + MySQL</h1>
      <section>
        <h2>Backend Health</h2>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </section>
      <section>
        <h2>DB Connection</h2>
        <pre>{JSON.stringify(db, null, 2)}</pre>
      </section>
      <p>API への呼び出しは Vite の開発サーバで <code>/api</code> → <code>server:8000</code> にプロキシしています。</p>
    </div>
  )
}

