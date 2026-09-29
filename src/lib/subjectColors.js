/**
 * Centralized Subject Color Mapping
 * Maps subjects to Notion-style pastel tag classes defined in index.css:
 * - notion-tag-blue
 * - notion-tag-purple
 * - notion-tag-green
 * - notion-tag-orange
 * - notion-tag-red
 * - notion-tag-gray
 */

export const SUBJECT_COLOR_MAP = {
  // Web & Core Programming
  'pemrograman web': 'notion-tag-blue',
  'web': 'notion-tag-blue',

  // Database
  'basis data': 'notion-tag-purple',
  'database': 'notion-tag-purple',

  // Multimedia & Desktop
  'pemrograman berbasis teks dan multimedia': 'notion-tag-orange',
  'pbtm': 'notion-tag-orange',

  // Entrepreneurship & Creativity
  'kik (kreativitas, inovasi, dan kewirausahaan)': 'notion-tag-green',
  'kik': 'notion-tag-green',
  'pkwu': 'notion-tag-green',

  // Languages
  'bahasa indonesia': 'notion-tag-blue',
  'bahasa inggris': 'notion-tag-blue',

  // Exact & Science
  'matematika': 'notion-tag-red',

  // Religion & Civic
  'agama': 'notion-tag-green',
  'pendidikan agama': 'notion-tag-green',
  'pendidikan agama islam': 'notion-tag-green',
  'ppkn': 'notion-tag-red',
  'pkn': 'notion-tag-red',

  // Sports & Physical
  'pjok': 'notion-tag-green',

  // Hardware / Systems
  'iot': 'notion-tag-purple',

  // Social & Character
  'sejarah': 'notion-tag-orange',
  'bk': 'notion-tag-gray',
  'bimbingan konseling': 'notion-tag-gray',
  'p5': 'notion-tag-orange'
};

const PALETTE = [
  'notion-tag-blue',
  'notion-tag-purple',
  'notion-tag-green',
  'notion-tag-orange',
  'notion-tag-red',
  'notion-tag-gray'
];

/**
 * Returns the CSS class for a given subject name.
 * Uses exact or normalized match, with a deterministic string hash fallback.
 */
export const getSubjectTagClass = (subjectName) => {
  if (!subjectName || typeof subjectName !== 'string') {
    return 'notion-tag-gray';
  }

  const normalized = subjectName.trim().toLowerCase();

  if (SUBJECT_COLOR_MAP[normalized]) {
    return SUBJECT_COLOR_MAP[normalized];
  }

  // Partial match check
  for (const [key, tagClass] of Object.entries(SUBJECT_COLOR_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return tagClass;
    }
  }

  // Deterministic fallback for custom/new subjects
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
};
