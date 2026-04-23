import * as Sentry from '@sentry/react'

export function initSentry() {
    const dsn = import.meta.env.VITE_SENTRY_DSN
    if (!dsn) return

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                // Mask user-generated text and block media in replays for privacy
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        // Low sample rate in prod — traces are high volume
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        // Capture 10% of sessions, but 100% of sessions with an error
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
    })
}

// Re-export so callers don't need to import @sentry/react directly
export { Sentry }