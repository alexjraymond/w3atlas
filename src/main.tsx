import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startSync } from './cloud/sync'

startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
