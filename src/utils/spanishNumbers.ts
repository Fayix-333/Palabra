/**
 * Spanish Number Utilities & Cardinal Converter
 * Accurately translates any integer (0 to 9,999,999) to standard Spanish words
 * strictly following Real Academia Española (RAE) orthographic rules.
 */

import { VocabularyItem } from '../types';

const ONES: Record<number, string> = {
  0: 'cero',
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve',
};

const TENS: Record<number, string> = {
  30: 'treinta',
  40: 'cuarenta',
  50: 'cincuenta',
  60: 'sesenta',
  70: 'setenta',
  80: 'ochenta',
  90: 'noventa',
};

const HUNDREDS: Record<number, string> = {
  100: 'ciento',
  200: 'doscientos',
  300: 'trescientos',
  400: 'cuatrocientos',
  500: 'quinientos',
  600: 'seiscientos',
  700: 'setecientos',
  800: 'ochocientos',
  900: 'novecientos',
};

/**
 * Converts numbers 0 - 99 to Spanish words.
 * Handles apocope 'un' if before noun / mil (isBeforeNoun = true).
 */
function under100(n: number, isBeforeNoun = false): string {
  if (n <= 29) {
    if (isBeforeNoun && n === 1) return 'un';
    if (isBeforeNoun && n === 21) return 'veintiún';
    return ONES[n];
  }
  const tensDigit = Math.floor(n / 10) * 10;
  const unit = n % 10;
  if (unit === 0) {
    return TENS[tensDigit];
  }
  const unitWord = isBeforeNoun && unit === 1 ? 'un' : ONES[unit];
  return `${TENS[tensDigit]} y ${unitWord}`;
}

/**
 * Converts numbers 0 - 999 to Spanish words.
 */
function under1000(n: number, isBeforeNoun = false): string {
  if (n < 100) {
    return under100(n, isBeforeNoun);
  }
  if (n === 100) {
    return 'cien';
  }
  const hundreds = Math.floor(n / 100) * 100;
  const remainder = n % 100;
  const hundredsWord = HUNDREDS[hundreds];
  if (remainder === 0) {
    return hundredsWord;
  }
  return `${hundredsWord} ${under100(remainder, isBeforeNoun)}`;
}

/**
 * Converts any non-negative integer up to 999,999,999 to Spanish words.
 * Examples:
 * - 1546 => "mil quinientos cuarenta y seis"
 * - 2345 => "dos mil trescientos cuarenta y cinco"
 * - 1000000 => "un millón"
 */
export function numberToSpanish(n: number): string {
  if (!Number.isFinite(n) || n < 0) return 'cero';
  n = Math.floor(n);

  if (n < 1000) {
    return under1000(n, false);
  }

  // 1,000 to 999,999
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;

    let thousandsPart = '';
    if (thousands === 1) {
      thousandsPart = 'mil'; // Never "un mil" in standard Spanish
    } else {
      thousandsPart = `${under1000(thousands, true)} mil`;
    }

    if (remainder === 0) {
      return thousandsPart;
    }
    return `${thousandsPart} ${under1000(remainder, false)}`;
  }

  // 1,000,000 to 999,999,999
  const millions = Math.floor(n / 1000000);
  const remainderAfterMillions = n % 1000000;

  let millionsPart = '';
  if (millions === 1) {
    millionsPart = 'un millón';
  } else {
    millionsPart = `${under1000(millions, true)} millones`;
  }

  if (remainderAfterMillions === 0) {
    return millionsPart;
  }

  return `${millionsPart} ${numberToSpanish(remainderAfterMillions)}`;
}

/**
 * Generates accepted alternative spellings for a number (e.g., regional or colloquially accepted forms)
 */
export function getSpanishNumberAlternatives(n: number): string[] {
  const alts = new Set<string>();
  const primary = numberToSpanish(n);

  // If contains "veintiún mil", also accept "veintiuno mil"
  if (primary.includes('veintiún mil')) {
    alts.add(primary.replace('veintiún mil', 'veintiuno mil'));
  }
  // If contains "treinta y un mil", also accept "treinta y uno mil"
  if (primary.includes(' y un mil')) {
    alts.add(primary.replace(' y un mil', ' y uno mil'));
  }
  // If starts with "mil", some speakers colloquially say "un mil"
  if (primary.startsWith('mil ') || primary === 'mil') {
    alts.add(`un ${primary}`);
  }

  alts.delete(primary);
  return Array.from(alts);
}

