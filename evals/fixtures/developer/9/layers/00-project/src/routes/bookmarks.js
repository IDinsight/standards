import { validateBookmark } from '../validate.js';

export function createBookmarkRoutes({ store }) {
  return {
    list() {
      return { status: 200, body: store.list() };
    },

    create(input) {
      const problems = validateBookmark(input);
      if (problems.length > 0) return { status: 400, body: { error: 'invalid_bookmark', problems } };
      return { status: 201, body: store.add(input) };
    },
  };
}
