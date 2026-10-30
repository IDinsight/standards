export const PRIORITY = { low: 1, normal: 5, high: 10 };

export function passwordResetEmail(address, send) {
  return {
    name: 'password-reset-email',
    priority: PRIORITY.high,
    run: () => send(address, 'Reset your password'),
  };
}

export function welcomeEmail(address, send) {
  return {
    name: 'welcome-email',
    priority: PRIORITY.normal,
    run: () => send(address, 'Welcome aboard'),
  };
}

export function nightlyReport(build) {
  return {
    name: 'nightly-report',
    priority: PRIORITY.low,
    run: () => build(),
  };
}
