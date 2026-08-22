import { hasSupabaseConfig, supabase } from './supabaseClient';

// Official Google Business Profile link for FSD Home Services.
export const GOOGLE_BUSINESS_PROFILE_URL = 'https://share.google/yBIBgEVsWD5KyOFQJ';

// Owner-verified current Google figures provided by FSD Home Services. These
// are used ONLY for the compact rating summary while the live Google Places
// response is unavailable (not yet configured or temporarily unreachable).
// They are never used to fabricate review cards — review cards render
// exclusively from the live API response.
export const OWNER_VERIFIED_SUMMARY = {
  rating: 4.8,
  reviewCount: 22
};

const CACHE_KEY = 'fsd-google-reviews-v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

function initialsFor(name) {
  return (
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'G'
  );
}

function formatReviewDate(iso, relative) {
  if (iso) {
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  return relative || '';
}

function readCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { fetchedAt, payload } = JSON.parse(raw);
    if (!fetchedAt || Date.now() - Number(fetchedAt) > CACHE_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), payload }));
  } catch {
    // Storage unavailable (private mode, full storage, etc.) — skip silently.
  }
}

/**
 * Fetches the live Google reviews for FSD Home Services through the
 * `fetch-google-reviews` Supabase Edge Function.
 *
 * Returned shape:
 *   {
 *     ok: boolean,            // reviews were loaded successfully
 *     configured: boolean,    // the edge-function secrets are configured
 *     error: string | null,
 *     rating: number | null,  // null when no live value is available
 *     userRatingCount: number | null,
 *     reviews: [{ id, authorName, initials, rating, text, dateLabel, url }]
 *   }
 */
export async function getGoogleReviews({ force = false } = {}) {
  if (!hasSupabaseConfig || !supabase) {
    return {
      ok: false,
      configured: false,
      error: 'Google reviews are not configured.',
      rating: null,
      userRatingCount: null,
      reviews: []
    };
  }

  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }

  try {
    const { data, error: invokeError } = await supabase.functions.invoke('fetch-google-reviews', {
      method: 'GET'
    });

    if (invokeError) throw invokeError;

    const body = data || {};
    if (!body.ok) {
      return {
        ok: false,
        configured: Boolean(body.configured),
        error: body.error || 'Google reviews are unavailable right now.',
        rating: null,
        userRatingCount: null,
        reviews: []
      };
    }

    const result = {
      ok: true,
      configured: true,
      error: null,
      rating: Number(body.rating) || null,
      userRatingCount: Number(body.userRatingCount) || 0,
      reviews: (body.reviews || [])
        .filter((review) => review.text && review.text.trim())
        .map((review, index) => ({
          id: review.googleMapsUri || `review-${index}`,
          authorName: review.authorName || 'Google User',
          initials: initialsFor(review.authorName),
          rating: Number(review.rating) || 5,
          text: review.text.trim(),
          dateLabel: formatReviewDate(review.publishTime, review.relativePublishTimeDescription),
          url: review.googleMapsUri || GOOGLE_BUSINESS_PROFILE_URL
        }))
    };

    writeCache(result);
    return result;
  } catch {
    return {
      ok: false,
      configured: true,
      error: 'Google reviews could not be loaded. Please try again later.',
      rating: null,
      userRatingCount: null,
      reviews: []
    };
  }
}