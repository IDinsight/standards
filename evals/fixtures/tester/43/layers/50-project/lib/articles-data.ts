export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
};

export const articles: Article[] = [
  {
    slug: 'reset-password',
    title: 'Reset your password',
    summary: 'Get a reset link by email.',
    body: 'Open Sign in, choose Forgot password, and follow the link we email you. The link expires after 30 minutes.',
    tags: ['account', 'password'],
  },
  {
    slug: 'change-email',
    title: 'Change the email on your account',
    summary: 'Update the address we use to contact you.',
    body: 'Go to Settings > Profile and enter the new address. We send a confirmation link to it; the change applies once you open the link.',
    tags: ['account', 'email'],
  },
  {
    slug: 'export-data',
    title: 'Export your data',
    summary: 'Download a copy of your records.',
    body: 'From Settings > Data, choose Export. We email you a ZIP of CSV files when it is ready.',
    tags: ['data', 'export'],
  },
  {
    slug: 'invoices',
    title: 'Find past invoices',
    summary: 'See and download invoices for your plan.',
    body: 'Billing > Invoices lists every invoice. Choose one to download it as a PDF.',
    tags: ['billing'],
  },
  {
    slug: 'close-account',
    title: 'Close your account',
    summary: 'Delete your account and its data.',
    body: 'Go to Settings > Account > Close account. We keep invoices for seven years as the law requires; everything else is deleted within 30 days. Export your data first if you need it.',
    tags: ['account'],
  },
];
