// Give headings stable ids so guide pages can link to sections.
function slug(text) {
  return text.toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default {
  name: 'anchors',
  html(output) {
    return output.replace(/<h([1-4])>(.*?)<\/h\1>/g,
      (match, level, text) => `<h${level} id="${slug(text)}">${text}</h${level}>`);
  },
};
