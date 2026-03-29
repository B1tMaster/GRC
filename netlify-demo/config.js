/**
 * Runtime configuration for the Evonix prototype.
 *
 * API calls use the Netlify proxy (/api/* -> Railway backend) to avoid CORS.
 * Set to empty string so fetch() uses same-origin relative paths.
 * For local development against a separate backend, set to the backend URL.
 */
window.EVONIX_API_BASE = '';
