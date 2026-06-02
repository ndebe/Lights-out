import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// index.css removed — globals.css handles all styles
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
