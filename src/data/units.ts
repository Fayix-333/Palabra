import { CategoryId } from '../types';

export interface LessonNode {
  id: string;
  unitId: number;
  title: string;
  subtitle: string;
  category: CategoryId | 'mixed';
  xpReward: number;
  vocabIds: string[];
  type: 'lesson' | 'checkpoint' | 'test' | 'speed';
  position: 'left' | 'center' | 'right';
  description: string;
}

export interface LearningUnit {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  bannerColor: string;
  borderColor: string;
  iconName: string;
  lessons: LessonNode[];
}

export const LEARNING_UNITS: LearningUnit[] = [
  {
    id: 1,
    title: 'UNIT 1 — Alphabet Adventure',
    subtitle: 'Spanish Letter Names & Sounds',
    description: 'Master all 27 letter names, vowels, and special consonants like eñe, hache and uve.',
    color: '#58CC02',
    bannerColor: 'from-emerald-500 to-green-600',
    borderColor: '#46A302',
    iconName: 'Type',
    lessons: [
      {
        id: 'u1-l1',
        unitId: 1,
        title: 'Letters A through M',
        subtitle: 'First half of the alphabet',
        category: 'alphabets',
        xpReward: 20,
        vocabIds: [
          'alpha-a', 'alpha-b', 'alpha-c', 'alpha-d', 'alpha-e',
          'alpha-f', 'alpha-g', 'alpha-h', 'alpha-i', 'alpha-j',
          'alpha-k', 'alpha-l', 'alpha-m'
        ],
        type: 'lesson',
        position: 'center',
        description: 'Learn letter names from A (a) to M (eme), including hache and jota.',
      },
      {
        id: 'u1-l2',
        unitId: 1,
        title: 'Letters N through Z & Ñ',
        subtitle: 'Eñe, uve, and rare letters',
        category: 'alphabets',
        xpReward: 20,
        vocabIds: [
          'alpha-n', 'alpha-nn', 'alpha-o', 'alpha-p', 'alpha-q',
          'alpha-r', 'alpha-s', 'alpha-t', 'alpha-u', 'alpha-v',
          'alpha-w', 'alpha-x', 'alpha-y', 'alpha-z'
        ],
        type: 'lesson',
        position: 'right',
        description: 'Master the emblematic eñe, uve, uve doble, and zeta.',
      },
      {
        id: 'u1-l3',
        unitId: 1,
        title: 'Vowels & Consonant Pairs',
        subtitle: 'Letter recognition drill',
        category: 'alphabets',
        xpReward: 20,
        vocabIds: [
          'alpha-a', 'alpha-e', 'alpha-i', 'alpha-o', 'alpha-u',
          'alpha-b', 'alpha-v', 'alpha-w', 'alpha-h', 'alpha-nn'
        ],
        type: 'lesson',
        position: 'left',
        description: 'Distinguish tricky pairs like be vs uve and master vowel sounds.',
      },
      {
        id: 'u1-chk',
        unitId: 1,
        title: 'Alphabet Master Checkpoint',
        subtitle: 'Full 27-letter evaluation',
        category: 'alphabets',
        xpReward: 50,
        vocabIds: [
          'alpha-a', 'alpha-b', 'alpha-c', 'alpha-d', 'alpha-e', 'alpha-f',
          'alpha-g', 'alpha-h', 'alpha-i', 'alpha-j', 'alpha-k', 'alpha-l',
          'alpha-m', 'alpha-n', 'alpha-nn', 'alpha-o', 'alpha-p', 'alpha-q',
          'alpha-r', 'alpha-s', 'alpha-t', 'alpha-u', 'alpha-v', 'alpha-w',
          'alpha-x', 'alpha-y', 'alpha-z'
        ],
        type: 'checkpoint',
        position: 'center',
        description: 'Prove complete mastery of the official Spanish alphabet for TN.31 PALABRA.',
      },
    ],
  },
  {
    id: 2,
    title: 'UNIT 2 — Number Quest',
    subtitle: 'From 0 to One Million',
    description: 'Learn number spelling rules, compound numbers, and accent traps like dieciséis and veintidós.',
    color: '#1CB0F6',
    bannerColor: 'from-blue-500 to-cyan-600',
    borderColor: '#1899D6',
    iconName: 'Hash',
    lessons: [
      {
        id: 'u2-l1',
        unitId: 2,
        title: 'Numbers 0 to 10',
        subtitle: 'Foundations of counting',
        category: 'numbers',
        xpReward: 20,
        vocabIds: [
          'num-0', 'num-1', 'num-2', 'num-3', 'num-4',
          'num-5', 'num-6', 'num-7', 'num-8', 'num-9', 'num-10'
        ],
        type: 'lesson',
        position: 'center',
        description: 'Zero to ten: cero, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.',
      },
      {
        id: 'u2-l2',
        unitId: 2,
        title: 'Numbers 11 to 20',
        subtitle: 'Once, doce, and dieciséis',
        category: 'numbers',
        xpReward: 20,
        vocabIds: [
          'num-11', 'num-12', 'num-13', 'num-14', 'num-15',
          'num-16', 'num-17', 'num-18', 'num-19', 'num-20'
        ],
        type: 'lesson',
        position: 'left',
        description: 'Focus on irregular teens and the accent on dieciséis.',
      },
      {
        id: 'u2-l3',
        unitId: 2,
        title: 'Numbers 21 to 100',
        subtitle: 'Veintidós, veintitrés, veintiséis',
        category: 'numbers',
        xpReward: 20,
        vocabIds: [
          'num-21', 'num-22', 'num-23', 'num-24', 'num-25',
          'num-26', 'num-27', 'num-28', 'num-29', 'num-30',
          'num-31', 'num-32', 'num-40', 'num-50', 'num-60',
          'num-70', 'num-80', 'num-90', 'num-100'
        ],
        type: 'lesson',
        position: 'right',
        description: 'Master single-word compounds with accents and tens up to cien.',
      },
      {
        id: 'u2-l4',
        unitId: 2,
        title: 'Hundreds & Large Numbers',
        subtitle: 'Quinientos, novecientos, un millón',
        category: 'numbers',
        xpReward: 20,
        vocabIds: [
          'num-101', 'num-200', 'num-300', 'num-400', 'num-500',
          'num-600', 'num-700', 'num-800', 'num-900', 'num-1000',
          'num-2000', 'num-10000', 'num-100000', 'num-1000000'
        ],
        type: 'lesson',
        position: 'center',
        description: 'Learn irregular roots (quinientos, setecientos, novecientos) and un millón.',
      },
      {
        id: 'u2-chk',
        unitId: 2,
        title: 'Number Quest Checkpoint',
        subtitle: 'Comprehensive number challenge',
        category: 'numbers',
        xpReward: 50,
        vocabIds: [
          'num-0', 'num-5', 'num-10', 'num-15', 'num-16', 'num-20',
          'num-22', 'num-23', 'num-26', 'num-30', 'num-50', 'num-100',
          'num-500', 'num-700', 'num-900', 'num-1000', 'num-1000000'
        ],
        type: 'checkpoint',
        position: 'right',
        description: 'Test all number accent traps and large numbers in one rapid challenge.',
      },
    ],
  },
  {
    id: 3,
    title: 'UNIT 3 — Calendar Master',
    subtitle: 'Days, Months & Time',
    description: 'Learn all seven days, twelve months, lowercase rules, and accents on miércoles & sábado.',
    color: '#FF9600',
    bannerColor: 'from-amber-500 to-orange-600',
    borderColor: '#E58500',
    iconName: 'Calendar',
    lessons: [
      {
        id: 'u3-l1',
        unitId: 3,
        title: 'Days of the Week',
        subtitle: 'Lunes through domingo',
        category: 'days',
        xpReward: 20,
        vocabIds: [
          'day-mon', 'day-tue', 'day-wed', 'day-thu',
          'day-fri', 'day-sat', 'day-sun', 'day-day', 'day-week', 'day-weekend'
        ],
        type: 'lesson',
        position: 'center',
        description: 'All 7 days of the week, with special focus on miércoles and sábado accents.',
      },
      {
        id: 'u3-l2',
        unitId: 3,
        title: 'Months of the Year',
        subtitle: 'Enero through diciembre',
        category: 'months',
        xpReward: 20,
        vocabIds: [
          'month-jan', 'month-feb', 'month-mar', 'month-apr',
          'month-may', 'month-jun', 'month-jul', 'month-aug',
          'month-sep', 'month-oct', 'month-nov', 'month-dec',
          'month-month', 'month-year'
        ],
        type: 'lesson',
        position: 'left',
        description: 'Learn all 12 months in Spanish. Remember: lowercase is the standard!',
      },
      {
        id: 'u3-chk',
        unitId: 3,
        title: 'Calendar Master Checkpoint',
        subtitle: 'Days & months challenge',
        category: 'days',
        xpReward: 50,
        vocabIds: [
          'day-mon', 'day-wed', 'day-sat', 'day-sun',
          'month-jan', 'month-apr', 'month-jul', 'month-sep', 'month-dec'
        ],
        type: 'checkpoint',
        position: 'center',
        description: 'Prove flawless calendar translation and spelling accuracy.',
      },
    ],
  },
  {
    id: 4,
    title: 'UNIT 4 — Colour World',
    subtitle: 'Primary, Secondary & Shades',
    description: 'Learn primary colors, metallic hues, gender agreement, and synonyms like marrón/café.',
    color: '#CE82FF',
    bannerColor: 'from-purple-500 to-indigo-600',
    borderColor: '#A55EEA',
    iconName: 'Palette',
    lessons: [
      {
        id: 'u4-l1',
        unitId: 4,
        title: 'Primary & Core Colours',
        subtitle: 'Rojo, azul, verde, amarillo',
        category: 'colours',
        xpReward: 20,
        vocabIds: [
          'col-red', 'col-blue', 'col-green', 'col-yellow',
          'col-orange', 'col-black', 'col-white', 'col-grey'
        ],
        type: 'lesson',
        position: 'center',
        description: 'Basic color palette and gender variations (rojo/roja, blanco/blanca).',
      },
      {
        id: 'u4-l2',
        unitId: 4,
        title: 'Shades & Metallic Hues',
        subtitle: 'Marrón, dorado, celeste, crema',
        category: 'colours',
        xpReward: 20,
        vocabIds: [
          'col-brown', 'col-purple', 'col-pink', 'col-gold',
          'col-silver', 'col-lightblue', 'col-darkblue', 'col-beige',
          'col-turquoise', 'col-violet', 'col-cream'
        ],
        type: 'lesson',
        position: 'right',
        description: 'Advanced shades including marrón, café, celeste, plateado, and crema.',
      },
      {
        id: 'u4-chk',
        unitId: 4,
        title: 'Colour World Checkpoint',
        subtitle: 'Full palette quiz',
        category: 'colours',
        xpReward: 50,
        vocabIds: [
          'col-red', 'col-blue', 'col-yellow', 'col-brown',
          'col-pink', 'col-gold', 'col-lightblue', 'col-purple', 'col-cream'
        ],
        type: 'checkpoint',
        position: 'center',
        description: 'Show total command of color translations and spelling.',
      },
    ],
  },
  {
    id: 5,
    title: 'UNIT 5 — Fruit Fiesta',
    subtitle: '30+ Fruits & Regional Variants',
    description: 'Learn fruits from the PALABRA handbook, accents on limón, plátano, sandía, and regional pairs.',
    color: '#FF4B4B',
    bannerColor: 'from-rose-500 to-red-600',
    borderColor: '#EA2B2B',
    iconName: 'Apple',
    lessons: [
      {
        id: 'u5-l1',
        unitId: 5,
        title: 'Orchard & Common Fruits',
        subtitle: 'Manzana, plátano, naranja, fresa',
        category: 'fruits',
        xpReward: 20,
        vocabIds: [
          'fr-apple', 'fr-banana', 'fr-orange', 'fr-strawberry',
          'fr-grape', 'fr-lemon', 'fr-lime', 'fr-pear', 'fr-peach'
        ],
        type: 'lesson',
        position: 'center',
        description: 'Staple fruit vocabulary with accents on plátano and limón.',
      },
      {
        id: 'u5-l2',
        unitId: 5,
        title: 'Tropical & Exotic Fruits',
        subtitle: 'Piña, sandía, mango, papaya, yaca',
        category: 'fruits',
        xpReward: 20,
        vocabIds: [
          'fr-pineapple', 'fr-watermelon', 'fr-melon', 'fr-mango',
          'fr-papaya', 'fr-guava', 'fr-pomegranate', 'fr-jackfruit',
          'fr-custardapple', 'fr-coconut'
        ],
        type: 'lesson',
        position: 'left',
        description: 'Tropical handbook entries including piña (ñ), sandía (í), and yaca.',
      },
      {
        id: 'u5-l3',
        unitId: 5,
        title: 'Berry, Stone & Special Fruits',
        subtitle: 'Arándano, cereza, ciruela, dátil, aceituna',
        category: 'fruits',
        xpReward: 20,
        vocabIds: [
          'fr-cherry', 'fr-plum', 'fr-kiwi', 'fr-raspberry',
          'fr-blueberry', 'fr-blackberry', 'fr-avocado', 'fr-fig',
          'fr-date', 'fr-grapefruit', 'fr-olive', 'fr-apricot'
        ],
        type: 'lesson',
        position: 'right',
        description: 'Challenging accents: arándano, dátil, melocotón, aceituna, and aguacate.',
      },
      {
        id: 'u5-chk',
        unitId: 5,
        title: 'Fruit Fiesta Checkpoint',
        subtitle: 'Fruit master speed round',
        category: 'fruits',
        xpReward: 50,
        vocabIds: [
          'fr-apple', 'fr-banana', 'fr-pineapple', 'fr-watermelon',
          'fr-lemon', 'fr-peach', 'fr-blueberry', 'fr-date', 'fr-jackfruit'
        ],
        type: 'checkpoint',
        position: 'center',
        description: 'Complete the Fruit Fiesta evaluation with zero mistakes!',
      },
    ],
  },
  {
    id: 6,
    title: 'UNIT 6 — Veggie Voyage',
    subtitle: '30+ Garden & Farm Vegetables',
    description: 'Learn vegetables from the PALABRA handbook, silent h in zanahoria, accents on brócoli & maíz.',
    color: '#00CD9C',
    bannerColor: 'from-teal-500 to-emerald-600',
    borderColor: '#00A880',
    iconName: 'Carrot',
    lessons: [
      {
        id: 'u6-l1',
        unitId: 6,
        title: 'Garden & Salad Staples',
        subtitle: 'Zanahoria, tomate, papa/patata, cebolla',
        category: 'vegetables',
        xpReward: 20,
        vocabIds: [
          'veg-carrot', 'veg-tomato', 'veg-potato', 'veg-onion',
          'veg-garlic', 'veg-lettuce', 'veg-spinach', 'veg-cucumber', 'veg-cabbage'
        ],
        type: 'lesson',
        position: 'center',
        description: 'Essential kitchen vegetables. Watch silent h in zanahoria!',
      },
      {
        id: 'u6-l2',
        unitId: 6,
        title: 'Leafy, Pod & Exotic Veggies',
        subtitle: 'Quingombó, berenjena, judías, moringa',
        category: 'vegetables',
        xpReward: 20,
        vocabIds: [
          'veg-eggplant', 'veg-okra', 'veg-peas', 'veg-beans',
          'veg-greenchilli', 'veg-bittergourd', 'veg-drumstick', 'veg-pepper'
        ],
        type: 'lesson',
        position: 'right',
        description: 'Specific handbook entries: quingombó, melón amargo, judías, moringa.',
      },
      {
        id: 'u6-l3',
        unitId: 6,
        title: 'Root, Corn & Accented Veggies',
        subtitle: 'Brócoli, maíz, champiñón, espárrago',
        category: 'vegetables',
        xpReward: 20,
        vocabIds: [
          'veg-broccoli', 'veg-corn', 'veg-mushroom', 'veg-asparagus',
          'veg-zucchini', 'veg-sweetpotato', 'veg-beetroot', 'veg-radish',
          'veg-celery', 'veg-leek', 'veg-ginger', 'veg-pumpkin'
        ],
        type: 'lesson',
        position: 'left',
        description: 'Key accent traps: maíz (í), brócoli (ó), champiñón (ó), espárrago (á).',
      },
      {
        id: 'u6-chk',
        unitId: 6,
        title: 'Veggie Voyage Checkpoint',
        subtitle: 'Vegetable spelling mastery',
        category: 'vegetables',
        xpReward: 50,
        vocabIds: [
          'veg-carrot', 'veg-potato', 'veg-okra', 'veg-eggplant',
          'veg-corn', 'veg-broccoli', 'veg-mushroom', 'veg-asparagus', 'veg-zucchini'
        ],
        type: 'checkpoint',
        position: 'center',
        description: 'Master all spelling challenges across garden and root vegetables.',
      },
    ],
  },
  {
    id: 7,
    title: 'UNIT 7 — Sibaq Champion',
    subtitle: 'Grand Review & Speed Sprint',
    description: 'Mixed syllabus drills, rapid typing reflexes, and comprehensive competition readiness.',
    color: '#FFC800',
    bannerColor: 'from-amber-400 to-yellow-600',
    borderColor: '#E5A500',
    iconName: 'Trophy',
    lessons: [
      {
        id: 'u7-l1',
        unitId: 7,
        title: 'Accent & Spelling Trap Sprint',
        subtitle: 'Top 25 competition trap words',
        category: 'mixed',
        xpReward: 25,
        vocabIds: [
          'num-16', 'num-22', 'num-23', 'num-26', 'num-1000000',
          'day-wed', 'day-sat', 'col-brown', 'fr-banana', 'fr-pineapple',
          'fr-watermelon', 'fr-lemon', 'fr-peach', 'fr-blueberry',
          'veg-carrot', 'veg-okra', 'veg-corn', 'veg-broccoli',
          'veg-mushroom', 'veg-asparagus', 'veg-zucchini'
        ],
        type: 'speed',
        position: 'center',
        description: 'Dedicated high-intensity drill on accented words and tricky letter spellings.',
      },
      {
        id: 'u7-l2',
        unitId: 7,
        title: 'Syllabus Cross-Training',
        subtitle: 'Mixed questions from all 7 areas',
        category: 'mixed',
        xpReward: 25,
        vocabIds: [
          'alpha-h', 'alpha-nn', 'num-15', 'num-500', 'day-fri',
          'month-aug', 'col-gold', 'fr-strawberry', 'fr-jackfruit',
          'veg-garlic', 'veg-drumstick'
        ],
        type: 'lesson',
        position: 'left',
        description: 'Rapid context switching across all official competition subjects.',
      },
      {
        id: 'u7-chk',
        unitId: 7,
        title: 'Sibaq Grand Champion Exam',
        subtitle: 'Ultimate readiness evaluation',
        category: 'mixed',
        xpReward: 100,
        vocabIds: [
          'alpha-w', 'num-16', 'num-23', 'num-700', 'day-wed',
          'month-sep', 'col-brown', 'fr-watermelon', 'fr-pineapple',
          'fr-blueberry', 'veg-carrot', 'veg-okra', 'veg-corn', 'veg-asparagus'
        ],
        type: 'test',
        position: 'center',
        description: 'The final qualification checkpoint before entering the 60-Minute Sibaq Arena!',
      },
    ],
  },
];
