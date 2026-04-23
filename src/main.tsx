import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/components/Providers'
import App from './App.tsx'
import '@fontsource-variable/outfit'
import './index.css'
import { initSentry } from '@/services/sentry'

// Must run before createRoot so the first render is already instrumented
initSentry()

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>,
)