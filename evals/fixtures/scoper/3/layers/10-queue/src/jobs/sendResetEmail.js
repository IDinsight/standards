export function sendResetEmail(mailer) {
  return async ({ email, token }) => {
    await mailer.send({
      to: email,
      subject: 'Reset your password',
      text: 'Use this code to reset your password: ' + token,
    });
  };
}
