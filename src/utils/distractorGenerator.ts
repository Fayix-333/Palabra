/**
 * Confusable Distractor Generator for Multiple Choice Questions (MCQs)
 * Generates 3 tricky, realistic spelling and accent mistake variations for any Spanish word or number.
 * Ensures that among the 4 choices, ONLY the single correct answer is valid!
 */

import { VocabularyItem } from '../types';
import { stripVowelAccents } from './answerChecker';

/**
 * Spanish accented to plain and vice versa mapping
 */
const VOWELS_UNACCENTED = ['a', 'e', 'i', 'o', 'u'];
const VOWELS_ACCENTED: Record<string, string> = {
  a: 'á',
  e: 'é',
  i: 'í',
  o: 'ó',
  u: 'ú',
  A: 'Á',
  E: 'É',
  I: 'Í',
  O: 'Ó',
  U: 'Ú',
};
const VOWELS_REVERSE: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  Á: 'a',
  É: 'e',
  Í: 'i',
  Ó: 'o',
  Ú: 'u',
};

/**
 * Checks if a string contains any Spanish written accent mark (á, é, í, ó, ú)
 */
function hasWrittenAccent(text: string): boolean {
  return /[áéíóúÁÉÍÓÚ]/.test(text);
}

/**
 * Strips all written accents from vowels (e.g. dieciséis -> dieciseis, plátano -> platano)
 */
function removeAccents(text: string): string {
  return stripVowelAccents(text);
}

/**
 * Shifts the accent mark to a different vowel in the word
 * e.g. "miércoles" -> "miercóles" or "miercolés"
 * e.g. "plátano" -> "platáno"
 * e.g. "dieciséis" -> "diecíseis"
 */
function shiftAccent(text: string): string[] {
  const results: string[] = [];
  const unaccented = removeAccents(text);
  if (unaccented === text) return [];

  // Find all vowel indices in unaccented
  const vowelIndices: number[] = [];
  for (let i = 0; i < unaccented.length; i++) {
    const ch = unaccented[i].toLowerCase();
    if (VOWELS_UNACCENTED.includes(ch)) {
      vowelIndices.push(i);
    }
  }

  // Find which vowel had the accent originally
  let origVowelIndex = -1;
  for (let i = 0; i < text.length; i++) {
    if (/[áéíóúÁÉÍÓÚ]/.test(text[i])) {
      origVowelIndex = i;
      break;
    }
  }

  for (const idx of vowelIndices) {
    if (idx !== origVowelIndex) {
      const origChar = unaccented[idx];
      const acc = VOWELS_ACCENTED[origChar];
      if (acc) {
        const shifted = unaccented.slice(0, idx) + acc + unaccented.slice(idx + 1);
        if (shifted !== text && !results.includes(shifted)) {
          results.push(shifted);
        }
      }
    }
  }

  return results;
}

/**
 * Adds a false accent to an unaccented word
 * e.g. "zanahoria" -> "zanahoría", "amarillo" -> "amaríllo", "azul" -> "ázul", "manzana" -> "mánzana"
 */
function addFalseAccent(text: string): string[] {
  const results: string[] = [];
  const words = text.split(' ');

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const word = words[wIdx];
    if (word.length <= 1) continue;

    // Try adding accent on penultimate vowel (very natural Spanish trap) or ultimate
    const vowelIndices: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (VOWELS_UNACCENTED.includes(word[i].toLowerCase())) {
        vowelIndices.push(i);
      }
    }

    // Try each vowel
    for (const vIdx of vowelIndices) {
      const char = word[vIdx];
      const accented = VOWELS_ACCENTED[char];
      if (accented) {
        const mutatedWord = word.slice(0, vIdx) + accented + word.slice(vIdx + 1);
        const newWords = [...words];
        newWords[wIdx] = mutatedWord;
        const candidate = newWords.join(' ');
        if (candidate !== text && !results.includes(candidate)) {
          results.push(candidate);
        }
      }
    }
  }

  return results;
}

/**
 * Phonological & Orthographic Spanish Mutation Rules:
 * - b <-> v (betacismo)
 * - z <-> s, c(e/i) <-> s (seseo / ceceo)
 * - ll <-> y (yeísmo)
 * - g(e/i) <-> j (j/g confusion)
 * - silent h dropped or added
 * - m before p/b -> n (regla de m antes de p y b)
 * - qu <-> c / k
 * - compound numbers (veintidós -> veinte y dos, dieciséis -> diez y seis)
 * - irregular number stems (quinientos -> cincocientos, setecientos -> sietecientos, novecientos -> nuevecientos)
 */
