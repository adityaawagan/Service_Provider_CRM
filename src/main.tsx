import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore: allow importing CSS without type declarations
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={(import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)