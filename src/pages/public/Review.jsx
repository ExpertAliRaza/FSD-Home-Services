import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { getReviewContext, submitWorkerReview } from '../../lib/api';

export function Review() {
  const { token } = useParams();
  const [context, setContext] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    getReviewContext(token)
      .then((data) => {
        setContext(data);
        setStatus('idle');
      })
      .catch((err) => {
        setError(err.message || 'This review link is invalid.');
        setStatus('error');
      });
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (rating < 1) {
      setError('Select a rating from 1 to 5 stars.');
      return;
    }
    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    setStatus('submitting');
    try {
      await submitWorkerReview(token, rating, reviewText);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Your review could not be submitted.');
      setStatus('idle');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Customer feedback" title="Review your completed service">
        Your feedback helps customers choose reliable local workers in Faisalabad.
      </PageHeader>
      <section className="mx-auto max-w-2xl px-4 py-8">
        {status === 'loading' && <Message>Checking your review link...</Message>}
        {status === 'error' && <ErrorMessage>{error}</ErrorMessage>}
        {status !== 'loading' && context?.submitted && <Message>This review link has already been used.</Message>}
        {status !== 'loading' && context?.expired && !context.submitted && <ErrorMessage>This review link has expired.</ErrorMessage>}
        {status === 'success' && <Message>Thank you. Your review has been submitted.</Message>}
        {status !== 'success' && context && !context.submitted && !context.expired && (
          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-slate-950">{context.worker_name}</h2>
            <p className="mt-1 text-slate-600">{context.service_name} in {context.area_name}</p>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold text-slate-700">Rating</legend>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star rating`}
                    className="focus-ring flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white"
                  >
                    <Star className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-6 grid gap-2 text-sm font-bold text-slate-700">
              Review
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                minLength="10"
                maxLength="1000"
                rows="5"
                className="focus-ring w-full rounded-lg border border-slate-300 p-3 font-normal text-slate-950"
                placeholder="Tell us about the worker's service, punctuality, and quality."
                required
              />
            </label>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <button disabled={status === 'submitting'} className="mt-5 min-h-11 w-full rounded-lg bg-brand-700 px-5 py-3 font-bold text-white disabled:opacity-60">
              {status === 'submitting' ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </section>
    </>
  );
}

function Message({ children }) {
  return <p className="rounded-lg border border-brand-100 bg-brand-50 p-5 font-semibold text-brand-900">{children}</p>;
}

function ErrorMessage({ children }) {
  return <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 font-semibold text-red-700">{children}</p>;
}
