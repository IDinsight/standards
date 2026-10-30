export class TaskValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TaskValidationError';
  }
}
