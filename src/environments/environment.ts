export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  paymobIframeId: import.meta.env.VITE_PAYMOB_IFRAME_ID || '',
  sentryDsn: '',
};
