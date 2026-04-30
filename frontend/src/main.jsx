import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { WorkoutProvider } from './context/WorkoutContext'

// ── Sentry error monitoring ──────────────────────────────────────────────────
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    // Capture 20% of sessions as performance traces in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  });
}

// ── Clerk ────────────────────────────────────────────────────────────────────
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

const AppTree = (
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <AuthProvider>
          <WorkoutProvider>
            <App />
          </WorkoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  // Wrap with Sentry error boundary if DSN configured, otherwise render plain
  sentryDsn
    ? <Sentry.ErrorBoundary fallback={<SentryFallback />}>{AppTree}</Sentry.ErrorBoundary>
    : AppTree
)

function SentryFallback() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', fontFamily: 'IBM Plex Mono, monospace',
      background: '#000', color: '#fff', gap: '16px'
    }}>
      <p style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666' }}>
        / System Error
      </p>
      <h1 style={{ fontSize: '20px', fontWeight: 900 }}>Something went wrong</h1>
      <p style={{ fontSize: '12px', color: '#666', maxWidth: '320px', textAlign: 'center' }}>
        This error has been automatically reported. Reload the page to continue.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          border: '1px solid #fff', background: 'transparent', color: '#fff',
          padding: '8px 24px', fontSize: '11px', letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit'
        }}
      >
        Reload
      </button>
    </div>
  )
}
