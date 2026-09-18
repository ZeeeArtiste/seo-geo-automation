/** @type {import('tailwindcss').Config} */

/**
 * Palette centralisée. Les couleurs étaient auparavant écrites en dur dans
 * chaque gabarit (`bg-[#FAF8F4]`), ce qui rendait un changement de direction
 * visuelle impossible à faire proprement. Tout passe désormais par ces noms
 * sémantiques : rehabiller le site revient à modifier ce seul bloc.
 */
const palette = {
  paper: '#FFFFFF',   // fond de page
  surface: '#F7F8FA', // cartes, encadrés, fonds secondaires
  ink: '#0F172A',     // texte principal
  body: '#1E293B',    // corps de texte des articles
  muted: '#64748B',   // métadonnées, légendes
  line: '#E2E8F0',    // filets et bordures
  lineStrong: '#CBD5E1',
  accent: '#2563EB',  // liens, repères, éléments actifs
  accentSoft: '#BFDBFE',
  accentInk: '#1D4ED8', // survol
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx}'],
  theme: {
    extend: {
      colors: palette,
      typography: {
        DEFAULT: {
          css: {
            color: palette.body,
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
