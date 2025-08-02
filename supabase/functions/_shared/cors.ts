// supabase/functions/_shared/cors.ts

// Set this in your Supabase project's environment variables.
// For multiple origins, provide a comma-separated list.
// e.g., https://example.com,http://localhost:3000
const allowedOriginsSetting = Deno.env.get('CORS_ALLOWED_ORIGINS') ?? '*';
const allowedOrigins = allowedOriginsSetting.split(',').map(o => o.trim());

export const getCorsHeaders = (requestOrigin: string | null) => {
  let origin = '';

  if (allowedOrigins.includes('*')) {
    origin = '*';
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    origin = requestOrigin;
  }
  // If there's no match, the 'Access-Control-Allow-Origin' header will not be sent,
  // which is the correct behavior for denying a CORS request.

  const headers = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin', // Tells caches that the response depends on the Origin header
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
};
