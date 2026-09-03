import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { GOOGLE_BUSINESS_PROFILE_URL, OWNER_VERIFIED_SUMMARY } from '../../lib/googleReviews';
import { googleReviews } from '../../data/googleReviews';

const GAP = 16; // px between cards
const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 600;

/* ── Star rating (out of 5) ── */
function StarRating({ value }) {
  const stars = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${stars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={16}
          aria-hidden="true"
          className={index < stars ? 'fill-current text-brand-500' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

/* ── Subtle Google "G" mark (source indicator only) ── */
function GoogleG({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

/* ── Premium review card (equal-height, polished) ── */
function ReviewCard({ review }) {
  return (
    <div className="flex h-full w-full shrink-0 flex-col rounded-lg border border-slate-200 bg-white p-6 transition duration-300 ease-in-out hover:border-brand-200 hover:shadow-soft">
      <StarRating value={review.rating} />
      <p className="mt-4 flex-1 leading-relaxed text-slate-600">{review.text}</p>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="font-bold text-slate-950">{review.name}</p>
        <p className="mt-1 text-sm text-slate-500">
          {review.service} · {review.area}
        </p>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <GoogleG className="h-3.5 w-3.5 shrink-0" />
        Google Review
      </p>
    </div>
  );
}

/* ── Premium review carousel (3 / 2 / 1 cards, loop, autoplay, swipe) ── */
function ReviewCarousel({ reviews }) {
  const viewportRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const touchXRef = useRef(null);

  const count = reviews.length;
  const visible = Math.max(1, perView);
  const showNav = count > visible;
  const displayItems = [
    ...reviews.slice(-visible),
    ...reviews,
    ...reviews.slice(0, visible)
  ];
  const baseShift = visible;
  const unit = cardWidth + GAP;
  const translateX = -(index + baseShift) * unit;

  /* Measure container and choose responsive items-per-view */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      const next = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
      setPerView(next);
      setCardWidth((width - GAP * (next - 1)) / next);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const move = useCallback(
    (step) => {
      if (busyRef.current || !showNav) return;
      busyRef.current = true;
      setAnimating(true);
      indexRef.current += step;
      setIndex(indexRef.current);
    },
    [showNav]
  );

  const goToPage = useCallback(
    (page) => {
      if (busyRef.current || !showNav) return;
      const target = page * visible;
      const current = ((indexRef.current % count) + count) % count;
      if (target === current) return;
      busyRef.current = true;
      setAnimating(true);
      indexRef.current = target;
      setIndex(target);
    },
    [showNav, visible, count]
  );

  const handleTransitionEnd = () => {
    if (!busyRef.current) return;
    if (indexRef.current < 0 || indexRef.current >= count) {
      const wrapped = ((indexRef.current % count) + count) % count;
      setAnimating(false);
      indexRef.current = wrapped;
      setIndex(wrapped);
      return;
    }
    busyRef.current = false;
    setAnimating(false);
  };

  /* Autoplay every 5 seconds; pauses on hover/focus/touch */
  useEffect(() => {
    if (paused || !showNav) return undefined;
    const id = window.setInterval(() => move(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, showNav, move]);

  const handleTouchStart = (event) => {
    touchXRef.current = event.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (event) => {
    if (touchXRef.current === null) return;
    const delta = event.changedTouches[0].clientX - touchXRef.current;
    touchXRef.current = null;
    if (delta < -40) move(1);
    else if (delta > 40) move(-1);
    window.setTimeout(() => setPaused(false), 400);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  };

  const current = ((index % count) + count) % count;
  const pageCount = Math.max(1, Math.ceil(count / visible));
  const activePage = Math.min(pageCount - 1, Math.floor(current / visible));

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl">
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Customer reviews carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-lg outline-none"
      >
        {cardWidth === 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
        {cardWidth > 0 && (
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex shrink-0"
              style={{
                width: `${displayItems.length * unit}px`,
                transform: `translateX(${translateX}px)`,
                transition: animating ? `transform ${TRANSITION_MS}ms ease-in-out` : 'none'
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {displayItems.map((review, slot) => (
                <div
                  key={`${review.id}-${slot}`}
                  className="shrink-0"
                  style={{ width: `${cardWidth}px`, paddingRight: `${GAP}px` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        )}

        {showNav && cardWidth > 0 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous reviews"
              className="focus-ring absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-soft transition hover:border-brand-500 hover:text-brand-700"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next reviews"
              className="focus-ring absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-soft transition hover:border-brand-500 hover:text-brand-700"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {showNav && cardWidth > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2" role="group" aria-label="Review slides">
          {Array.from({ length: pageCount }).map((_, page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-label={`Go to review slide ${page + 1}`}
              aria-current={page === activePage ? 'true' : undefined}
              className={`h-2.5 rounded-full transition-all duration-300 focus-ring ${
                page === activePage ? 'w-6 bg-brand-700' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Google Reviews / Customer Reviews section ── */
export function GoogleReviewsSection() {
  const rating = OWNER_VERIFIED_SUMMARY.rating;
  const reviewCount = OWNER_VERIFIED_SUMMARY.reviewCount;

  return (
    <section
      id="google-reviews"
      className="border-b border-slate-200 bg-white py-14 lg:py-20"
      aria-labelledby="google-reviews-title"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-700">Customer reviews</p>
            <h2 id="google-reviews-title" className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">
              What Our Customers Say
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Real feedback from customers who have experienced FSD Home Services.
            </p>
          </div>

          {/* Compact Google rating summary */}
          <div className="w-full shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-5 sm:max-w-sm">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold tracking-tight text-slate-950">{rating.toFixed(1)}</span>
              <div>
                <StarRating value={rating} />
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <GoogleG className="h-4 w-4 shrink-0" />
                  Based on Google reviews
                </p>
              </div>
            </div>
            <a
              href={GOOGLE_BUSINESS_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="focus-ring mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-brand-500 hover:text-brand-700"
            >
              Read reviews on Google <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* 3rd block — premium review carousel */}
        <ReviewCarousel reviews={googleReviews} />
      </div>
    </section>
  );
}