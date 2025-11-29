export const CEREAL_CROPS = [
  {
    id: 'rice',
    name: 'Rice',
    nameHindi: 'चावल',
    icon: '🌾',
    varieties: ['Basmati', 'Sona Masuri', 'IR64', 'Swarna'],
  },
  {
    id: 'wheat',
    name: 'Wheat',
    nameHindi: 'गेहूं',
    icon: '🌾',
    varieties: ['PBW 343', 'HD 2967', 'WH 1105', 'Lok 1'],
  },
  {
    id: 'maize',
    name: 'Maize',
    nameHindi: 'मक्का',
    icon: '🌽',
    varieties: ['DHM 117', 'PMH 1', 'Vivek Hybrid 9'],
  },
] as const;

export const OILSEED_CROPS = [
  {
    id: 'groundnut',
    name: 'Groundnut',
    nameHindi: 'मूंगफली',
    icon: '🥜',
    varieties: [
      'TMV 2',
      'TMV 7',
      'VRI 2',
      'JL 24',
      'Kadiri 3',
      'Spanish',
      'Virginia',
    ],
  },
  {
    id: 'mustard',
    name: 'Mustard',
    nameHindi: 'सरसों',
    icon: '🌾',
    varieties: [
      'Pusa Bold',
      'Pusa Jai Kisan',
      'RH 30',
      'RH 406',
      'Varuna',
      'Kranti',
    ],
  },
  {
    id: 'sesame',
    name: 'Sesame',
    nameHindi: 'तिल',
    icon: '🌱',
    varieties: [
      'RT 46',
      'RT 125',
      'RT 346',
      'Gujarat Til 2',
      'Phule Til',
    ],
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    nameHindi: 'सूरजमुखी',
    icon: '🌻',
    varieties: [
      'KBSH 1',
      'KBSH 44',
      'MSFH 17',
      'Phule Bhaskar',
      'Co 4',
    ],
  },
  {
    id: 'soybean',
    name: 'Soybean',
    nameHindi: 'सोयाबीन',
    icon: '🫘',
    varieties: [
      'JS 335',
      'JS 9305',
      'JS 9560',
      'JS 20-29',
      'MAUS 71',
    ],
  },
  {
    id: 'safflower',
    name: 'Safflower',
    nameHindi: 'कुसुम',
    icon: '🌼',
    varieties: [
      'PBNS 12',
      'PBNS 40',
      'Sharda',
      'Bhima',
    ],
  },
  {
    id: 'niger',
    name: 'Niger Seed',
    nameHindi: 'रामतिल',
    icon: '⚫',
    varieties: [
      'GA 10',
      'Ootacamund',
      'Dharwad Local',
    ],
  },
  {
    id: 'linseed',
    name: 'Linseed',
    nameHindi: 'अलसी',
    icon: '🟤',
    varieties: [
      'Shubhra',
      'Shekhar',
      'Neelam',
      'T 397',
    ],
  },
  {
    id: 'castor',
    name: 'Castor',
    nameHindi: 'अरंडी',
    icon: '🫛',
    varieties: [
      'GCH 4',
      'GCH 7',
      'DCH 177',
      'DCH 519',
    ],
  },
] as const;

export const PULSES_CROPS = [
  {
    id: 'chickpea',
    name: 'Chickpea',
    nameHindi: 'चना',
    icon: '🫘',
    varieties: ['JG 11', 'JG 14', 'Pusa 372', 'Virat'],
  },
  {
    id: 'pigeon_pea',
    name: 'Pigeon Pea',
    nameHindi: 'अरहर',
    icon: '🫘',
    varieties: ['Asha', 'Narendra Arhar 1', 'UPAS 120'],
  },
] as const;

export const VEGETABLE_CROPS = [
  {
    id: 'tomato',
    name: 'Tomato',
    nameHindi: 'टमाटर',
    icon: '🍅',
    varieties: ['Pusa Ruby', 'Arka Vikas', 'Hisar Arun'],
  },
  {
    id: 'potato',
    name: 'Potato',
    nameHindi: 'आलू',
    icon: '🥔',
    varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Chandramukhi'],
  },
  {
    id: 'onion',
    name: 'Onion',
    nameHindi: 'प्याज',
    icon: '🧅',
    varieties: ['Nasik Red', 'Pusa Red', 'Agrifound Light Red'],
  },
] as const;

// Combine all crops
export const CROPS = [
  ...CEREAL_CROPS,
  ...OILSEED_CROPS,
  ...PULSES_CROPS,
  ...VEGETABLE_CROPS,
] as const;

export const QUALITY_GRADES = [
  { value: 'A+', label: 'A+ (Premium)', minOilContent: 48 },
  { value: 'A', label: 'A (Good)', minOilContent: 45 },
  { value: 'B', label: 'B (Average)', minOilContent: 42 },
  { value: 'C', label: 'C (Below Average)', minOilContent: 38 },
] as const;

export const PACKAGING_TYPES = [
  { value: 'jute_bags', label: 'Jute Bags (50 kg)', icon: '🛍️' },
  { value: 'plastic_bags', label: 'Plastic Bags (50 kg)', icon: '🎒' },
  { value: 'bulk', label: 'Bulk (Loose)', icon: '📦' },
] as const;