/**
 * Converts integer to English words for prompt clarity.
 */
function numberToEnglish(n: number): string {
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen',
  ];
  const b = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
  ];

  if (n === 0) return 'zero';

  function convert(num: number): string {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + a[num % 10] : '');
    if (num < 1000) {
      return (
        a[Math.floor(num / 100)] +
        ' hundred' +
        (num % 100 !== 0 ? ' and ' + convert(num % 100) : '')
      );
    }
    if (num < 1000000) {
      return (
        convert(Math.floor(num / 1000)) +
        ' thousand' +
        (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '')
      );
    }
    return (
      convert(Math.floor(num / 1000000)) +
      ' million' +
      (num % 1000000 !== 0 ? ' ' + convert(num % 1000000) : '')
    );
  }

  return convert(n);
}

export type NumberRangePreset = 'mixed' | '2_digits' | '3_digits' | '4_digits' | 'thousands_user' | 'all';

/**
 * Generates a random number within pedagogical sweet spots:
 * includes 4-digit numbers like 2345, 1546 as specifically requested by user!
 */
export function getRandomNumber(preset: NumberRangePreset = 'mixed'): number {
  if (preset === '2_digits') {
    return Math.floor(Math.random() * 80) + 20; // 20 - 99
  }
  if (preset === '3_digits') {
    return Math.floor(Math.random() * 900) + 100; // 100 - 999
  }
  if (preset === '4_digits') {
    return Math.floor(Math.random() * 9000) + 1000; // 1000 - 9999 (e.g. 2345, 1546)
  }
  if (preset === 'thousands_user') {
    // Specifically favors rich 4-digit and 3-digit numbers with mixed tens & hundreds
    const pool = [2345, 1546, 387, 4521, 1024, 7689, 5312, 9450, 1984, 2026, 6734, 8115];
    if (Math.random() < 0.35) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return Math.floor(Math.random() * 8999) + 1001;
  }

  // Default 'mixed': 60% 4-digits (1000-9999 like 2345, 1546), 25% 3-digits (100-999), 15% 2-digits (21-99)
  const roll = Math.random();
  if (roll < 0.60) {
    return Math.floor(Math.random() * 9000) + 1000; // 1,000 - 9,999 (e.g. 2345, 1546)
  } else if (roll < 0.85) {
    return Math.floor(Math.random() * 900) + 100; // 100 - 999
  } else {
    return Math.floor(Math.random() * 80) + 20; // 20 - 99
  }
}

/**
 * Creates a synthetic VocabularyItem for any random number.
 * Allows seamless integration with Quiz.tsx question engine.
 */
export function createRandomNumberItem(n: number): VocabularyItem {
  const spanish = numberToSpanish(n);
  const english = `${n.toLocaleString('en-US')} (${numberToEnglish(n)})`;
  const formattedNum = n.toLocaleString('en-US');
  const alts = getSpanishNumberAlternatives(n);

  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (n < 100) difficulty = 'easy';
  else if (n > 1000) difficulty = 'hard';

  return {
    id: `rand-num-${n}-${Math.random().toString(36).slice(2, 6)}`,
    spanish,
    english: formattedNum,
    category: 'numbers',
    difficulty,
    hasAccents: /[áéíóúñÁÉÍÓÚÑ]/.test(spanish),
    examplePhrase: `El total es ${spanish}. (The total is ${formattedNum})`,
    memoryHint: `Break down into: ${n >= 1000 ? Math.floor(n / 1000) + ' mil + ' : ''}${n % 1000}`,
    alternatives: [english, ...alts],
  };
}

/**
 * Generates a full array of unique random number items.
 */
export function generateRandomNumbersPool(count: number, preset: NumberRangePreset = 'mixed'): VocabularyItem[] {
  const usedNumbers = new Set<number>();
  const items: VocabularyItem[] = [];

  // Guarantee inclusion of popular requested samples if pool size allows
  const featured = [2345, 1546, 387, 4520, 1985];
  for (const fn of featured) {
    if (items.length < count && !usedNumbers.has(fn)) {
      usedNumbers.add(fn);
      items.push(createRandomNumberItem(fn));
    }
  }

  while (items.length < count) {
    const num = getRandomNumber(preset);
    if (!usedNumbers.has(num)) {
      usedNumbers.add(num);
      items.push(createRandomNumberItem(num));
    }
  }

  // Shuffle the pool so order varies
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}
