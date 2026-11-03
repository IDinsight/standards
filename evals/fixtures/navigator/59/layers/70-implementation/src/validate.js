const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_SUBJECT_LENGTH = 120;

export function validateMessage(message) {
  if (message === null || typeof message !== 'object') {
    return ['message must be an object'];
  }
  const errors = [];
  if (typeof message.to !== 'string' || !EMAIL_PATTERN.test(message.to)) {
    errors.push('to must be an email address');
  }
  if (typeof message.subject !== 'string' || message.subject.trim() === '') {
    errors.push('subject is required');
  } else if (message.subject.length > MAX_SUBJECT_LENGTH) {
    errors.push('subject must be at most ' + MAX_SUBJECT_LENGTH + ' characters');
  }
  if (typeof message.body !== 'string') {
    errors.push('body must be a string');
  }
  return errors;
}
