import { validateBookmark } from '../validate.js';

export function createBookmarkRoutes({ store, logger = console }) {
  return {
    list() {
      return { status: 200, body: store.list() };
    },

    create(input) {
      const problems = validateBookmark(input);
      if (problems.length > 0) return { status: 400, body: { error: 'invalid_bookmark', problems } };
      return { status: 201, body: store.add(input) };
    },

    get(rawId) {
      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) return { status: 404, body: { error: 'not_found' } };
      try {
        const bookmark = store.getById(id);
        if (bookmark === null) return { status: 404, body: { error: 'not_found' } };
        return { status: 200, body: bookmark };
      } catch (error) {
        logger.error('bookmark lookup failed', error);
        return { status: 500, body: { error: 'internal_error', message: error.message } };
      }
    },
  };
}
