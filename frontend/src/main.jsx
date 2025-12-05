import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatHistoryProvider } from './hooks/ChatHistory.jsx'
import { GlobalToolsProvider } from './hooks/GlobalTools.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ChatHistoryProvider>
      <GlobalToolsProvider>
        <App />
      </GlobalToolsProvider>
    </ChatHistoryProvider>
  // </StrictMode>,
)
