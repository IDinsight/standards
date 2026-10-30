function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function attachmentName(report, ext) {
  return `${slug(report.title)}-${report.date}.${ext}`;
}

export function contentDisposition(filename) {
  return `attachment; filename="${filename}"`;
}
