import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatHistoryProvider } from './hooks/ChatHistory.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatHistoryProvider>
      <App />
    </ChatHistoryProvider>
  </StrictMode>,
)
