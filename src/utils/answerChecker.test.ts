import {
  normalizeText,
  stripVowelAccents,
  stripDefiniteArticles,
  evaluateAnswer,
} from './answerChecker';
import { VocabularyItem } from '../types';

export function runTests(): { total: number; passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${desc}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${desc}`);
    }
  }

  console.log('--- Testing Answer Normalization & Punctuation ---');
  assert(normalizeText('  Plátano   ') === 'plátano', 'Trims whitespace & lowercases');
  assert(stripDefiniteArticles('el plátano') === 'plátano', 'Strips definite article "el"');
  assert(stripDefiniteArticles('la manzana') === 'manzana', 'Strips definite article "la"');
  assert(stripDefiniteArticles('los días') === 'días', 'Strips definite article "los"');

  console.log('--- Testing Spanish Vowel Accent Stripping ---');
  assert(stripVowelAccents('dieciséis') === 'dieciseis', 'Strips é from dieciséis');
  assert(stripVowelAccents('miércoles') === 'miercoles', 'Strips é from miércoles');
  assert(stripVowelAccents('sábado') === 'sabado', 'Strips á from sábado');
  assert(stripVowelAccents('piña') === 'piña', 'Preserves ñ (does not turn into n)');

  console.log('--- Testing Strict vs Non-Strict Accent Evaluation ---');
  const miercolesItem: VocabularyItem = {
    id: 'test-wed',
    english: 'Wednesday',
    spanish: 'miércoles',
    alternatives: ['el miércoles'],
    category: 'days',
    hasAccents: true,
    difficulty: 'medium',
  };

  // 1. Strict mode with correct accents
  const res1 = evaluateAnswer('miércoles', miercolesItem, true);
  assert(res1.isCorrect && res1.isStrictCorrect, 'Strict mode: correct accent matches');

  // 2. Strict mode with missing accent
  const res2 = evaluateAnswer('miercoles', miercolesItem, true);
  assert(!res2.isCorrect && res2.missingAccent, 'Strict mode: missing accent rejected');

  // 3. Non-strict mode with missing accent
  const res3 = evaluateAnswer('miercoles', miercolesItem, false);
  assert(res3.isCorrect && !res3.isStrictCorrect, 'Non-strict mode: accepts missing accent');

  // 4. Case-insensitivity and article tolerance
  const res4 = evaluateAnswer('EL MIÉRCOLES', miercolesItem, true);
  assert(res4.isCorrect, 'Accepts uppercase and leading article');

  console.log('--- Testing Accepted Alternative Translations (Regional Variants) ---');
  const potatoItem: VocabularyItem = {
    id: 'test-potato',
    english: 'Potato',
    spanish: 'papa',
    alternatives: ['patata', 'la papa', 'la patata'],
    category: 'vegetables',
    hasAccents: false,
    difficulty: 'easy',
  };

  assert(evaluateAnswer('papa', potatoItem, true).isCorrect, 'Accepts primary "papa"');
  assert(evaluateAnswer('patata', potatoItem, true).isCorrect, 'Accepts alternative "patata"');
  assert(evaluateAnswer('la patata', potatoItem, true).isCorrect, 'Accepts "la patata"');
  assert(!evaluateAnswer('tomate', potatoItem, true).isCorrect, 'Rejects incorrect word');

  console.log('--- Testing Number Accents (dieciséis, veintidós, veintitrés, veintiséis, un millón) ---');
  const num22: VocabularyItem = {
    id: 'test-22',
    english: 'Twenty-two',
    spanish: 'veintidós',
    alternatives: ['veinte y dos'],
    category: 'numbers',
    hasAccents: true,
    difficulty: 'medium',
  };
  assert(evaluateAnswer('veintidós', num22, true).isStrictCorrect, 'Matches veintidós strictly');
  assert(evaluateAnswer('veinte y dos', num22, true).isCorrect, 'Matches alternative "veinte y dos"');

  const num1M: VocabularyItem = {
    id: 'test-1m',
    english: 'One million',
    spanish: 'un millón',
    alternatives: ['millón'],
    category: 'numbers',
    hasAccents: true,
    difficulty: 'hard',
  };
  assert(evaluateAnswer('un millón', num1M, true).isStrictCorrect, 'Matches un millón strictly');
  assert(!evaluateAnswer('un millon', num1M, true).isCorrect, 'Rejects un millon in strict mode');

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  return { total: passed + failed, passed, failed };
}

// If executed via node / tsx directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('answerChecker.test')) {
  const { failed } = runTests();
  if (failed > 0) process.exit(1);
}
