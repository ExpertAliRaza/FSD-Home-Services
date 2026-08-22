// fetch-google-reviews
// --------------------
// Server-side proxy for reading the FSD Home Services Google Business Profile
// reviews through the Google Places API (New), e.g.:
//
//   GET https://places.googleapis.com/v1/places/{GOOGLE_PLACE_ID}
//   X-Goog-Api-Key: {GOOGLE_PLACES_API_KEY}
//   X-Goog-FieldMask: reviews,rating,userRatingCount
//
// The API key and place id must be configured as edge-function secrets so the
// key is never exposed to the browser:
//
//   supabase secrets set GOOGLE_PLACES_API_KEY=...
//   supabase secrets set GOOGLE_PLACE_ID=...
//
// Google returns a limited set of reviews (normally the most helpful, max 5).
// This function normalizes and relays them; the UI renders exactly what the API
// returns and never fabricates review content.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const GOOGLE_FIELD_MASK = 'id,displayName,rating,userRatingCount,reviews';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return json({ configured: true, ok: false, error: 'Method not allowed.' });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const placeId = Deno.env.get('GOOGLE_PLACE_ID');

    if (!apiKey || !placeId) {
      return json({
        configured: false,
        ok: false,
        error: 'Google reviews are not configured yet.'
      });
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': GOOGLE_FIELD_MASK
        }
      }
    );

    if (!response.ok) {
      return json({
        configured: true,
        ok: false,
        error: await readGoogleError(response)
      });
    }

    const place = await response.json();

    const reviews = (place.reviews || [])
      .map((review, index) => ({
        id: review.name || String(index),
        authorName: review.authorAttribution?.displayName || 'Google User',
        rating: Number(review.rating) || 5,
        text: review.text?.text || review.originalText?.text || '',
        publishTime: review.publishTime || null,
        relativePublishTimeDescription: review.relativePublishTimeDescription || null,
        googleMapsUri: review.googleMapsUri || null
      }))
      .filter((review) => review.text && review.text.trim().length > 0)
      .slice(0, 6);

    return json(
      {
        configured: true,
        ok: true,
        source: 'google',
        rating: Number(place.rating) || null,
        userRatingCount: Number(place.userRatingCount) || 0,
        reviews
      },
      200,
      { 'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600' }
    );
  } catch (error) {
    return json({
      configured: true,
      ok: false,
      error: error?.message || 'Unexpected Google reviews error.'
    });
  }
});

async function readGoogleError(response) {
  try {
    const body = await response.json();
    if (body?.error?.message) {
      return String(body.error.message).slice(0, 300);
    }
  } catch {
    // Not a JSON error body; fall through to the status-based message.
  }
  return `Google Places API responded with status ${response.status}.`;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders }
  });
}