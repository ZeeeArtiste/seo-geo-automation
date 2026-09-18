/** Formatage des dates et estimation du temps de lecture. */

const FR = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const FR_SHORT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

export const formatDate = (iso: string) => FR.format(new Date(iso));
export const formatDateShort = (iso: string) => FR_SHORT.format(new Date(iso));

/**
 * Temps de lecture en minutes, sur une base de 200 mots/minute — la fourchette
 * habituellement retenue pour du français courant. On retire le balisage
 * Markdown pour ne pas compter les URLs et la syntaxe.
 */
export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
