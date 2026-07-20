// Platform metadata used across the app
export const PLATFORMS = {
  codeforces: {
    name: 'Codeforces',
    key: 'codeforces',
    color: '#1C86EE',
    bg: 'rgba(28,134,238,0.12)',
    logo: 'CF',
    url: 'https://codeforces.com/profile/',
  },
  leetcode: {
    name: 'LeetCode',
    key: 'leetcode',
    color: '#FFA116',
    bg: 'rgba(255,161,22,0.12)',
    logo: 'LC',
    url: 'https://leetcode.com/',
  },
  codechef: {
    name: 'CodeChef',
    key: 'codechef',
    color: '#945ACF',
    bg: 'rgba(148,90,207,0.12)',
    logo: 'CC',
    url: 'https://www.codechef.com/users/',
  },
  atcoder: {
    name: 'AtCoder',
    key: 'atcoder',
    color: '#00C0C0',
    bg: 'rgba(0,192,192,0.12)',
    logo: 'AC',
    url: 'https://atcoder.jp/users/',
  },
  github: {
    name: 'GitHub',
    key: 'github',
    color: '#6E5494',
    bg: 'rgba(110,84,148,0.12)',
    logo: 'GH',
    url: 'https://github.com/',
  },
};

// Topic colors for radar/bar charts
export const TOPIC_COLORS = {
  'Dynamic Programming': '#FF4136',
  'Graphs': '#3B82F6',
  'Trees': '#22C55E',
  'Greedy': '#F59E0B',
  'Binary Search': '#8B5CF6',
  'Data Structures': '#EC4899',
  'Math': '#06B6D4',
  'Strings': '#F97316',
  'Sorting': '#10B981',
  'Two Pointers': '#84CC16',
};

// Difficulty color map (Codeforces-style)
export const DIFFICULTY_COLORS = {
  '800':  '#CCCCCC',
  '900':  '#CCCCCC',
  '1000': '#CCCCCC',
  '1100': '#77FF77',
  '1200': '#77FF77',
  '1300': '#77DDBB',
  '1400': '#AAAAFF',
  '1500': '#AAAAFF',
  '1600': '#FF88FF',
  '1700': '#FFCC88',
  '1800': '#FFCC88',
  '1900': '#FF7777',
  '2000': '#FF7777',
  '2100': '#FF3333',
  '2200': '#FF3333',
  '2300': '#FF0000',
  '2400': '#FF0000',
  '2500': '#FF0000',
  '2600': '#FF0000',
  '2700': '#AA0000',
  '2800': '#AA0000',
  '2900': '#AA0000',
  '3000': '#AA0000',
};

export const API_BASE = '/api/v1';
