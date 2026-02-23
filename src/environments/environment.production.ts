export const environment = {
  production: true,
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.yourdomain.com/api',
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  paymobIframeId: import.meta.env.VITE_PAYMOB_IFRAME_ID || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
};