function generateOrthographicMutations(text: string): string[] {
  const mutations: string[] = [];
  const lower = text.toLowerCase();

  // 1. Specific Spanish Number Compound & Irregular Traps
  if (lower.includes('quinientos')) {
    mutations.push(text.replace(/quinientos/gi, 'cincocientos'));
    mutations.push(text.replace(/quinientos/gi, 'quincientos'));
  }
  if (lower.includes('setecientos')) {
    mutations.push(text.replace(/setecientos/gi, 'sietecientos'));
  }
  if (lower.includes('novecientos')) {
    mutations.push(text.replace(/novecientos/gi, 'nuevecientos'));
  }
  if (lower.includes('trescientos')) {
    mutations.push(text.replace(/trescientos/gi, 'trecientos')); // Common error: missing s before c
  }
  if (lower.includes('seiscientos')) {
    mutations.push(text.replace(/seiscientos/gi, 'seicientos'));
  }
  if (lower.includes('doscientos')) {
    mutations.push(text.replace(/doscientos/gi, 'docientos'));
  }
  if (lower.includes('dieciséis') || lower.includes('dieciseis')) {
    mutations.push(text.replace(/dieciséis|dieciseis/gi, 'diez y seis'));
    mutations.push(text.replace(/dieciséis|dieciseis/gi, 'diesiséis'));
    mutations.push(text.replace(/dieciséis|dieciseis/gi, 'diez y séis'));
  }
  if (lower.includes('diecisiete')) {
    mutations.push(text.replace(/diecisiete/gi, 'diez y siete'));
    mutations.push(text.replace(/diecisiete/gi, 'diesisiete'));
  }
  if (lower.includes('dieciocho')) {
    mutations.push(text.replace(/dieciocho/gi, 'diez y ocho'));
  }
  if (lower.includes('diecinueve')) {
    mutations.push(text.replace(/diecinueve/gi, 'diez y nueve'));
    mutations.push(text.replace(/diecinueve/gi, 'diecinuebe'));
  }
  if (lower.includes('veinte')) {
    mutations.push(text.replace(/veinte/gi, 'beinte'));
  }
  if (lower.includes('veintiuno')) {
    mutations.push(text.replace(/veintiuno/gi, 'veinte y uno'));
  }
  if (lower.includes('veintidós') || lower.includes('veintidos')) {
    mutations.push(text.replace(/veintidós|veintidos/gi, 'veinte y dos'));
    mutations.push(text.replace(/veintidós|veintidos/gi, 'veintedós'));
  }
  if (lower.includes('veintitrés') || lower.includes('veintitres')) {
    mutations.push(text.replace(/veintitrés|veintitres/gi, 'veinte y tres'));
    mutations.push(text.replace(/veintitrés|veintitres/gi, 'veintetrés'));
  }
  if (lower.includes('veinticuatro')) {
    mutations.push(text.replace(/veinticuatro/gi, 'veinte y cuatro'));
  }
  if (lower.includes('veinticinco')) {
    mutations.push(text.replace(/veinticinco/gi, 'veinte y cinco'));
    mutations.push(text.replace(/veinticinco/gi, 'veintisinco'));
  }
  if (lower.includes('veintiséis') || lower.includes('veintiseis')) {
    mutations.push(text.replace(/veintiséis|veintiseis/gi, 'veinte y seis'));
    mutations.push(text.replace(/veintiséis|veintiseis/gi, 'veintisiez'));
  }
  if (lower.includes('veintisiete')) {
    mutations.push(text.replace(/veintisiete/gi, 'veinte y siete'));
  }
  if (lower.includes('veintiocho')) {
    mutations.push(text.replace(/veintiocho/gi, 'veinte y ocho'));
  }
  if (lower.includes('veintinueve')) {
    mutations.push(text.replace(/veintinueve/gi, 'veinte y nueve'));
    mutations.push(text.replace(/veintinueve/gi, 'veintinuebe'));
  }

  // Multi-word number join / split error (e.g. "cuarenta y cinco" -> "cuarentaicinco" or "cuarentaycinco")
  if (lower.includes(' y ')) {
    mutations.push(text.replace(/\s+y\s+/gi, 'y'));
    mutations.push(text.replace(/\s+y\s+/gi, 'i'));
    mutations.push(text.replace(/\s+y\s+/gi, ' e ')); // e instead of y
  }

  // Thousands: "dos mil" -> "dosmil" or "mil" -> "un mil"
  if (lower.startsWith('mil ') && !lower.startsWith('un mil')) {
    mutations.push(`un ${text}`); // "un mil" mistake
  }
  if (lower.includes(' mil')) {
    mutations.push(text.replace(/\s+mil/gi, 'mil')); // joining "dos mil" -> "dosmil"
  }

  // 2. Betacism: b <-> v
  if (lower.includes('b')) {
    mutations.push(text.replace(/b/g, 'v').replace(/B/g, 'V'));
  }
  if (lower.includes('v')) {
    mutations.push(text.replace(/v/g, 'b').replace(/V/g, 'B'));
  }

  // 3. Seseo / Ceceo: z -> s, c before e/i -> s, s -> z
  if (lower.includes('z')) {
    mutations.push(text.replace(/z/g, 's').replace(/Z/g, 'S'));
  }
  if (/c[eéií]/i.test(text)) {
    mutations.push(text.replace(/c([eéií])/gi, 's$1'));
  }
  if (lower.includes('s') && !lower.includes('z')) {
    mutations.push(text.replace(/s/g, 'z').replace(/S/g, 'Z'));
  }

  // 4. Yeísmo: ll <-> y
  if (lower.includes('ll')) {
    mutations.push(text.replace(/ll/g, 'y').replace(/LL/g, 'Y'));
  }
  if (lower.includes('y') && !lower.includes(' y ')) {
    mutations.push(text.replace(/y/g, 'll').replace(/Y/g, 'LL'));
  }

  // 5. Silent H: omit if present, or prepend if starts with vowel
  if (lower.includes('h')) {
    mutations.push(text.replace(/h/g, '').replace(/H/g, ''));
  } else if (/^[aeiou]/i.test(text)) {
    mutations.push(`h${text}`);
  }

  // 6. J vs G before e/i
  if (/j[eéií]/i.test(text)) {
    mutations.push(text.replace(/j([eéií])/gi, 'g$1'));
  }
  if (/g[eéií]/i.test(text)) {
    mutations.push(text.replace(/g([eéií])/gi, 'j$1'));
  }

  // 7. m before p/b vs n
  if (/m[pb]/i.test(text)) {
    mutations.push(text.replace(/m([pb])/gi, 'n$1'));
  }

  // 8. qu <-> c / k
  if (lower.includes('qu')) {
    mutations.push(text.replace(/qu/gi, 'c'));
    mutations.push(text.replace(/qu/gi, 'k'));
  }

  // 9. English-influence double letters (mm, tt, pp, nn, ff)
  if (lower.includes('m') && !lower.includes('mm')) {
    mutations.push(text.replace(/m/g, 'mm'));
  }
  if (lower.includes('t') && !lower.includes('tt')) {
    mutations.push(text.replace(/t/g, 'tt'));
  }
  if (lower.includes('f') && !lower.includes('ff')) {
    mutations.push(text.replace(/f/g, 'ff'));
  }

  // 10. Vowel / ending confusion (e.g. -a -> -o, -o -> -a, -e -> -i)
  if (lower.endsWith('a') && text.length > 3) {
    mutations.push(text.slice(0, -1) + 'o');
    mutations.push(text.slice(0, -1) + 'e');
  } else if (lower.endsWith('o') && text.length > 3) {
    mutations.push(text.slice(0, -1) + 'a');
  } else if (lower.endsWith('es') && text.length > 4) {
    mutations.push(text.slice(0, -2) + 'is');
  }

  return Array.from(new Set(mutations.filter((m) => m && m.trim() !== text.trim())));
}

