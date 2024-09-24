import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {UserList} from "./App.tsx";
import Chessboard from "./engine.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Chessboard />
  </React.StrictMode>,
)
