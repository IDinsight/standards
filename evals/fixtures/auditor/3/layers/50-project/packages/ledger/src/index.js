import { sumCents } from '@tally/shared';

export function createLedger() {
  const postings = [];
  return {
    post(account, cents, memo = '') {
      if (!Number.isInteger(cents)) throw new TypeError('amount must be integer cents');
      postings.push({ account, cents, memo });
    },
    balance(account) {
      return sumCents(postings.filter((p) => p.account === account).map((p) => p.cents));
    },
    entries() {
      return postings.map((p) => ({ ...p }));
    },
  };
}
