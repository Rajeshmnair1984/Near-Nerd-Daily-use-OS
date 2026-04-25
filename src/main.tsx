import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './styles/forms.css'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import { UserProvider } from './context/UserContext'
import { Toast } from './components/ui/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <UserProvider>
        <ToastProvider>
          <App />
          <Toast />
        </ToastProvider>
      </UserProvider>
    </ErrorBoundary>
  </StrictMode>,
)
