/// <reference types="vite/client" />

// No VITE_-prefixed environment variables are needed right now — the
// browser never holds a Supabase key or any other secret in this
// single-user, Netlify-password-gated instance. All data access happens
// through /api/* Netlify Functions. Add entries here if a client-side
// env var becomes genuinely necessary later.
