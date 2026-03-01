/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.liquid',
    './frontend/**/*.{js,ts,liquid}',
  ],
  safelist: [
    // Classes generated dynamically by Alpine.js or Liquid
    'x-cloak',
    { pattern: /^(translate|opacity|scale)-/ },
    { pattern: /^(max-w)-(xl|2xl|3xl)$/ },
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      maxWidth: {
        page: 'var(--page-width)',
      },
      borderRadius: {
        theme: 'var(--border-radius)',
      },
      spacing: {
        base: 'var(--spacing-base)',
        '2base': 'var(--spacing-2)',
        '3base': 'var(--spacing-3)',
        half: 'var(--spacing-half)',
      },
    },
  },
  plugins: [],
};
