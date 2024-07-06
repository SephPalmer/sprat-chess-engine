import React from 'react'
import ReactDOM from 'react-dom/client'
import Chessboard from './engine.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Chessboard />
  </React.StrictMode>,
)
