import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatHistoryProvider } from './hooks/GlobalChatHistory.jsx'
import { GlobalToolsProvider } from './hooks/GlobalTools.jsx'
import { GlobalBlogProvider } from './hooks/GlobalBlog.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ChatHistoryProvider>
      <GlobalToolsProvider>
        <GlobalBlogProvider>
          <App />
        </GlobalBlogProvider>
      </GlobalToolsProvider>
    </ChatHistoryProvider>
  // </StrictMode>,
)
