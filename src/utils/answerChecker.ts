import { VocabularyItem } from '../types';

export interface EvaluationResult {
  isCorrect: boolean;
  isStrictCorrect: boolean;
  missingAccent: boolean;
  matchedAnswer: string;
  expectedPrimary: string;
  feedback?: string;
}

/**
 * Normalizes text by trimming whitespace, collapsing multiple spaces, and lowercasing.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Removes Spanish accent marks from vowels (á -> a, é -> e, í -> i, ó -> o, ú -> u, ü -> u).
 * Crucially leaves 'ñ' intact because ñ is an independent Spanish letter, not an accented n.
 */
export function stripVowelAccents(text: string): string {
  return text
    .replace(/[áä]/g, 'a')
    .replace(/[éë]/g, 'e')
    .replace(/[íï]/g, 'i')
    .replace(/[óö]/g, 'o')
    .replace(/[úü]/g, 'u');
}

/**
 * Strips punctuation like leading ¿, ¡, periods, commas, question marks.
 */
export function stripPunctuation(text: string): string {
  return text.replace(/[¿?¡!.,;:]/g, '').trim();
}

/**
 * Strips common Spanish articles (el, la, los, las, un, una) if at start of string.
 */
export function stripDefiniteArticles(text: string): string {
  return text.replace(/^(el|la|los|las|un|una)\s+/i, '').trim();
}

/**
 * Evaluates a user response against a VocabularyItem.
 * @param userInput The student's typed answer
 * @param item The target VocabularyItem
 * @param strictAccents Whether accents and exact spelling are strictly enforced
 */
export function evaluateAnswer(
  userInput: string,
  item: VocabularyItem,
  strictAccents: boolean
): EvaluationResult {
  const rawInput = normalizeText(userInput);
  const cleanInput = stripPunctuation(rawInput);
  const cleanInputNoArticles = stripDefiniteArticles(cleanInput);

  if (!cleanInput) {
    return {
      isCorrect: false,
      isStrictCorrect: false,
      missingAccent: false,
      matchedAnswer: '',
      expectedPrimary: item.spanish,
      feedback: 'No answer provided.',
    };
  }

  // Build candidate valid answers: primary + alternatives
  const validAnswers = [item.spanish, ...(item.alternatives || [])];

  // 1. Strict check: exact normalized match with accents
  for (const ans of validAnswers) {
    const rawAns = normalizeText(ans);
    const cleanAns = stripPunctuation(rawAns);
    const cleanAnsNoArticles = stripDefiniteArticles(cleanAns);

    if (
      cleanInput === cleanAns ||
      cleanInputNoArticles === cleanAns ||
      cleanInput === cleanAnsNoArticles ||
      cleanInputNoArticles === cleanAnsNoArticles
    ) {
      return {
        isCorrect: true,
        isStrictCorrect: true,
        missingAccent: false,
        matchedAnswer: ans,
        expectedPrimary: item.spanish,
      };
    }
  }

  // 2. Accent-insensitive check (vowels stripped, ñ preserved)
  const inputNoAccents = stripVowelAccents(cleanInput);
  const inputNoAccentsNoArticles = stripDefiniteArticles(inputNoAccents);

  for (const ans of validAnswers) {
    const rawAns = normalizeText(ans);
    const cleanAns = stripPunctuation(rawAns);
    const ansNoAccents = stripVowelAccents(cleanAns);
    const ansNoAccentsNoArticles = stripDefiniteArticles(ansNoAccents);

    if (
      inputNoAccents === ansNoAccents ||
      inputNoAccentsNoArticles === ansNoAccents ||
      inputNoAccents === ansNoAccentsNoArticles ||
      inputNoAccentsNoArticles === ansNoAccentsNoArticles
    ) {
      if (strictAccents) {
        return {
          isCorrect: false,
          isStrictCorrect: false,
          missingAccent: true,
          matchedAnswer: ans,
          expectedPrimary: item.spanish,
          feedback: `Watch the accents! Correct spelling is "${ans}".`,
        };
      } else {
        return {
          isCorrect: true,
          isStrictCorrect: false,
          missingAccent: true,
          matchedAnswer: ans,
          expectedPrimary: item.spanish,
          feedback: `Correct! Note the accents: "${ans}".`,
        };
      }
    }
  }

  // 3. Reverse check (for Spanish to English direction if applicable)
  const cleanEn = normalizeText(stripPunctuation(item.english));
  const cleanEnNoArticles = stripDefiniteArticles(cleanEn);
  if (
    cleanInput === cleanEn ||
    cleanInputNoArticles === cleanEn ||
    cleanInput === cleanEnNoArticles
  ) {
    return {
      isCorrect: true,
      isStrictCorrect: true,
      missingAccent: false,
      matchedAnswer: item.english,
      expectedPrimary: item.spanish,
    };
  }

  // Incorrect answer
  return {
    isCorrect: false,
    isStrictCorrect: false,
    missingAccent: false,
    matchedAnswer: '',
    expectedPrimary: item.spanish,
    feedback: `Incorrect. Expected "${item.spanish}".`,
  };
}
