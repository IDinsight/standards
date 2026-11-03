export const consoleMailer = {
  async send(message) {
    console.log('[mail] to=' + message.to + ' subject=' + message.subject);
  },
};