/**
 * Generates 3 tricky, realistic distractors with spelling/accent errors
 * guaranteed to NOT match the correct answer or any accepted alternative.
 */
export function generateConfusableDistractors(
  correctSpanish: string,
  vocab?: VocabularyItem,
  fallbackPool?: VocabularyItem[]
): string[] {
  const cleanCorrect = correctSpanish.trim();
  const invalidSet = new Set<string>();

  // Never allow the correct answer as a distractor!
  invalidSet.add(cleanCorrect.toLowerCase());
  if (vocab?.spanish) invalidSet.add(vocab.spanish.toLowerCase().trim());
  if (vocab?.alternatives) {
    for (const alt of vocab.alternatives) {
      invalidSet.add(alt.toLowerCase().trim());
    }
  }

  const candidatePool: string[] = [];

  // 1. If word has an accent, stripping the accent is the #1 classic mistake tested in exams
  if (hasWrittenAccent(cleanCorrect)) {
    const stripped = removeAccents(cleanCorrect);
    if (!invalidSet.has(stripped.toLowerCase())) {
      candidatePool.push(stripped);
    }
  }

  // 2. High-value orthographic & compound errors (e.g. b/v, c/s/z, ll/y, silent h, trecientos, cincocientos, diez y seis)
  const orthMutations = generateOrthographicMutations(cleanCorrect);
  for (const om of orthMutations) {
    if (!invalidSet.has(om.toLowerCase())) {
      candidatePool.push(om);
    }
  }

  // 3. Shift accent (e.g. plátano -> platáno, miércoles -> miercóles, dieciséis -> diecíseis)
  if (hasWrittenAccent(cleanCorrect)) {
    const shifted = shiftAccent(cleanCorrect);
    for (const s of shifted) {
      if (!invalidSet.has(s.toLowerCase())) {
        candidatePool.push(s);
      }
    }
  } else {
    // False accent on unaccented single words (e.g. zanahoria -> zanahoría, azul -> ázul, manzana -> mánzana)
    // Only if not a long multi-word phrase
    if (!cleanCorrect.includes(' ')) {
      const falseAccented = addFalseAccent(cleanCorrect);
      for (const fa of falseAccented) {
        if (!invalidSet.has(fa.toLowerCase())) {
          candidatePool.push(fa);
        }
      }
    }
  }

  // 4. Combined accent + spelling mutations (e.g. zanahoria -> sanahoría, dieciséis -> diesiseis)
  for (const om of orthMutations.slice(0, 5)) {
    if (hasWrittenAccent(om)) {
      const omStripped = removeAccents(om);
      if (!invalidSet.has(omStripped.toLowerCase())) {
        candidatePool.push(omStripped);
      }
    } else if (!om.includes(' ')) {
      const omAccented = addFalseAccent(om);
      for (const oma of omAccented) {
        if (!invalidSet.has(oma.toLowerCase())) {
          candidatePool.push(oma);
        }
      }
    }
  }

  // Filter unique candidates
  const uniqueDistractors: string[] = [];
  const seen = new Set<string>();

  for (const c of candidatePool) {
    const norm = c.toLowerCase().trim();
    if (!seen.has(norm) && !invalidSet.has(norm) && c.length > 0) {
      seen.add(norm);
      uniqueDistractors.push(c.trim());
      if (uniqueDistractors.length === 3) break;
    }
  }

  // If still fewer than 3 distractors, generate algorithmic minor character tweaks
  if (uniqueDistractors.length < 3) {
    // Minor vowel substitutions (e.g. e <-> i, o <-> u)
    const words = cleanCorrect.split(' ');
    for (let w = 0; w < words.length && uniqueDistractors.length < 3; w++) {
      const word = words[w];
      const vowelTweakMap: Record<string, string> = { e: 'i', i: 'e', o: 'u', u: 'o' };
      for (let i = word.length - 1; i >= 0 && uniqueDistractors.length < 3; i--) {
        const ch = word[i].toLowerCase();
        if (vowelTweakMap[ch]) {
          const tweaked = word.slice(0, i) + vowelTweakMap[ch] + word.slice(i + 1);
          const copy = [...words];
          copy[w] = tweaked;
          const fullTweaked = copy.join(' ');
          const norm = fullTweaked.toLowerCase().trim();
          if (!seen.has(norm) && !invalidSet.has(norm)) {
            seen.add(norm);
            uniqueDistractors.push(fullTweaked);
          }
        }
      }
    }
  }

  // If still fewer than 3, fallback to sibling category words with simulated accent tweaks
  if (uniqueDistractors.length < 3 && fallbackPool && fallbackPool.length > 0) {
    const otherWords = fallbackPool
      .filter((v) => !invalidSet.has(v.spanish.toLowerCase()))
      .sort(() => 0.5 - Math.random());

    for (const other of otherWords) {
      if (uniqueDistractors.length >= 3) break;
      const otherSpan = other.spanish.trim();
      const norm = otherSpan.toLowerCase();
      if (!seen.has(norm) && !invalidSet.has(norm)) {
        seen.add(norm);
        uniqueDistractors.push(otherSpan);
      }
    }
  }

  return uniqueDistractors.slice(0, 3);
}
