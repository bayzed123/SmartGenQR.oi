/**
 * Per-post blog reviews.
 *
 * There is already an external reviews widget (a separate Worker,
 * young-grass-a480…) used on /review/, /tools/, and smartgen-legal-info —
 * but it shares ONE flat KV store across every page it's embedded on, with
 * no concept of "which page is this review about". That's fine for a single
 * sitewide testimonial wall, but wrong for blog posts, where a review is
 * about one specific article. Rather than bolt per-post scoping onto a
 * Worker whose source isn't even in this repo, blog reviews get their own
 * small store here, keyed by post slug from the start.
 *
 * Storage: Cloudflare KV (AUDIT_KV, already bound). Each review is a single
 * key under `review:blog:<slug>:<reviewId>`, with the review body kept in
 * the key's metadata so a whole post's reviews come back from one
 * `list({ prefix })` call — no per-review `get` round trips.
 */

const MAX_NAME_LENGTH = 60;
const MAX_COMMENT_LENGTH = 800;
const MIN_COMMENT_LENGTH = 3;

function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9-]{1,200}$/.test(slug);
}

function reviewId() {
  // Sortable (embeds a timestamp) and collision-resistant enough for a
  // human-paced submission rate.
  return `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * @returns {{ ok: true, reviews: Array, average: number, count: number } | { ok: false, error: string }}
 */
export async function listReviews(env, slug) {
  if (!isValidSlug(slug)) return { ok: false, error: 'Invalid post.' };
  if (!env.AUDIT_KV) return { ok: true, reviews: [], average: 0, count: 0, unconfigured: true };

  const prefix = `review:blog:${slug}:`;
  const reviews = [];
  let cursor;
  do {
    const page = await env.AUDIT_KV.list({ prefix, cursor, limit: 1000 });
    for (const key of page.keys) {
      if (key.metadata) reviews.push(key.metadata);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

  const count = reviews.length;
  const average = count === 0 ? 0 : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;

  return { ok: true, reviews, average, count };
}

/**
 * @returns {{ ok: true, review: object } | { ok: false, error: string }}
 */
export async function submitReview(env, { slug, name, rating, comment }) {
  if (!isValidSlug(slug)) return { ok: false, error: 'Invalid post.' };

  const cleanName = String(name || '').trim().slice(0, MAX_NAME_LENGTH) || 'Anonymous Reader';
  const cleanComment = String(comment || '').trim().slice(0, MAX_COMMENT_LENGTH);
  const cleanRating = Math.round(Number(rating));

  if (!Number.isFinite(cleanRating) || cleanRating < 1 || cleanRating > 5) {
    return { ok: false, error: 'Choose a star rating from 1 to 5.' };
  }
  if (cleanComment.length < MIN_COMMENT_LENGTH) {
    return { ok: false, error: 'Your review is too short.' };
  }
  if (!env.AUDIT_KV) {
    return { ok: false, error: 'Reviews are not configured yet.', skipped: true };
  }

  const review = {
    id: reviewId(),
    name: cleanName,
    rating: cleanRating,
    comment: cleanComment,
    date: new Date().toISOString(),
  };

  // No expirationTtl -- reviews are meant to persist. Cloudflare KV metadata
  // is capped at 1024 bytes, which the length limits above comfortably fit.
  await env.AUDIT_KV.put(`review:blog:${slug}:${review.id}`, '1', { metadata: review });

  return { ok: true, review };
}
