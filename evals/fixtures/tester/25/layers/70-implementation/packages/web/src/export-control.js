// Download CSV control for the records page. Exports the records matching the
// current filter and hands the file to saveFile. When the export fails it shows
// the reason in an alert and moves focus there.
export function createExportControl(document, { getFilter, exportRecords, saveFile }) {
  const element = document.createElement('div');
  element.className = 'export-control';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Download CSV';

  const message = document.createElement('p');
  message.className = 'export-error';
  message.setAttribute('role', 'alert');
  message.setAttribute('tabindex', '-1');
  message.hidden = true;

  let busy = false;
  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    button.setAttribute('aria-disabled', 'true');
    message.hidden = true;
    message.textContent = '';
    try {
      const { fileName, csv } = await exportRecords(getFilter());
      saveFile(fileName, csv);
    } catch (error) {
      message.textContent = `Export failed: ${error.message}`;
      message.hidden = false;
      message.focus();
    } finally {
      busy = false;
      button.removeAttribute('aria-disabled');
    }
  });

  element.append(button, message);
  return { element, button, message };
}
