import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatHistoryProvider } from './hooks/GlobalChatHistory.jsx'
import { GlobalToolsProvider } from './hooks/GlobalTools.jsx'
import { BlogProvider } from './hooks/BlogContext.jsx'
import { NoteProvider } from './hooks/NoteContext.jsx'
import { ErrorProvider } from './hooks/ErrorContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ErrorProvider>
      <ChatHistoryProvider>
        <GlobalToolsProvider>
          <NoteProvider>
            <BlogProvider>
              <App />
            </BlogProvider>
          </NoteProvider>
        </GlobalToolsProvider>
      </ChatHistoryProvider>
    </ErrorProvider>
  // </StrictMode>,
)
