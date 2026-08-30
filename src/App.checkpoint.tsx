import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Volume2, VolumeX, Trophy, Heart, Flame, RotateCcw, Home, BarChart2,
  ChevronDown, ChevronRight, Play, Sparkles, X, Trash2, ArrowLeft, Grid, Check, Image, Plus,
  Award, Lock, ShieldCheck, Medal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuestionData, StatRecord, PlayerData, GroupStatsRecord } from './types';
import { BADGES, BadgeItem, getBadgeRepeatCount } from './badges';
import { AslanSVG } from './components/Mascot';
import { Geometry3DLab } from './components/Geometry3DLab';
import { GlossyRoundButton, GlossyPillButton, GlossyCompleteCard, GlossyArrowIcon, GlossyScreenRotateIcon, GoldCoinDisplayCard } from './components/GameUIButtons';
import { ModernStatsView, Cute3DStarMascotSVG } from './components/ModernStatsView';
import { ChromaKeyVideo } from './components/ChromaKeyVideo';

// --- SVG & IMAGE DATA & HELPERS ---
const SINIF_OGRENCILERI = [
  "AYBÜKE", "BETÜL SARE", "BUĞLEM", "ÇINAR EYMEN", "DERİN DEFNE", "EFEKAN",
  "ELİF SU", "ESLEM", "EYMEN", "GÜNEŞ", "HARUN", "MİRAÇ", "MUHAMMED EYMEN",
  "OSMAN EMİR", "ÖMER ASAF", "ÖMER FARUK", "RAVZA", "SUDEM", "UMUT", "ZEYNEP",
  "ZİLAN", "ÖYKÜ LİYA", "HARUN ALİ"
];

function toTitleCaseTR(str: string): string {
  return str
    .split(' ')
    .map(word => {
      if (!word) return '';
      const lower = word.toLocaleLowerCase('tr-TR');
      return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
    })
    .join(' ');
}

function getRastgeleOgrenci(): string {
  const raw = SINIF_OGRENCILERI[Math.floor(Math.random() * SINIF_OGRENCILERI.length)];
  return toTitleCaseTR(raw);
}

const CISIM_SVG: Record<string, string> = {
  kup: '<img src="/geos/kups.png" alt="Küp" class="w-full h-full object-contain filter drop-shadow-md" />',
  kure: '<img src="/geos/kures.png" alt="Küre" class="w-full h-full object-contain filter drop-shadow-md" />',
  silindir: '<img src="/geos/slndrs.png" alt="Silindir" class="w-full h-full object-contain filter drop-shadow-md" />',
  dikdortgen_prizma: '<img src="/geos/dikdprz.png" alt="Dikdörtgenler Prizması" class="w-full h-full object-contain filter drop-shadow-md" />',
  kare_prizma: '<img src="/geos/kareprz.png" alt="Kare Prizma" class="w-full h-full object-contain filter drop-shadow-md" />',
  ucgen_prizma: '<img src="/geos/ucgenprz.png" alt="Üçgen Prizma" class="w-full h-full object-contain filter drop-shadow-md" />'
};

const CISIM_OZELLIK: Record<string, { ad: string; yüz: number; ayrıt: number; köşe: number }> = {
  kup: { ad: 'Küp', yüz: 6, ayrıt: 12, köşe: 8 },
  kure: { ad: 'Küre', yüz: 1, ayrıt: 0, köşe: 0 },
  silindir: { ad: 'Silindir', yüz: 3, ayrıt: 0, köşe: 0 },
  dikdortgen_prizma: { ad: 'Dikdörtgenler Prizması', yüz: 6, ayrıt: 12, köşe: 8 },
  kare_prizma: { ad: 'Kare Prizma', yüz: 6, ayrıt: 12, köşe: 8 },
  ucgen_prizma: { ad: 'Üçgen Prizma', yüz: 5, ayrıt: 9, köşe: 6 }
};

function getCisimTamlayan(ad: string): string {
  switch (ad) {
    case 'Küp': return "Küp'ün";
    case 'Küre': return "Kürenin";
    case 'Silindir': return "Silindirin";
    case 'Dikdörtgenler Prizması': return "Dikdörtgenler Prizmasının";
    case 'Kare Prizma': return "Kare Prizmasının";
    case 'Üçgen Prizma': return "Üçgen Prizmanın";
    default: return `${ad}'nin`;
  }
}

function getIsimTamlayan(isim: string): string {
  const clean = toTitleCaseTR(isim.trim());
  if (!clean) return isim;

  // "Su" istisnası (ör. Elif Su -> Elif Su'yun)
  if (clean.endsWith("Su")) {
    return `${clean}'yun`;
  }

  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  const lastChar = clean.slice(-1).toLowerCase();
  const isVowel = vowels.includes(lastChar);

  let lastVowel = 'i';
  for (let i = clean.length - 1; i >= 0; i--) {
    const char = clean[i].toLowerCase();
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }

  let suffix = '';
  if (['a', 'ı'].includes(lastVowel)) suffix = isVowel ? 'nın' : 'ın';
  else if (['e', 'i'].includes(lastVowel)) suffix = isVowel ? 'nin' : 'in';
  else if (['o', 'u'].includes(lastVowel)) suffix = isVowel ? 'nun' : 'un';
  else if (['ö', 'ü'].includes(lastVowel)) suffix = isVowel ? 'nün' : 'ün';

  return `${clean}'${suffix}`;
}

// Cins isimlerde kesme işareti KULLANILMAZ ve ünsüz yumuşaması/ses uyumları uygulanır
function getNesneBelirtme(nesne: string): string {
  const dict: Record<string, string> = {
    "kitap": "kitabı",
    "oyuncak": "oyuncağı",
    "kalem": "kalemi",
    "defter": "defteri",
    "top": "topu",
    "şapka": "şapkayı",
    "çanta": "çantayı",
    "kalemlik": "kalemliği",
    "silgi": "silgiyi",
    "elma": "elmayı",
    "karpuz": "karpuzu",
    "domates": "domatesi",
    "pizza": "pizzayı",
    "waffle": "waffle'ı",
    "biber": "biberi",
    "portakal": "portakalı",
    "kivi": "kiviyi",
    "armut": "armudu",
    "çilek": "çileği",
    "cilek": "çileği",
    "muz": "muzu",
    "limon": "limonu",
    "üzüm": "üzümü",
    "uzum": "üzümü",
    "şeftali": "şeftaliyi",
    "seftali": "şeftaliyi",
    "ananas": "ananası",
    "kiraz": "kirazı",
    "kavun": "kavunu",
    "mandalina": "mandalinayı",
    "erik": "eriği",
    "kurabiye": "kurabiyeyi",
    "donut": "donutu",
    "ceviz": "cevizi",
    "fındık": "fındığı",
    "bilye": "bilyeyi",
    "balon": "balonu",
    "çıkartma": "çıkartmayı",
    "ekmek": "ekmeği",
    "pasta": "pastayı"
  };
  const key = nesne.toLowerCase().trim();
  if (dict[key]) return dict[key];

  const clean = nesne.trim();
  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  const lastChar = clean.slice(-1).toLowerCase();
  const isVowel = vowels.includes(lastChar);

  let stem = clean;
  if (!isVowel) {
    if (stem.endsWith('k') || stem.endsWith('K')) stem = stem.slice(0, -1) + 'ğ';
    else if (stem.endsWith('p') || stem.endsWith('P')) stem = stem.slice(0, -1) + 'b';
    else if (stem.endsWith('ç') || stem.endsWith('Ç')) stem = stem.slice(0, -1) + 'c';
    else if (stem.endsWith('t') || stem.endsWith('T')) stem = stem.slice(0, -1) + 'd';
  }

  let lastVowel = 'i';
  for (let i = clean.length - 1; i >= 0; i--) {
    const char = clean[i].toLowerCase();
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }

  let suffix = '';
  if (['a', 'ı'].includes(lastVowel)) suffix = isVowel ? 'yı' : 'ı';
  else if (['e', 'i'].includes(lastVowel)) suffix = isVowel ? 'yi' : 'i';
  else if (['o', 'u'].includes(lastVowel)) suffix = isVowel ? 'yu' : 'u';
  else if (['ö', 'ü'].includes(lastVowel)) suffix = isVowel ? 'yü' : 'ü';

  return stem + suffix;
}

function getNesneAyrilma(nesne: string): string {
  const dict: Record<string, string> = {
    "kitap": "kitaptan",
    "oyuncak": "oyuncaktan",
    "kalem": "kalemden",
    "defter": "defterden",
    "top": "toptan",
    "şapka": "şapkadan",
    "çanta": "çantadan",
    "kalemlik": "kalemlikten",
    "silgi": "silgiden",
    "elma": "elmadan",
    "karpuz": "karpuzdan",
    "domates": "domatesten",
    "pizza": "pizzadan",
    "waffle": "waffle'dan",
    "biber": "biberden",
    "portakal": "portakaldan",
    "kivi": "kividen",
    "armut": "armuttan",
    "çilek": "çilekten",
    "cilek": "çilekten",
    "muz": "muzdan",
    "limon": "limondan",
    "üzüm": "üzümden",
    "uzum": "üzümden",
    "şeftali": "şeftaliden",
    "seftali": "şeftaliden",
    "ananas": "ananasdan",
    "kiraz": "kirazdan",
    "kavun": "kavundan",
    "mandalina": "mandalinadan",
    "erik": "erikten",
    "kurabiye": "kurabiyeden",
    "donut": "donuttan",
    "ceviz": "cevizden",
    "fındık": "fındıktan",
    "bilye": "bilyeden",
    "balon": "balondan",
    "çıkartma": "çıkartmadan"
  };
  const key = nesne.toLowerCase().trim();
  if (dict[key]) return dict[key];

  const clean = nesne.trim();
  const fistikci = ['f', 's', 't', 'k', 'ç', 'ş', 'h', 'p'];
  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  const lastChar = clean.slice(-1).toLowerCase();

  let lastVowel = 'i';
  for (let i = clean.length - 1; i >= 0; i--) {
    const char = clean[i].toLowerCase();
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }

  const startChar = fistikci.includes(lastChar) ? 't' : 'd';
  const endChar = ['a', 'ı', 'o', 'u'].includes(lastVowel) ? 'an' : 'en';

  return clean + startChar + endChar;
}

function getNesneYonelme(nesne: string): string {
  const dict: Record<string, string> = {
    "kitap": "kitaba",
    "oyuncak": "oyuncağa",
    "kalem": "kaleme",
    "defter": "deftere",
    "top": "topa",
    "şapka": "şapkaya",
    "çanta": "çantaya",
    "kalemlik": "kalemliğe",
    "silgi": "silgiye",
    "elma": "elmaya",
    "karpuz": "karpuza",
    "domates": "domatese",
    "pizza": "pizzaya",
    "waffle": "waffle'a",
    "biber": "bibere",
    "portakal": "portakala",
    "kivi": "kiviye",
    "armut": "armuda",
    "çilek": "çileğe",
    "cilek": "çileğe",
    "muz": "muza",
    "limon": "limona",
    "üzüm": "üzüme",
    "uzum": "üzüme",
    "şeftali": "şeftaliye",
    "seftali": "şeftaliye",
    "ananas": "ananasa",
    "kiraz": "kiraza",
    "kavun": "kavuna",
    "mandalina": "mandalinaya",
    "erik": "eriğe",
    "kurabiye": "kurabiyeye",
    "donut": "donuta",
    "ceviz": "cevize",
    "fındık": "fındığa",
    "bilye": "bilyeye",
    "balon": "balona"
  };
  const key = nesne.toLowerCase().trim();
  if (dict[key]) return dict[key];

  const clean = nesne.trim();
  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  const lastChar = clean.slice(-1).toLowerCase();
  const isVowel = vowels.includes(lastChar);

  let stem = clean;
  if (!isVowel) {
    if (stem.endsWith('k') || stem.endsWith('K')) stem = stem.slice(0, -1) + 'ğ';
    else if (stem.endsWith('p') || stem.endsWith('P')) stem = stem.slice(0, -1) + 'b';
    else if (stem.endsWith('ç') || stem.endsWith('Ç')) stem = stem.slice(0, -1) + 'c';
    else if (stem.endsWith('t') || stem.endsWith('T')) stem = stem.slice(0, -1) + 'd';
  }

  let lastVowel = 'i';
  for (let i = clean.length - 1; i >= 0; i--) {
    const char = clean[i].toLowerCase();
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }

  const suffix = ['a', 'ı', 'o', 'u'].includes(lastVowel) ? (isVowel ? 'ya' : 'a') : (isVowel ? 'ye' : 'e');
  return stem + suffix;
}

function getNesneIyelik(nesne: string): string {
  const dict: Record<string, string> = {
    "bilye": "bilyesi",
    "fındık": "fındığı",
    "kalem": "kalemi",
    "çıkartma": "çıkartması",
    "balon": "balonu",
    "elma": "elması",
    "karpuz": "karpuzu",
    "domates": "domatesi",
    "pizza": "pizzası",
    "waffle": "waffle'ı",
    "biber": "biberi",
    "portakal": "portakalı",
    "kivi": "kivisi",
    "armut": "armudu",
    "çilek": "çileği",
    "cilek": "çileği",
    "muz": "muzu",
    "limon": "limonu",
    "üzüm": "üzümü",
    "uzum": "üzümü",
    "şeftali": "şeftalisi",
    "seftali": "şeftalisi",
    "ananas": "ananası",
    "kiraz": "kirazı",
    "kavun": "kavunu",
    "mandalina": "mandalinası",
    "erik": "eriği",
    "kurabiye": "kurabiyesi",
    "donut": "donutu",
    "ceviz": "cevizi",
    "oyuncak": "oyuncağı",
    "top": "topu",
    "kitap": "kitabı",
    "silgi": "silgisi",
    "kalemlik": "kalemliği"
  };
  const key = nesne.toLowerCase().trim();
  if (dict[key]) return dict[key];

  const clean = nesne.trim();
  const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
  const lastChar = clean.slice(-1).toLowerCase();
  const isVowel = vowels.includes(lastChar);

  let stem = clean;
  if (stem.endsWith('k') || stem.endsWith('K')) {
    stem = stem.slice(0, -1) + 'ğ';
  } else if (stem.endsWith('p') || stem.endsWith('P')) {
    stem = stem.slice(0, -1) + 'b';
  } else if (stem.endsWith('ç') || stem.endsWith('Ç')) {
    stem = stem.slice(0, -1) + 'c';
  } else if (stem.endsWith('t') || stem.endsWith('T')) {
    stem = stem.slice(0, -1) + 'd';
  }

  let lastVowel = 'i';
  for (let i = clean.length - 1; i >= 0; i--) {
    const char = clean[i].toLowerCase();
    if (vowels.includes(char)) {
      lastVowel = char;
      break;
    }
  }

  let suffix = '';
  if (['a', 'ı'].includes(lastVowel)) suffix = isVowel ? 'sı' : 'ı';
  else if (['e', 'i'].includes(lastVowel)) suffix = isVowel ? 'si' : 'i';
  else if (['o', 'u'].includes(lastVowel)) suffix = isVowel ? 'su' : 'u';
  else if (['ö', 'ü'].includes(lastVowel)) suffix = isVowel ? 'sü' : 'ü';

  return stem + suffix;
}

const OZELLIK_EK: Record<string, { buyuk: string; kucuk: string }> = {
  yüz: { buyuk: 'YÜZÜ', kucuk: 'yüzü' },
  ayrıt: { buyuk: 'AYRITI', kucuk: 'ayrıtı' },
  köşe: { buyuk: 'KÖŞESİ', kucuk: 'köşesi' }
};

function generateClockSVG(hour: number, minute: number): string {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const hRad = (hourAngle - 90) * (Math.PI / 180);
  const mRad = (minuteAngle - 90) * (Math.PI / 180);

  const hX = 50 + 22 * Math.cos(hRad);
  const hY = 50 + 22 * Math.sin(hRad);

  const mX = 50 + 32 * Math.cos(mRad);
  const mY = 50 + 32 * Math.sin(mRad);

  let numbersHTML = '';
  for (let h = 1; h <= 12; h++) {
    const angleRad = (h * 30 - 90) * (Math.PI / 180);
    const nx = 50 + 36 * Math.cos(angleRad);
    const ny = 50 + 36 * Math.sin(angleRad);
    numbersHTML += `<text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="7.5" font-weight="900" fill="#1E293B">${h}</text>`;
  }

  let ticksHTML = '';
  for (let m = 0; m < 60; m++) {
    if (m % 5 === 0) continue;
    const angleRad = (m * 6 - 90) * (Math.PI / 180);
    const x1 = 50 + 44 * Math.cos(angleRad);
    const y1 = 50 + 44 * Math.sin(angleRad);
    const x2 = 50 + 46 * Math.cos(angleRad);
    const y2 = 50 + 46 * Math.sin(angleRad);
    ticksHTML += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#94A3B8" stroke-width="0.8" />`;
  }

  return `
    <svg viewBox="0 0 100 100" class="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 drop-shadow-md mx-auto">
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#2563EB" stroke-width="3" />
      <circle cx="50" cy="50" r="44" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
      ${ticksHTML}
      ${numbersHTML}
      <!-- Akrep (Hour Hand - Red) -->
      <line x1="50" y1="50" x2="${hX.toFixed(1)}" y2="${hY.toFixed(1)}" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" />
      <!-- Yelkovan (Minute Hand - Blue) -->
      <line x1="50" y1="50" x2="${mX.toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="50" cy="50" r="3" fill="#1E293B" stroke="#FFFFFF" stroke-width="1" />
      <circle cx="50" cy="50" r="1.2" fill="#F59E0B" />
    </svg>
  `;
}

function benzersizYanlislar(correct: number, adaylar: number[], minVal = 0): number[] {
  const sonuc: number[] = [];
  const gorulen = new Set<number>([correct]);
  for (const aday of adaylar) {
    if (sonuc.length === 3) break;
    if (!gorulen.has(aday) && aday >= minVal) {
      gorulen.add(aday);
      sonuc.push(aday);
    }
  }
  let ek = 1;
  while (sonuc.length < 3) {
    const aday = correct + 10 + ek;
    if (!gorulen.has(aday) && aday >= minVal) {
      gorulen.add(aday);
      sonuc.push(aday);
    }
    ek++;
  }
  return sonuc;
}

const MEYVE_KESIR_LISTESI = [
  { key: 'elma', ad: 'elma' },
  { key: 'karpuz', ad: 'karpuz' },
  { key: 'portakal', ad: 'portakal' },
  { key: 'armut', ad: 'armut' },
  { key: 'kivi', ad: 'kivi' },
  { key: 'cilek', ad: 'çilek' },
  { key: 'muz', ad: 'muz' },
  { key: 'limon', ad: 'limon' },
  { key: 'uzum', ad: 'üzüm' },
  { key: 'seftali', ad: 'şeftali' },
  { key: 'ananas', ad: 'ananas' },
  { key: 'kiraz', ad: 'kiraz' },
  { key: 'kavun', ad: 'kavun' },
  { key: 'mandalina', ad: 'mandalina' },
  { key: 'erik', ad: 'erik' },
  { key: 'pizza', ad: 'pizza' },
  { key: 'kurabiye', ad: 'kurabiye' },
  { key: 'donut', ad: 'donut' },
  { key: 'waffle', ad: 'waffle' },
  { key: 'domates', ad: 'domates' },
  { key: 'biber', ad: 'biber' }
];

function benzersizYanlislarString(correctStr: string, adaylar: string[]): string[] {
  const sonuc: string[] = [];
  const gorulen = new Set<string>([correctStr]);
  for (const aday of adaylar) {
    if (sonuc.length === 3) break;
    if (aday && !gorulen.has(aday)) {
      gorulen.add(aday);
      sonuc.push(aday);
    }
  }
  let fallbackCount = 1;
  while (sonuc.length < 3) {
    const fallback = `${fallbackCount} Bütün`;
    if (!gorulen.has(fallback)) {
      gorulen.add(fallback);
      sonuc.push(fallback);
    }
    fallbackCount++;
  }
  return sonuc;
}

function getMeyveKesirSVG(key: string, durum: 'bütün' | 'yarım' | 'çeyrek', size = 80): string {
  const s = size;
  const wrap = (content: string) => `
    <svg width="${s}" height="${s}" viewBox="0 0 100 100" class="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform inline-block" xmlns="http://www.w3.org/2000/svg">
      ${content}
    </svg>
  `;

  switch (key) {
    case 'elma':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 50 22 C 40 10, 18 15, 18 45 C 18 78, 42 90, 50 88 C 58 90, 82 78, 82 45 C 82 15, 60 10, 50 22 Z" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 22 Q 52 10 58 6" stroke="#5a3825" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 56 10 Q 70 8 68 18 Q 58 18 56 10 Z" fill="#38a169"/>
          <ellipse cx="32" cy="35" rx="5" ry="12" fill="#ffffff" opacity="0.35" transform="rotate(-20 32 35)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 15 C 20 15, 18 50, 20 85 L 50 85 Z" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 17 L 50 83 C 25 83, 23 50, 50 17 Z" fill="#fefcbf" stroke="#e53e3e" stroke-width="1.5"/>
          <ellipse cx="38" cy="45" rx="2" ry="4" fill="#4a2e19" transform="rotate(-15 38 45)"/>
          <ellipse cx="42" cy="55" rx="2" ry="4" fill="#4a2e19" transform="rotate(-10 42 55)"/>
          <path d="M 50 17 Q 52 10 56 7" stroke="#5a3825" stroke-width="3" fill="none"/>
        `);
      } else {
        return wrap(`
          <path d="M 50 20 C 35 25, 25 45, 30 75 L 50 75 Z" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 22 L 50 73 L 34 73 C 30 50, 38 32, 50 22 Z" fill="#fefcbf" stroke="#e53e3e" stroke-width="1.5"/>
          <ellipse cx="42" cy="50" rx="2" ry="3.5" fill="#4a2e19" transform="rotate(-15 42 50)"/>
        `);
      }

    case 'karpuz':
      if (durum === 'bütün') {
        return wrap(`
          <ellipse cx="50" cy="50" rx="42" ry="38" fill="#276749" stroke="#1c4532" stroke-width="2"/>
          <path d="M 20 20 Q 25 50 20 80" stroke="#1c4532" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M 38 14 Q 42 50 38 86" stroke="#1c4532" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M 62 14 Q 58 50 62 86" stroke="#1c4532" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M 80 20 Q 75 50 80 80" stroke="#1c4532" stroke-width="5" fill="none" stroke-linecap="round"/>
          <ellipse cx="32" cy="32" rx="4" ry="10" fill="#ffffff" opacity="0.25" transform="rotate(-25 32 32)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 10 50 A 40 40 0 0 0 90 50 Z" fill="#276749" stroke="#1c4532" stroke-width="2"/>
          <path d="M 15 50 A 35 35 0 0 0 85 50 Z" fill="#f0fff4"/>
          <path d="M 18 50 A 32 32 0 0 0 82 50 Z" fill="#e53e3e"/>
          <ellipse cx="32" cy="62" rx="2" ry="3.5" fill="#1a202c" transform="rotate(-15 32 62)"/>
          <ellipse cx="45" cy="70" rx="2" ry="3.5" fill="#1a202c" transform="rotate(-5 45 70)"/>
          <ellipse cx="58" cy="70" rx="2" ry="3.5" fill="#1a202c" transform="rotate(5 58 70)"/>
          <ellipse cx="70" cy="62" rx="2" ry="3.5" fill="#1a202c" transform="rotate(15 70 62)"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#276749"/>
          <path d="M 24 76 L 76 76 A 52 52 0 0 0 24 24 Z" fill="#f0fff4"/>
          <path d="M 27 73 L 73 73 A 46 46 0 0 0 27 27 Z" fill="#e53e3e"/>
          <ellipse cx="42" cy="55" rx="2" ry="3.5" fill="#1a202c" transform="rotate(-25 42 55)"/>
          <ellipse cx="55" cy="65" rx="2" ry="3.5" fill="#1a202c" transform="rotate(10 55 65)"/>
        `);
      }

    case 'portakal':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="52" r="38" fill="#ed8936" stroke="#c05621" stroke-width="2"/>
          <path d="M 50 14 Q 52 8 58 4" stroke="#5a3825" stroke-width="3" fill="none"/>
          <path d="M 56 8 Q 70 6 66 16 Q 56 16 56 8 Z" fill="#38a169"/>
          <circle cx="35" cy="38" r="1.5" fill="#c05621"/>
          <circle cx="65" cy="42" r="1.5" fill="#c05621"/>
          <circle cx="48" cy="68" r="1.5" fill="#c05621"/>
          <ellipse cx="36" cy="36" rx="4" ry="9" fill="#ffffff" opacity="0.3" transform="rotate(-20 36 36)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#dd6b20" stroke="#c05621" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#fbd38d"/>
          <circle cx="50" cy="50" r="31" fill="#ed8936"/>
          <circle cx="50" cy="50" r="4" fill="#fbd38d"/>
          <line x1="50" y1="19" x2="50" y2="81" stroke="#fbd38d" stroke-width="2"/>
          <line x1="19" y1="50" x2="81" y2="50" stroke="#fbd38d" stroke-width="2"/>
          <line x1="28" y1="28" x2="72" y2="72" stroke="#fbd38d" stroke-width="2"/>
          <line x1="28" y1="72" x2="72" y2="28" stroke="#fbd38d" stroke-width="2"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#dd6b20"/>
          <path d="M 24 76 L 76 76 A 52 52 0 0 0 24 24 Z" fill="#fbd38d"/>
          <path d="M 27 73 L 73 73 A 46 46 0 0 0 27 27 Z" fill="#ed8936"/>
          <line x1="27" y1="73" x2="62" y2="38" stroke="#fbd38d" stroke-width="2"/>
        `);
      }

    case 'kivi':
      if (durum === 'bütün') {
        return wrap(`
          <ellipse cx="50" cy="50" rx="42" ry="32" fill="#744210" stroke="#4a2e19" stroke-width="2"/>
          <ellipse cx="50" cy="50" rx="40" ry="30" fill="#975a16" opacity="0.6"/>
          <circle cx="30" cy="40" r="1" fill="#4a2e19"/>
          <circle cx="65" cy="55" r="1" fill="#4a2e19"/>
          <circle cx="45" cy="62" r="1" fill="#4a2e19"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#744210" stroke="#4a2e19" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#48bb78"/>
          <ellipse cx="50" cy="50" rx="10" ry="14" fill="#fefcbf"/>
          <circle cx="50" cy="32" r="1.5" fill="#1a202c"/>
          <circle cx="63" cy="37" r="1.5" fill="#1a202c"/>
          <circle cx="68" cy="50" r="1.5" fill="#1a202c"/>
          <circle cx="63" cy="63" r="1.5" fill="#1a202c"/>
          <circle cx="50" cy="68" r="1.5" fill="#1a202c"/>
          <circle cx="37" cy="63" r="1.5" fill="#1a202c"/>
          <circle cx="32" cy="50" r="1.5" fill="#1a202c"/>
          <circle cx="37" cy="37" r="1.5" fill="#1a202c"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#744210"/>
          <path d="M 25 75 L 75 75 A 50 50 0 0 0 25 25 Z" fill="#48bb78"/>
          <path d="M 25 75 L 42 75 A 17 17 0 0 0 25 58 Z" fill="#fefcbf"/>
          <circle cx="38" cy="58" r="1.5" fill="#1a202c"/>
          <circle cx="48" cy="65" r="1.5" fill="#1a202c"/>
          <circle cx="32" cy="48" r="1.5" fill="#1a202c"/>
        `);
      }

    case 'armut':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 50 18 C 42 18, 38 32, 28 48 C 18 64, 22 86, 50 86 C 78 86, 82 64, 72 48 C 62 32, 58 18, 50 18 Z" fill="#ecc94b" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 50 18 Q 52 10 58 6" stroke="#5a3825" stroke-width="3" fill="none"/>
          <path d="M 56 10 Q 70 8 66 18 Q 56 18 56 10 Z" fill="#38a169"/>
          <ellipse cx="36" cy="58" rx="4" ry="10" fill="#ffffff" opacity="0.3" transform="rotate(-15 36 58)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 18 C 38 18, 22 50, 22 84 L 50 84 Z" fill="#ecc94b" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 50 20 L 50 82 C 26 82, 26 50, 48 20 Z" fill="#fefcbf" stroke="#d69e2e" stroke-width="1.5"/>
          <ellipse cx="38" cy="58" rx="2" ry="4" fill="#4a2e19" transform="rotate(-10 38 58)"/>
          <path d="M 50 20 Q 52 12 56 8" stroke="#5a3825" stroke-width="3" fill="none"/>
        `);
      } else {
        return wrap(`
          <path d="M 50 25 C 38 32, 28 55, 30 80 L 50 80 Z" fill="#ecc94b" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 50 27 L 50 78 L 34 78 C 32 58, 40 36, 50 27 Z" fill="#fefcbf" stroke="#d69e2e" stroke-width="1.5"/>
          <ellipse cx="42" cy="60" rx="2" ry="3.5" fill="#4a2e19" transform="rotate(-10 42 60)"/>
        `);
      }

    case 'cilek':
    case 'çilek':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 50 25 C 20 25 15 55 35 85 C 45 95 55 95 65 85 C 85 55 80 25 50 25 Z" fill="#e53e3e" stroke="#c53030" stroke-width="2"/>
          <path d="M 50 25 L 42 12 L 50 18 L 58 12 Z" fill="#38a169"/>
          <path d="M 38 25 L 28 15 L 36 22 Z" fill="#38a169"/>
          <path d="M 62 25 L 72 15 L 64 22 Z" fill="#38a169"/>
          <circle cx="35" cy="40" r="1.5" fill="#f6e05e"/>
          <circle cx="50" cy="45" r="1.5" fill="#f6e05e"/>
          <circle cx="65" cy="40" r="1.5" fill="#f6e05e"/>
          <circle cx="40" cy="60" r="1.5" fill="#f6e05e"/>
          <circle cx="60" cy="60" r="1.5" fill="#f6e05e"/>
          <circle cx="50" cy="75" r="1.5" fill="#f6e05e"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 25 C 20 25 15 55 35 85 C 45 95 50 95 50 95 L 50 25 Z" fill="#e53e3e" stroke="#c53030" stroke-width="2"/>
          <path d="M 50 27 L 50 90 C 42 90 22 60 22 30 C 22 27 35 27 50 27 Z" fill="#fff5f5"/>
          <path d="M 50 35 Q 35 50 50 75 Z" fill="#fed7d7"/>
          <circle cx="35" cy="42" r="1.5" fill="#f6e05e"/>
          <circle cx="38" cy="62" r="1.5" fill="#f6e05e"/>
          <path d="M 50 25 L 42 12 L 50 18 Z" fill="#38a169"/>
        `);
      } else {
        return wrap(`
          <path d="M 50 25 C 30 28 20 50 30 80 L 50 80 Z" fill="#e53e3e" stroke="#c53030" stroke-width="2"/>
          <path d="M 50 28 L 50 78 L 33 78 C 26 55 35 32 50 28 Z" fill="#fff5f5"/>
          <circle cx="38" cy="50" r="1.5" fill="#f6e05e"/>
        `);
      }

    case 'muz':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 20 30 Q 30 80 80 70 Q 50 90 15 40 Z" fill="#ecc94b" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 80 70 L 86 68" stroke="#744210" stroke-width="4" stroke-linecap="round"/>
          <path d="M 20 30 L 15 22" stroke="#744210" stroke-width="4" stroke-linecap="round"/>
          <path d="M 22 35 Q 32 75 75 68" stroke="#d69e2e" stroke-width="1.5" fill="none"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 20 30 Q 30 75 50 75 L 50 50 Q 25 45 20 30 Z" fill="#ecc94b" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 50 50 L 50 75 C 38 75 28 58 20 30 Z" fill="#fefcbf"/>
          <circle cx="42" cy="60" r="2" fill="#744210"/>
        `);
      } else {
        return wrap(`
          <path d="M 25 35 Q 30 65 50 65 L 50 50 Z" fill="#ecc94b" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 50 50 L 50 65 C 38 65 30 52 25 35 Z" fill="#fefcbf"/>
        `);
      }

    case 'limon':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 15 50 C 15 25 35 18 50 18 C 65 18 85 25 85 50 C 85 75 65 82 50 82 C 35 82 15 75 15 50 Z" fill="#f6e05e" stroke="#d69e2e" stroke-width="2"/>
          <path d="M 12 50 C 10 45 10 55 12 50 Z" stroke="#d69e2e" stroke-width="3"/>
          <path d="M 88 50 C 90 45 90 55 88 50 Z" stroke="#d69e2e" stroke-width="3"/>
          <ellipse cx="38" cy="38" rx="5" ry="10" fill="#ffffff" opacity="0.3" transform="rotate(-20 38 38)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#fefcbf"/>
          <circle cx="50" cy="50" r="31" fill="#f6e05e"/>
          <circle cx="50" cy="50" r="4" fill="#fefcbf"/>
          <line x1="50" y1="19" x2="50" y2="81" stroke="#fefcbf" stroke-width="2"/>
          <line x1="19" y1="50" x2="81" y2="50" stroke="#fefcbf" stroke-width="2"/>
          <line x1="28" y1="28" x2="72" y2="72" stroke="#fefcbf" stroke-width="2"/>
          <line x1="28" y1="72" x2="72" y2="28" stroke="#fefcbf" stroke-width="2"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#d69e2e"/>
          <path d="M 24 76 L 76 76 A 52 52 0 0 0 24 24 Z" fill="#fefcbf"/>
          <path d="M 27 73 L 73 73 A 46 46 0 0 0 27 27 Z" fill="#f6e05e"/>
          <line x1="27" y1="73" x2="62" y2="38" stroke="#fefcbf" stroke-width="2"/>
        `);
      }

    case 'uzum':
    case 'üzüm':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 50 20 Q 52 10 58 5" stroke="#5a3825" stroke-width="3" fill="none"/>
          <path d="M 55 8 Q 70 5 65 18 Z" fill="#38a169"/>
          <circle cx="38" cy="35" r="11" fill="#805ad5"/>
          <circle cx="62" cy="35" r="11" fill="#805ad5"/>
          <circle cx="50" cy="32" r="12" fill="#6b46c1"/>
          <circle cx="40" cy="52" r="11" fill="#6b46c1"/>
          <circle cx="60" cy="52" r="11" fill="#6b46c1"/>
          <circle cx="50" cy="55" r="11" fill="#553c9a"/>
          <circle cx="45" cy="70" r="10" fill="#553c9a"/>
          <circle cx="55" cy="70" r="10" fill="#553c9a"/>
          <circle cx="50" cy="83" r="8" fill="#44337a"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 20 Q 52 10 58 5" stroke="#5a3825" stroke-width="3" fill="none"/>
          <circle cx="38" cy="35" r="11" fill="#805ad5"/>
          <circle cx="50" cy="32" r="12" fill="#6b46c1"/>
          <circle cx="40" cy="52" r="11" fill="#6b46c1"/>
          <circle cx="50" cy="55" r="11" fill="#553c9a"/>
          <circle cx="45" cy="70" r="10" fill="#553c9a"/>
          <line x1="50" y1="15" x2="50" y2="85" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 3"/>
        `);
      } else {
        return wrap(`
          <circle cx="40" cy="52" r="11" fill="#6b46c1"/>
          <circle cx="50" cy="55" r="11" fill="#553c9a"/>
          <circle cx="45" cy="70" r="10" fill="#553c9a"/>
        `);
      }

    case 'seftali':
    case 'şeftali':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="52" r="38" fill="#ed8936" stroke="#dd6b20" stroke-width="2"/>
          <path d="M 50 14 C 38 25 38 75 50 88" stroke="#c05621" stroke-width="2.5" fill="none"/>
          <path d="M 50 14 Q 52 8 58 4" stroke="#5a3825" stroke-width="3" fill="none"/>
          <path d="M 56 8 Q 70 6 66 16 Q 56 16 56 8 Z" fill="#38a169"/>
          <ellipse cx="34" cy="38" rx="5" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-20 34 38)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#dd6b20" stroke="#c05621" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#feebc8"/>
          <circle cx="50" cy="50" r="28" fill="#fbd38d"/>
          <ellipse cx="50" cy="50" rx="10" ry="14" fill="#744210"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#dd6b20"/>
          <path d="M 25 75 L 75 75 A 50 50 0 0 0 25 25 Z" fill="#fbd38d"/>
          <ellipse cx="40" cy="60" rx="7" ry="10" fill="#744210" transform="rotate(-20 40 60)"/>
        `);
      }

    case 'ananas':
      if (durum === 'bütün') {
        return wrap(`
          <ellipse cx="50" cy="60" rx="32" ry="32" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <!-- Spiky crown -->
          <path d="M 50 30 L 40 5 L 48 20 L 50 0 L 52 20 L 60 5 L 50 30 Z" fill="#2f855a"/>
          <path d="M 42 30 L 30 12 L 40 22 Z" fill="#38a169"/>
          <path d="M 58 30 L 70 12 L 60 22 Z" fill="#38a169"/>
          <!-- Pattern -->
          <path d="M 25 50 L 75 70 M 20 62 L 72 80 M 28 40 L 78 60" stroke="#b7791f" stroke-width="2"/>
          <path d="M 75 50 L 25 70 M 80 62 L 28 80 M 72 40 L 22 60" stroke="#b7791f" stroke-width="2"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 30 C 25 30 20 50 20 85 L 50 85 Z" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <path d="M 50 32 L 50 83 C 25 83 25 50 48 32 Z" fill="#fefcbf"/>
          <line x1="50" y1="32" x2="50" y2="83" stroke="#d69e2e" stroke-width="3"/>
          <path d="M 50 30 L 40 5 L 48 20 L 50 0 Z" fill="#2f855a"/>
        `);
      } else {
        return wrap(`
          <path d="M 50 35 C 32 40 25 60 28 80 L 50 80 Z" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <path d="M 50 38 L 50 78 L 33 78 C 30 60 38 42 50 38 Z" fill="#fefcbf"/>
        `);
      }

    case 'kiraz':
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 50 10 Q 30 25 32 50" stroke="#2f855a" stroke-width="3" fill="none"/>
          <path d="M 50 10 Q 70 25 68 50" stroke="#2f855a" stroke-width="3" fill="none"/>
          <circle cx="50" cy="10" r="3" fill="#2f855a"/>
          <circle cx="30" cy="62" r="18" fill="#9b2c2c" stroke="#742a2a" stroke-width="2"/>
          <circle cx="70" cy="62" r="18" fill="#9b2c2c" stroke="#742a2a" stroke-width="2"/>
          <ellipse cx="24" cy="55" rx="3" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-20 24 55)"/>
          <ellipse cx="64" cy="55" rx="3" ry="6" fill="#ffffff" opacity="0.35" transform="rotate(-20 64 55)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 10 Q 30 25 32 50" stroke="#2f855a" stroke-width="3" fill="none"/>
          <circle cx="30" cy="62" r="18" fill="#9b2c2c" stroke="#742a2a" stroke-width="2"/>
          <circle cx="30" cy="62" r="14" fill="#e53e3e"/>
          <circle cx="30" cy="62" r="5" fill="#744210"/>
        `);
      } else {
        return wrap(`
          <path d="M 30 80 L 70 80 A 40 40 0 0 0 30 40 Z" fill="#9b2c2c"/>
          <path d="M 33 77 L 67 77 A 34 34 0 0 0 33 43 Z" fill="#e53e3e"/>
          <circle cx="45" cy="68" r="4" fill="#744210"/>
        `);
      }

    case 'kavun':
      if (durum === 'bütün') {
        return wrap(`
          <ellipse cx="50" cy="52" rx="42" ry="34" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <ellipse cx="50" cy="52" rx="39" ry="31" fill="#ecc94b" opacity="0.7"/>
          <path d="M 20 35 Q 50 40 80 35 M 15 52 Q 50 58 85 52 M 20 70 Q 50 75 80 70" stroke="#fefcbf" stroke-width="1.5" stroke-dasharray="4 2" fill="none"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 10 50 A 40 40 0 0 0 90 50 Z" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <path d="M 15 50 A 35 35 0 0 0 85 50 Z" fill="#fefcbf"/>
          <path d="M 20 50 A 30 30 0 0 0 80 50 Z" fill="#feebc8"/>
          <ellipse cx="50" cy="60" rx="15" ry="6" fill="#d69e2e"/>
          <circle cx="42" cy="60" r="1.5" fill="#744210"/>
          <circle cx="50" cy="61" r="1.5" fill="#744210"/>
          <circle cx="58" cy="60" r="1.5" fill="#744210"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#d69e2e"/>
          <path d="M 24 76 L 76 76 A 52 52 0 0 0 24 24 Z" fill="#feebc8"/>
          <circle cx="40" cy="60" r="1.5" fill="#744210"/>
          <circle cx="48" cy="65" r="1.5" fill="#744210"/>
        `);
      }

    case 'mandalina':
      if (durum === 'bütün') {
        return wrap(`
          <ellipse cx="50" cy="54" rx="40" ry="32" fill="#ed8936" stroke="#dd6b20" stroke-width="2"/>
          <path d="M 50 22 Q 52 14 58 8" stroke="#5a3825" stroke-width="3" fill="none"/>
          <path d="M 56 12 Q 70 10 66 20 Q 56 20 56 12 Z" fill="#38a169"/>
          <circle cx="35" cy="42" r="1" fill="#c05621"/>
          <circle cx="65" cy="46" r="1" fill="#c05621"/>
          <circle cx="48" cy="68" r="1" fill="#c05621"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#dd6b20" stroke="#c05621" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#feebc8"/>
          <circle cx="50" cy="50" r="31" fill="#ed8936"/>
          <circle cx="50" cy="50" r="4" fill="#feebc8"/>
          <line x1="50" y1="19" x2="50" y2="81" stroke="#feebc8" stroke-width="2"/>
          <line x1="19" y1="50" x2="81" y2="50" stroke="#feebc8" stroke-width="2"/>
          <line x1="28" y1="28" x2="72" y2="72" stroke="#feebc8" stroke-width="2"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#dd6b20"/>
          <path d="M 24 76 L 76 76 A 52 52 0 0 0 24 24 Z" fill="#feebc8"/>
          <path d="M 27 73 L 73 73 A 46 46 0 0 0 27 27 Z" fill="#ed8936"/>
        `);
      }

    case 'erik':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="52" r="38" fill="#553c9a" stroke="#322659" stroke-width="2"/>
          <path d="M 50 14 C 40 25 40 75 50 88" stroke="#322659" stroke-width="2" fill="none"/>
          <ellipse cx="34" cy="38" rx="5" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-20 34 38)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#553c9a" stroke="#322659" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#feebc8"/>
          <circle cx="50" cy="50" r="28" fill="#d69e2e"/>
          <ellipse cx="50" cy="50" rx="9" ry="12" fill="#744210"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#553c9a"/>
          <path d="M 25 75 L 75 75 A 50 50 0 0 0 25 25 Z" fill="#d69e2e"/>
        `);
      }

    case 'pizza':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="50" r="42" fill="#d69e2e" stroke="#b7791f" stroke-width="3"/>
          <circle cx="50" cy="50" r="36" fill="#ecc94b"/>
          <circle cx="35" cy="35" r="7" fill="#c53030"/>
          <circle cx="65" cy="35" r="7" fill="#c53030"/>
          <circle cx="50" cy="55" r="7" fill="#c53030"/>
          <circle cx="32" cy="62" r="6" fill="#c53030"/>
          <circle cx="68" cy="62" r="6" fill="#c53030"/>
          <circle cx="48" cy="38" r="2" fill="#2f855a"/>
          <circle cx="58" cy="48" r="2" fill="#2f855a"/>
          <circle cx="40" cy="50" r="2" fill="#2f855a"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 10 50 A 40 40 0 0 0 90 50 Z" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <path d="M 14 50 A 36 36 0 0 0 86 50 Z" fill="#ecc94b"/>
          <circle cx="35" cy="65" r="6.5" fill="#c53030"/>
          <circle cx="65" cy="65" r="6.5" fill="#c53030"/>
          <circle cx="50" cy="72" r="6.5" fill="#c53030"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#d69e2e"/>
          <path d="M 24 76 L 76 76 A 52 52 0 0 0 24 24 Z" fill="#ecc94b"/>
          <circle cx="42" cy="58" r="6" fill="#c53030"/>
          <circle cx="58" cy="68" r="6" fill="#c53030"/>
        `);
      }

    case 'kurabiye':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#dd6b20" stroke="#c05621" stroke-width="2"/>
          <circle cx="32" cy="38" r="4.5" fill="#2d3748"/>
          <circle cx="55" cy="32" r="4" fill="#2d3748"/>
          <circle cx="65" cy="52" r="4.5" fill="#2d3748"/>
          <circle cx="42" cy="58" r="5" fill="#2d3748"/>
          <circle cx="55" cy="68" r="4" fill="#2d3748"/>
          <circle cx="30" cy="62" r="3.5" fill="#2d3748"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 10 50 A 40 40 0 0 0 90 50 Z" fill="#dd6b20" stroke="#c05621" stroke-width="2"/>
          <circle cx="32" cy="62" r="4.5" fill="#2d3748"/>
          <circle cx="50" cy="70" r="5" fill="#2d3748"/>
          <circle cx="68" cy="62" r="4.5" fill="#2d3748"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#dd6b20"/>
          <circle cx="42" cy="60" r="4.5" fill="#2d3748"/>
          <circle cx="58" cy="68" r="4" fill="#2d3748"/>
        `);
      }

    case 'donut':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="50" r="40" fill="#dd6b20" stroke="#c05621" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="#ed64a6"/>
          <circle cx="50" cy="50" r="14" fill="#1a202c"/>
          <rect x="30" y="30" width="6" height="2" fill="#ffffff" rx="1" transform="rotate(20 30 30)"/>
          <rect x="62" y="32" width="6" height="2" fill="#f6ad55" rx="1" transform="rotate(-30 62 32)"/>
          <rect x="32" y="65" width="6" height="2" fill="#63b3ed" rx="1" transform="rotate(45 32 65)"/>
          <rect x="65" y="62" width="6" height="2" fill="#68d391" rx="1" transform="rotate(-15 65 62)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 10 50 A 40 40 0 0 0 90 50 L 64 50 A 14 14 0 0 1 36 50 Z" fill="#ed64a6" stroke="#c05621" stroke-width="2"/>
          <rect x="28" y="62" width="6" height="2" fill="#ffffff" rx="1" transform="rotate(20 28 62)"/>
          <rect x="50" y="72" width="6" height="2" fill="#f6ad55" rx="1" transform="rotate(-30 50 72)"/>
          <rect x="70" y="62" width="6" height="2" fill="#68d391" rx="1" transform="rotate(-15 70 62)"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 L 20 50 A 30 30 0 0 1 50 80 Z" fill="#ed64a6"/>
          <rect x="42" y="62" width="6" height="2" fill="#ffffff" rx="1" transform="rotate(20 42 62)"/>
          <rect x="62" y="70" width="6" height="2" fill="#68d391" rx="1" transform="rotate(-15 62 70)"/>
        `);
      }

    case 'waffle':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="50" r="40" fill="#d69e2e" stroke="#b7791f" stroke-width="3"/>
          <path d="M 25 25 H 75 M 25 38 H 75 M 25 50 H 75 M 25 62 H 75 M 25 75 H 75" stroke="#b7791f" stroke-width="2"/>
          <path d="M 25 25 V 75 M 38 25 V 75 M 50 25 V 75 M 62 25 V 75 M 75 25 V 75" stroke="#b7791f" stroke-width="2"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 10 50 A 40 40 0 0 0 90 50 Z" fill="#d69e2e" stroke="#b7791f" stroke-width="2"/>
          <path d="M 20 62 H 80 M 25 75 H 75" stroke="#b7791f" stroke-width="2"/>
          <path d="M 32 50 V 78 M 50 50 V 90 M 68 50 V 78" stroke="#b7791f" stroke-width="2"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#d69e2e"/>
          <path d="M 20 62 H 72 M 20 42 H 58" stroke="#b7791f" stroke-width="2"/>
          <path d="M 38 80 V 28 M 58 80 V 42" stroke="#b7791f" stroke-width="2"/>
        `);
      }

    case 'domates':
      if (durum === 'bütün') {
        return wrap(`
          <circle cx="50" cy="52" r="38" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 14 L 46 22 L 36 16 L 42 24 L 32 28 L 44 28 L 50 14 Z" fill="#38a169"/>
          <path d="M 50 14 L 54 22 L 64 16 L 58 24 L 68 28 L 56 28 L 50 14 Z" fill="#38a169"/>
          <ellipse cx="34" cy="38" rx="4" ry="10" fill="#ffffff" opacity="0.35" transform="rotate(-20 34 38)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <circle cx="50" cy="50" r="38" fill="#c53030" stroke="#9b1c1c" stroke-width="2"/>
          <circle cx="50" cy="50" r="33" fill="#e53e3e"/>
          <circle cx="36" cy="42" r="8" fill="#9b1c1c"/>
          <circle cx="64" cy="42" r="8" fill="#9b1c1c"/>
          <circle cx="50" cy="65" r="9" fill="#9b1c1c"/>
          <circle cx="36" cy="42" r="1.5" fill="#ecc94b"/>
          <circle cx="64" cy="42" r="1.5" fill="#ecc94b"/>
          <circle cx="50" cy="65" r="1.5" fill="#ecc94b"/>
        `);
      } else {
        return wrap(`
          <path d="M 20 80 L 80 80 A 60 60 0 0 0 20 20 Z" fill="#c53030"/>
          <path d="M 25 75 L 75 75 A 50 50 0 0 0 25 25 Z" fill="#e53e3e"/>
          <circle cx="45" cy="58" r="7" fill="#9b1c1c"/>
          <circle cx="45" cy="58" r="1.5" fill="#ecc94b"/>
        `);
      }

    case 'biber':
    default:
      if (durum === 'bütün') {
        return wrap(`
          <path d="M 30 25 C 20 30, 20 75, 32 85 C 40 90, 48 82, 50 82 C 52 82, 60 90, 68 85 C 80 75, 80 30, 70 25 C 60 20, 40 20, 30 25 Z" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 22 L 50 10 C 50 8, 58 6, 56 12 Z" stroke="#2f855a" stroke-width="4" fill="none"/>
          <ellipse cx="36" cy="42" rx="4" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-15 36 42)"/>
        `);
      } else if (durum === 'yarım') {
        return wrap(`
          <path d="M 50 20 C 25 20, 20 50, 22 84 L 50 84 Z" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 23 L 50 82 C 28 82, 28 50, 46 23 Z" fill="#feb2b2"/>
          <circle cx="42" cy="45" r="4" fill="#ffffff"/>
          <circle cx="42" cy="45" r="1.5" fill="#d69e2e"/>
        `);
      } else {
        return wrap(`
          <path d="M 50 25 C 38 32, 28 55, 30 80 L 50 80 Z" fill="#e53e3e" stroke="#9b1c1c" stroke-width="2"/>
          <path d="M 50 28 L 50 78 L 34 78 C 32 58, 40 36, 50 28 Z" fill="#feb2b2"/>
        `);
      }
  }
}

function rastgeleSec<T>(dizi: T[], adet: number): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya.slice(0, adet);
}

const RITMIK_KARE_RENKLERI = [
  { emoji: '🟥', ad: 'kırmızı kare', bgClass: 'from-rose-500 via-red-500 to-rose-600 border-rose-200' },
  { emoji: '🟦', ad: 'mavi kare', bgClass: 'from-blue-500 via-indigo-500 to-sky-600 border-blue-200' },
  { emoji: '🟩', ad: 'yeşil kare', bgClass: 'from-emerald-500 via-green-500 to-teal-600 border-emerald-200' },
  { emoji: '🟧', ad: 'turuncu kare', bgClass: 'from-amber-500 via-orange-500 to-amber-600 border-amber-200' },
  { emoji: '🟪', ad: 'mor kare', bgClass: 'from-purple-500 via-fuchsia-500 to-violet-600 border-purple-200' },
];

function ritmikIleriUret(adim: number, ustSinir: number): QuestionData {
  const maxBaslangicKati = Math.max(Math.floor((ustSinir - adim * 4) / adim), 1);
  const kat = Math.floor(Math.random() * maxBaslangicKati) + 1;
  const baslangic = kat * adim;
  const dizi = [baslangic, baslangic + adim, baslangic + adim * 2, baslangic + adim * 3, baslangic + adim * 4];
  const boslukIndex = Math.floor(Math.random() * 3) + 1;
  const dogruCevap = dizi[boslukIndex];
  
  const secilenKare = RITMIK_KARE_RENKLERI[Math.floor(Math.random() * RITMIK_KARE_RENKLERI.length)];
  const gosterilecek = [...dizi];
  (gosterilecek as (number | string)[])[boslukIndex] = secilenKare.emoji;

  const sequenceHTML = dizi.map((val, idx) => {
    if (idx === boslukIndex) {
      return `<div class="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-gradient-to-tr ${secilenKare.bgClass} border text-white font-black flex items-center justify-center shadow-md animate-pulse text-xs xs:text-sm sm:text-lg ring-2 ring-white/30 shrink-0">${secilenKare.emoji}</div>`;
    }
    return `<div class="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-600/90 via-indigo-700/90 to-slate-800/90 border border-blue-300/80 text-white font-black text-[11px] xs:text-xs sm:text-sm md:text-base shadow-sm shrink-0 min-w-[22px] xs:min-w-[26px] sm:min-w-[32px] text-center">${val}</div>`;
  }).join('<span class="text-amber-300 font-extrabold text-[9px] xs:text-[11px] sm:text-xs md:text-sm mx-0.5 shrink-0">-</span>');

  const soruHTML = `<div class="flex flex-col items-center justify-center w-full h-full my-auto gap-1.5 sm:gap-2.5 py-0.5">
    <div class="text-sm xs:text-base sm:text-lg md:text-xl font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-1.5 leading-snug sm:leading-normal">
      Aşağıdaki ritmik sayma zincirinde <span class="text-amber-300 underline decoration-amber-400 font-extrabold">${secilenKare.ad}</span> yerine hangi sayı gelmelidir?
    </div>
    <div class="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 flex-nowrap max-w-full px-0.5">
      ${sequenceHTML}
    </div>
  </div>`;

  return {
    question: `Aşağıdaki ritmik sayma zincirinde ${secilenKare.ad} (${secilenKare.emoji}) yerine hangi sayı gelmelidir?\n\n ${gosterilecek.join(" - ")}`,
    questionHTML: soruHTML,
    correct: dogruCevap,
    wrong: benzersizYanlislar(dogruCevap, [dogruCevap + adim, dogruCevap - adim, dogruCevap + 1, dogruCevap - 1, dogruCevap + adim * 2], 1),
    isLong: true
  };
}

function ritmikGeriUret(adim: number): QuestionData {
  const minBaslangic = adim * 4 + adim;
  const baslangicKati = Math.floor(Math.random() * Math.floor((100 - minBaslangic) / adim + 1)) + Math.ceil(minBaslangic / adim);
  const baslangic = Math.min(baslangicKati * adim, 100);
  const dizi = [baslangic, baslangic - adim, baslangic - adim * 2, baslangic - adim * 3, baslangic - adim * 4];
  const boslukIndex = Math.floor(Math.random() * 3) + 1;
  const dogruCevap = dizi[boslukIndex];

  const secilenKare = RITMIK_KARE_RENKLERI[Math.floor(Math.random() * RITMIK_KARE_RENKLERI.length)];
  const gosterilecek = [...dizi];
  (gosterilecek as (number | string)[])[boslukIndex] = secilenKare.emoji;

  const sequenceHTML = dizi.map((val, idx) => {
    if (idx === boslukIndex) {
      return `<div class="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-gradient-to-tr ${secilenKare.bgClass} border text-white font-black flex items-center justify-center shadow-md animate-pulse text-xs xs:text-sm sm:text-lg ring-2 ring-white/30 shrink-0">${secilenKare.emoji}</div>`;
    }
    return `<div class="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-600/90 via-indigo-700/90 to-slate-800/90 border border-blue-300/80 text-white font-black text-[11px] xs:text-xs sm:text-sm md:text-base shadow-sm shrink-0 min-w-[22px] xs:min-w-[26px] sm:min-w-[32px] text-center">${val}</div>`;
  }).join('<span class="text-amber-300 font-extrabold text-[9px] xs:text-[11px] sm:text-xs md:text-sm mx-0.5 shrink-0">-</span>');

  const soruHTML = `<div class="flex flex-col items-center justify-center w-full h-full my-auto gap-1.5 sm:gap-2.5 py-0.5">
    <div class="text-sm xs:text-base sm:text-lg md:text-xl font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-1.5 leading-snug sm:leading-normal">
      Aşağıdaki geriye ritmik sayma zincirinde <span class="text-amber-300 underline decoration-amber-400 font-extrabold">${secilenKare.ad}</span> yerine hangi sayı gelmelidir?
    </div>
    <div class="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 flex-nowrap max-w-full px-0.5">
      ${sequenceHTML}
    </div>
  </div>`;

  return {
    question: `Aşağıdaki geriye ritmik sayma zincirinde ${secilenKare.ad} (${secilenKare.emoji}) yerine hangi sayı gelmelidir?\n\n ${gosterilecek.join(" - ")}`,
    questionHTML: soruHTML,
    correct: dogruCevap,
    wrong: benzersizYanlislar(dogruCevap, [dogruCevap + adim, dogruCevap - adim, dogruCevap - 1, dogruCevap + 1, dogruCevap - adim * 2], 0),
    isLong: true
  };
}

function toplamaUret(minToplam: number, maxToplam: number, eldeli: boolean) {
  let s1 = 0, s2 = 0, correct = 0, deneme = 0;
  do {
    s1 = Math.floor(Math.random() * 80) + 10;
    s2 = Math.floor(Math.random() * 80) + 10;
    correct = s1 + s2;
    deneme++;
  } while (deneme < 1500 && (
    correct < minToplam || correct > maxToplam ||
    (eldeli ? ((s1 % 10 + s2 % 10) < 10) : ((s1 % 10 + s2 % 10) >= 10))
  ));
  return { s1, s2, correct };
}

function cikarmaUret(minEksilen: number, maxEksilen: number, onlukBoz: boolean) {
  let s1 = 0, s2 = 0, correct = 0, deneme = 0;
  do {
    s1 = Math.floor(Math.random() * (maxEksilen - minEksilen + 1)) + minEksilen;
    s2 = Math.floor(Math.random() * 40) + 10;
    correct = s1 - s2;
    deneme++;
  } while (deneme < 1500 && (
    correct <= 0 ||
    (onlukBoz ? ((s1 % 10) >= (s2 % 10)) : ((s1 % 10) < (s2 % 10)))
  ));
  return { s1, s2, correct };
}

const CATEGORY_MAP = [
  {
    id: 'geometri',
    name: "1. Nesnelerin Geometrisi",
    shortName: "Geometri",
    icon: "/iconn/s21.png",
    keys: ["geometrik_sekil_cisim", "yuz_ayrit_kose", "uzamsal_iliskiler_simetri", "sivi_olcme", "tartma_olcme"]
  },
  {
    id: 'sayilar',
    name: "2. Sayılar ve Nicelikler",
    shortName: "Sayılar",
    icon: "/iconn/s19.png",
    keys: [
      "nesne_sayisi", "sayi_basamak_degeri", "deste_duzine", "kesirler",
      "ritmik_ileri_2", "ritmik_ileri_3", "ritmik_ileri_4", "ritmik_ileri_5", "ritmik_ileri_10", "ritmik_geri_2", "ritmik_geri_10",
      "sayi_karsilastirma", "paralarimiz", "zaman_olcme",
      "saat_tam", "saat_yarim", "saat_ceyrek_gece", "saat_ceyrek_kala", "uzunluk_olcme"
    ]
  },
  {
    id: 'islemler',
    name: "3. İşlemlerden Cebirsel Düşünmeye",
    shortName: "İşlemler ve Cebir",
    icon: "/iconn/s6.png",
    keys: [
      "tek_islem_toplama_problemleri", "iki_islem_toplama_problemleri",
      "toplama_eldesiz_50", "toplama_eldeli_50", "verilmeyen_toplanani_bul",
      "tek_islem_cikarma_problemleri", "iki_islem_cikarma_problemleri", "toplama_cikarma_problemleri",
      "cikarma_onluksuz_50", "cikarma_onluklu_50",
      "zihinden_toplama", "zihinden_cikarma",
      "ardisik_toplama", "ritmik_carpim", "esit_paylastirma", "ardisik_cikarma", "kalansiz_bolme"
    ]
  },
  {
    id: 'olcme',
    name: "4. Veri İşleme",
    shortName: "Veri İşleme",
    icon: "/iconn/s15.png",
    keys: ["veri_grafik"]
  }
];

const getTopicIconVisual = (key: string) => {
  if (key.includes('geometrik_sekil_cisim') || key.includes('yuz_ayrit')) {
    return { emoji: '📐', bg: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500' };
  }
  if (key.includes('oruntu')) {
    return { emoji: '🔷', bg: 'bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-500' };
  }
  if (key.includes('simetri')) {
    return { emoji: '🪞', bg: 'bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-500' };
  }
  if (key.includes('sivi')) {
    return { emoji: '🧪', bg: 'bg-gradient-to-br from-teal-300 via-emerald-400 to-cyan-500' };
  }
  if (key.includes('tartma')) {
    return { emoji: '⚖️', bg: 'bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-500' };
  }
  if (key.includes('ritmik')) {
    return { emoji: '🔢', bg: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-green-500' };
  }
  if (key.includes('saat') || key.includes('zaman')) {
    return { emoji: '⏰', bg: 'bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500' };
  }
  if (key.includes('para')) {
    return { emoji: '🪙', bg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500' };
  }
  if (key.includes('kesir')) {
    return { emoji: '🍕', bg: 'bg-gradient-to-br from-rose-400 via-red-400 to-amber-400' };
  }
  if (key.includes('toplama')) {
    return { emoji: '➕', bg: 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500' };
  }
  if (key.includes('cikarma')) {
    return { emoji: '➖', bg: 'bg-gradient-to-br from-rose-400 via-pink-400 to-red-500' };
  }
  if (key.includes('carp') || key.includes('bol') || key.includes('paylas')) {
    return { emoji: '✖️', bg: 'bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600' };
  }
  if (key.includes('veri') || key.includes('grafik')) {
    return { emoji: '📊', bg: 'bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400' };
  }
  if (key.includes('uzunluk')) {
    return { emoji: '📏', bg: 'bg-gradient-to-br from-yellow-300 via-lime-400 to-emerald-400' };
  }
  if (key.includes('basamak') || key.includes('deste') || key.includes('nesne')) {
    return { emoji: '🔢', bg: 'bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500' };
  }
  return { emoji: '⭐', bg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400' };
};

const getTopicEmoji = (key: string) => getTopicIconVisual(key).emoji;

const getCategoryIdForTopic = (topicKey: string): string => {
  for (const cat of CATEGORY_MAP) {
    if (cat.keys.includes(topicKey)) {
      return cat.id;
    }
  }
  return 'geometri';
};

const TOPIC_3D_ICONS: Record<string, string> = {
  // 1. Geometri ve Ölçme
  geometrik_sekil_cisim: '/iconn/s10.png',
  yuz_ayrit_kose: '/iconn/s1.png',
  geometrik_oruntu: '/iconn/s2.png',
  uzamsal_iliskiler_simetri: '/iconn/s3.png',
  sivi_olcme: '/iconn/s4.png',
  tartma_olcme: '/iconn/s5.png',

  // 2. Sayılar ve Nicelikler
  nesne_sayisi: '/iconn/s6.png',
  sayi_basamak_degeri: '/iconn/s7.png',
  deste_duzine: '/iconn/s8.png',
  kesirler: '/iconn/s9.png',
  sayi_karsilastirma: '/iconn/s11.png',
  paralarimiz: '/iconn/s12.png',
  zaman_olcme: '/iconn/s13.png',
  uzunluk_olcme: '/iconn/s14.png',
  sira_sayilari: '/iconn/s15.png',
  takvim_olcme: '/iconn/s16.png',

  // Ritmik Saymalar
  ritmik_ileri_2: '/iconn/s17.png',
  ritmik_ileri_3: '/iconn/s18.png',
  ritmik_ileri_4: '/iconn/s19.png',
  ritmik_ileri_5: '/iconn/s20.png',
  ritmik_ileri_10: '/iconn/s21.png',
  ritmik_geri_2: '/iconn/s22.png',
  ritmik_geri_10: '/iconn/s23.png',

  // Saati Okuma
  saat_tam: '/iconn/s24.png',
  saat_yarim: '/iconn/s25.png',
  saat_ceyrek_gece: '/iconn/s26.png',
  saat_ceyrek_kala: '/iconn/s27.png',

  // 3. İşlemler ve Cebir - Toplama
  toplama_eldesiz_50: '/iconn/s28.png',
  toplama_eldeli_50: '/iconn/s29.png',
  verilmeyen_toplanani_bul: '/iconn/s28.png',
  zihinden_toplama: '/iconn/s30.png',
  tek_islem_toplama_problemleri: '/iconn/s31.png',
  iki_islem_toplama_problemleri: '/iconn/s32.png',

  // Çıkarma
  cikarma_onluksuz_50: '/iconn/s33.png',
  cikarma_onluklu_50: '/iconn/s34.png',
  zihinden_cikarma: '/iconn/s35.png',
  tek_islem_cikarma_problemleri: '/iconn/s36.png',
  iki_islem_cikarma_problemleri: '/iconn/s37.png',

  // Karma / Çarpma / Bölme
  toplama_cikarma_problemleri: '/iconn/s38.png',
  ardisik_toplama: '/iconn/s39.png',
  ritmik_carpim: '/iconn/s6.png',
  esit_paylastirma: '/iconn/s8.png',
  ardisik_cikarma: '/iconn/s12.png',
  kalansiz_bolme: '/iconn/s14.png',

  // 4. Veri İşleme
  veri_grafik: '/iconn/s21.png',
};

// DENEME 4: Reference 3D Cartoon Game UI Style (Pill Buttons)
const getTopicBadgeGradient = (topicKey: string) => {
  if (topicKey.includes('geometrik') || topicKey.includes('yuz') || topicKey.includes('oruntu')) {
    return 'from-teal-400 via-emerald-400 to-cyan-500';
  }
  if (topicKey.includes('ritmik') || topicKey.includes('nesne') || topicKey.includes('basamak')) {
    return 'from-amber-400 via-orange-400 to-rose-500';
  }
  if (topicKey.includes('toplama')) {
    return 'from-blue-500 via-indigo-500 to-purple-600';
  }
  if (topicKey.includes('cikarma')) {
    return 'from-pink-500 via-rose-500 to-red-500';
  }
  if (topicKey.includes('saat') || topicKey.includes('zaman')) {
    return 'from-yellow-400 via-amber-400 to-amber-600';
  }
  if (topicKey.includes('kesir') || topicKey.includes('para') || topicKey.includes('deste')) {
    return 'from-emerald-400 via-teal-500 to-cyan-600';
  }
  if (topicKey.includes('veri') || topicKey.includes('grafik') || topicKey.includes('tartma')) {
    return 'from-violet-500 via-purple-600 to-indigo-700';
  }
  return 'from-sky-400 via-blue-500 to-indigo-600';
};

const TopicButtonReferenceStyle: React.FC<{
  topicKey: string;
  title: string;
  onClick: () => void;
  compact?: boolean;
}> = ({ topicKey, title, onClick, compact }) => {
  const iconUrl = TOPIC_3D_ICONS[topicKey] || '/iconn/s1.png';
  const badgeGradient = getTopicBadgeGradient(topicKey);

  return (
    <button
      onClick={onClick}
      className="group relative w-full bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 dark:from-sky-700 dark:via-blue-800 dark:to-indigo-900 border-3 border-white dark:border-amber-300 ring-2 ring-amber-300/60 rounded-full p-2 pr-3.5 sm:pr-5 flex items-center gap-2.5 sm:gap-3.5 shadow-[0_5px_0_#1e3a8a,0_8px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_7px_0_#1e3a8a,0_12px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[0_2px_0_#1e3a8a] transition-all cursor-pointer overflow-hidden"
    >
      {/* Top Gloss/Shine Highlight Overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-full" />

      {/* Left Circular 3D Icon Badge */}
      <div className="relative shrink-0 z-10">
        <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br ${badgeGradient} text-white ring-3 ring-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center p-1 sm:p-1.5 transition-transform group-hover:scale-110 group-hover:rotate-6 overflow-hidden`}>
          <img src={iconUrl} alt={title} className="w-full h-full object-cover scale-[1.35] filter drop-shadow-md" />
        </div>
      </div>

      {/* Center Text Body */}
      <div className="flex-1 text-left min-w-0 py-0.5 z-10">
        <h4 className="font-black text-xs sm:text-sm md:text-base uppercase tracking-wider text-white group-hover:text-yellow-300 transition-colors leading-tight line-clamp-1 drop-shadow-md">
          {title}
        </h4>
        <p className="text-[10px] sm:text-xs text-yellow-300 font-extrabold truncate mt-0.5 uppercase tracking-wide drop-shadow-xs">
          Alıştırma Etkinliği
        </p>
      </div>

      {/* Right 3D Green PLAY Action Image */}
      <div className="z-10 shrink-0 relative w-[42px] h-[33px] sm:w-[48px] sm:h-[37px] group-hover:scale-110 transition-transform filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('/playl.png')` }}
        />
      </div>
    </button>
  );
};

// Helper function for Infinite Level & Trophy Target calculations
const getPlayerLevelInfo = (statsData: Record<string, StatRecord>, badgeCounts: Record<string, number>, unlockedBadges: string[]) => {
  const totalCorrect = Object.values(statsData).reduce((sum, item) => sum + (item.dogru || 0), 0);
  const totalSolved = Object.values(statsData).reduce((sum, item) => sum + ((item.dogru || 0) + (item.yanlis || 0)), 0);

  let totalBadgesEarned = unlockedBadges.length;
  Object.values(badgeCounts).forEach(c => {
    if (c > 1) totalBadgesEarned += (c - 1);
  });

  const LEVEL_THRESHOLDS = [
    { level: 1, title: 'Matematik Çırağı', icon: '/rozets/d5.png', target: 20 },
    { level: 2, title: 'Sayı Ustası', icon: '/rozets/d9.png', target: 50 },
    { level: 3, title: 'Geometri Mimarı', icon: '/rozets/d10.png', target: 100 },
    { level: 4, title: 'Matematik Dâhisi', icon: '/rozets/d11.png', target: 180 },
    { level: 5, title: 'Şampiyon Kaptan', icon: '/rozets/d12.png', target: 280 },
    { level: 6, title: 'Galaksi Efsanesi', icon: '/rozets/d13.png', target: 400 },
    { level: 7, title: 'Galaksi Üstadı', icon: '/rozets/d14.png', target: 550 },
    { level: 8, title: 'Kozmik Profesör', icon: '/rozets/d15.png', target: 750 },
    { level: 9, title: 'Kuantum Mantıkçısı', icon: '/rozets/d16.png', target: 1000 },
  ];

  let currentLevel = 1;
  let levelTitle = 'Matematik Çırağı';
  let levelIcon = '/rozets/d5.png';
  let prevTarget = 0;
  let currentTarget = 20;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const stage = LEVEL_THRESHOLDS[i];
    if (totalCorrect >= stage.target) {
      currentLevel = stage.level + 1;
      prevTarget = stage.target;
      if (i + 1 < LEVEL_THRESHOLDS.length) {
        currentTarget = LEVEL_THRESHOLDS[i + 1].target;
        levelTitle = LEVEL_THRESHOLDS[i + 1].title;
        levelIcon = LEVEL_THRESHOLDS[i + 1].icon;
      } else {
        const extraLevels = currentLevel - 9;
        currentTarget = 1000 + (extraLevels * 300);
        levelTitle = `Zirve Şampiyon Lvl ${currentLevel}`;
        levelIcon = '👑';
      }
    } else {
      currentLevel = stage.level;
      levelTitle = stage.title;
      levelIcon = stage.icon;
      currentTarget = stage.target;
      break;
    }
  }

  const levelProgress = Math.max(0, totalCorrect - prevTarget);
  const levelNeed = Math.max(1, currentTarget - prevTarget);
  const percent = Math.min(100, Math.round((levelProgress / levelNeed) * 100));

  return {
    totalCorrect,
    totalSolved,
    totalBadgesEarned,
    currentLevel,
    levelTitle,
    levelIcon,
    prevTarget,
    currentTarget,
    percent
  };
};

export default function App() {
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [showOrientationToast, setShowOrientationToast] = useState<string | null>(null);

  const toggleOrientation = () => {
    const nextState = !isLandscape;
    setIsLandscape(nextState);
    const modeName = nextState ? "Yatay Ekran Modu (Landscape)" : "Dikey Ekran Modu (Portrait)";
    setShowOrientationToast(modeName);
    setTimeout(() => setShowOrientationToast(null), 2500);

    // Try native Screen Orientation API lock
    if (window.screen && window.screen.orientation && typeof (window.screen.orientation as any).lock === 'function') {
      (window.screen.orientation as any).lock(nextState ? 'landscape' : 'portrait').catch(() => {});
    }
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const [bgImage, setBgImage] = useState<string>(() => {
    return localStorage.getItem('userCustomBg') || '/bg-children.jpg';
  });

  const [customWinVideo, setCustomWinVideo] = useState<string | null>(() => {
    return localStorage.getItem('customWinVideo') || null;
  });

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setCustomWinVideo(result);
          localStorage.setItem('customWinVideo', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('bgOpacity');
    return saved ? parseFloat(saved) : 0.22;
  });

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setBgImage(result);
          localStorage.setItem('userCustomBg', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [expandedModalCategories, setExpandedModalCategories] = useState<Record<string, boolean>>({});

  const toggleModalCategory = (catId: string) => {
    setExpandedModalCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mathGameSound') !== '0';
  });

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'cat-geometri': true,
    'cat-sayilar': true,
    'cat-islemler': true,
    'cat-olcme': true
  });

  const [openSubGroups, setOpenSubGroups] = useState<Record<string, boolean>>({
    'subgrp-ritmik': true,
    'subgrp-saat': true,
    'subgrp-toplama': true,
    'subgrp-cikarma': true
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const toggleSubGroup = (subId: string) => {
    setOpenSubGroups(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
  };
  const [currentTopic, setCurrentTopic] = useState<string>('nesne_sayisi');
  const [openedTopics, setOpenedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('openedTopics_v1');
      return saved ? JSON.parse(saved) : ['nesne_sayisi'];
    } catch {
      return ['nesne_sayisi'];
    }
  });
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'gameover'>('welcome');
  const [showIntro, setShowIntro] = useState(true);
  const introVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (showIntro && introVideoRef.current) {
      const v = introVideoRef.current;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.play().catch(() => {});
    }
  }, [showIntro]);

  // Single Player Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [hasHad3StreakInSession, setHasHad3StreakInSession] = useState(false);
  const [hasFailedAfter3Streak, setHasFailedAfter3Streak] = useState(false);

  // Player Count & Multi-Player Duel State (1 Oyuncu, 2 Oyuncu Düello, 3 Oyuncu Düello)
  const [playerCountMode, setPlayerCountMode] = useState<1 | 2 | 3>(1);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [duelWinnerIndex, setDuelWinnerIndex] = useState<number | null>(null);

  const playSynthSound = (src: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      if (src.includes('coin') || src.includes('para')) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (src.includes('tek') || src.includes('dtt')) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (src.includes('nextlvl') || src.includes('farklilvl') || src.includes('2ci3lude')) {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      }
    } catch {
      // Ignore synth audio errors silently
    }
  };

  // Cache audio instances for instant playback across browsers
  const playMp3 = (src: string, onEnded?: () => void) => {
    if (!soundEnabled) return;
    try {
      // Standardize clean path
      const cleanSrc = src.startsWith('/') ? src : `/${src.replace(/^\.\//, '')}`;
      const audio = new Audio(cleanSrc);
      audio.currentTime = 0;
      audio.volume = 1.0;

      let hasEnded = false;
      const triggerEnded = () => {
        if (!hasEnded) {
          hasEnded = true;
          if (onEnded) onEnded();
        }
      };

      audio.onended = () => {
        triggerEnded();
      };

      audio.onerror = () => {
        playSynthSound(cleanSrc);
        setTimeout(triggerEnded, 300);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playSynthSound(cleanSrc);
          setTimeout(triggerEnded, 300);
        });
      }
    } catch {
      playSynthSound(src);
      if (onEnded) onEnded();
    }
  };

  const speakTurkishText = (text: string) => {
    if (!soundEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Ignore speech synthesis errors
    }
  };

  const playCoinSound = (_starCount: 3 | 5 | 7 = 3) => {
    playMp3('/coin.mp3');
  };

  const playParaSound = (onEnded?: () => void) => {
    playMp3('/para.mp3', onEnded);
  };

  const playTekSound = () => {
    playMp3('/tek.mp3');
  };

  const playParaAndTekSound = () => {
    playMp3('/para.mp3', () => {
      playMp3('/tek.mp3');
    });
  };

  const playCoinAndTekSound = () => {
    playMp3('/coin.mp3', () => {
      playMp3('/tek.mp3');
    });
  };

  const playGoldCoinSound = (_count = 3) => {
    // Sentetik ses kaldırıldı
  };

  const playFireworkSound = () => {
    // Sentetik ses kaldırıldı
  };

  const triggerFireworks = () => {
    playFireworkSound();
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 99999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [currentQuestionData, setCurrentQuestionData] = useState<QuestionData | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<(string | number)[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'wrong'>('none');

  // End Game Info
  const [gameResult, setGameResult] = useState<{
    reason: 'puan' | 'can';
    score: number;
    livesLeft: number;
    streak?: number;
    topicWinCount?: number;
    isThreeStarWin?: boolean;
  } | null>(null);

  const [topicWinCounts, setTopicWinCounts] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mathGameTopicWins_v1') || '{}');
    } catch {
      return {};
    }
  });
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [show3DLab, setShow3DLab] = useState(false);
  const [statsModalTab, setStatsModalTab] = useState<'rozetler' | 'istatistik'>('rozetler');
  const [confirmReset, setConfirmReset] = useState(false);
  const [statsData, setStatsData] = useState<Record<string, StatRecord>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mathGameStats_v1') || '{}');
    } catch {
      return {};
    }
  });

  const DEFAULT_GROUP_STATS: GroupStatsRecord = {
    grup1: { id: 'grup1', name: '1. GRUP', badge: '🥇', color: 'blue', dogru: 0, yanlis: 0, wins: 0, topicStats: {} },
    grup2: { id: 'grup2', name: '2. GRUP', badge: '🥈', color: 'rose', dogru: 0, yanlis: 0, wins: 0, topicStats: {} },
    grup3: { id: 'grup3', name: '3. GRUP', badge: '🥉', color: 'emerald', dogru: 0, yanlis: 0, wins: 0, topicStats: {} },
  };

  const [groupStatsData, setGroupStatsData] = useState<GroupStatsRecord>(() => {
    try {
      const raw = localStorage.getItem('mathGameGroupStats_v1');
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return DEFAULT_GROUP_STATS;
  });

  const totalCorrect = Object.values(statsData).reduce<number>((sum, item) => sum + ((item as StatRecord)?.dogru || 0), 0);
  const totalCoins = totalCorrect * 10;

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mathGameBadges_v1') || '[]');
    } catch {
      return [];
    }
  });
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mathGameBadgeCounts_v1') || '{}');
    } catch {
      return {};
    }
  });
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<BadgeItem | null>(null);

  const incrementBadgeCount = (badgeId: string, amount = 1) => {
    try {
      const existing: Record<string, number> = JSON.parse(localStorage.getItem('mathGameBadgeCounts_v1') || '{}');
      const updated = {
        ...existing,
        [badgeId]: (existing[badgeId] || 0) + amount
      };
      localStorage.setItem('mathGameBadgeCounts_v1', JSON.stringify(updated));
      setBadgeCounts(updated);
    } catch {
      // Ignore
    }
  };

  const checkAndUnlockBadges = (
    currentStats: Record<string, StatRecord>,
    curStreak: number,
    curScore: number,
    curLives: number,
    isWin?: boolean
  ) => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('mathGameBadges_v1') || '[]');
      const newlyUnlocked: string[] = [...existing];
      let lastUnlockedBadge: BadgeItem | null = null;

      BADGES.forEach(badge => {
        if (!newlyUnlocked.includes(badge.id)) {
          const isUnlocked = badge.checkUnlocked(
            currentStats,
            curStreak,
            curScore,
            curLives,
            isWin,
            newlyUnlocked.length
          );
          if (isUnlocked) {
            newlyUnlocked.push(badge.id);
            lastUnlockedBadge = badge;
          }
        }
      });

      if (newlyUnlocked.length > existing.length) {
        localStorage.setItem('mathGameBadges_v1', JSON.stringify(newlyUnlocked));
        setUnlockedBadges(newlyUnlocked);
        if (lastUnlockedBadge) {
          setNewlyUnlockedBadge(lastUnlockedBadge);
          triggerFireworks();
          setTimeout(() => {
            setNewlyUnlockedBadge(null);
          }, 4500);
        }
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    checkAndUnlockBadges(statsData, streak, score, lives);
  }, [statsData]);

  // Play hata.mp3 audio whenever trytry2.mp4 defeat video screen is shown
  useEffect(() => {
    if (gameState === 'gameover' && gameResult && gameResult.reason !== 'puan') {
      playMp3('/hata.mp3');
    }
  }, [gameState, gameResult]);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Handle Theme Toggle
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('mathGameSound', next ? '1' : '0');
  };

  // Sound Synthesizer (Cevap tıklama ve geri bildirim sesleri)
  const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, vol = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t0 = ctx.currentTime + delay;
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch {
      // Audio play failed or blocked
    }
  };

  const playCorrectSound = () => {
    playTone(660, 0.12, 'sine', 0, 0.15);
    playTone(880, 0.16, 'sine', 0.09, 0.15);
  };

  const playWrongSound = () => {
    playTone(200, 0.28, 'sawtooth', 0, 0.10);
  };

  const playWinSound = () => {
    [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.22, 'sine', i * 0.14, 0.16));
  };

  const playDttSound = () => {
    playMp3('/dtt.mp3');
  };

  const playNextLvlSound = () => {
    playMp3('/nextlvl.mp3');
  };

  const playFarkliLvlSound = () => {
    playMp3('/farklilvl.mp3');
  };

  // Topics configuration
  const topics: Record<string, { title: string; desc: string; generate: () => QuestionData }> = {
    // 1. NESNELERİN GEOMETRİSİ
    geometrik_sekil_cisim: {
      title: "Geometrik Şekil ve Cisimler",
      desc: "Küp, küre, silindir, dikdörtgenler prizması gibi geometrik cisimleri tanıma.",
      generate: () => {
        const cisimAnahtarlari = Object.keys(CISIM_SVG);
        const secilenKey = cisimAnahtarlari[Math.floor(Math.random() * cisimAnahtarlari.length)];
        const dogruAd = CISIM_OZELLIK[secilenKey].ad;
        const tumAdlar = Object.values(CISIM_OZELLIK).map(o => o.ad);
        const wrong = rastgeleSec(tumAdlar.filter(a => a !== dogruAd), 3);
        const soruHTML = `<div class="flex flex-col items-center justify-center w-full gap-2 my-auto max-h-full"><div class="h-16 sm:h-24 md:h-28 max-w-[150px] flex items-center justify-center shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">${CISIM_SVG[secilenKey]}</div><div class="text-xs sm:text-sm md:text-base font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">Bu geometrik cismin adı nedir?</div></div>`;
        return {
          question: "Bu geometrik cismin adı nedir?",
          questionHTML: soruHTML,
          correct: dogruAd,
          wrong,
          isLong: true
        };
      }
    },
    yuz_ayrit_kose: {
      title: "Geometrik Cisimler: Yüz, Ayrıt, Köşe",
      desc: "Geometrik cisimlerin yüz, ayrıt ve köşe sayılarını bulma.",
      generate: () => {
        const cisimAnahtarlari = Object.keys(CISIM_SVG);
        const secilenKey = cisimAnahtarlari[Math.floor(Math.random() * cisimAnahtarlari.length)];
        const ozellik = CISIM_OZELLIK[secilenKey];
        const sorulan = ['yüz', 'ayrıt', 'köşe'][Math.floor(Math.random() * 3)] as 'yüz' | 'ayrıt' | 'köşe';
        const cevap = ozellik[sorulan];
        const ek = OZELLIK_EK[sorulan];
        const tamlayan = getCisimTamlayan(ozellik.ad);
        const soruHTML = `<div class="flex flex-col items-center justify-center w-full gap-2 my-auto max-h-full"><div class="h-16 sm:h-24 md:h-28 max-w-[150px] flex items-center justify-center shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">${CISIM_SVG[secilenKey]}</div><div class="text-xs sm:text-sm md:text-base font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"><b>${tamlayan}</b> kaç <b>${ek.buyuk}</b> vardır?</div></div>`;
        return {
          question: `${tamlayan} kaç ${ek.kucuk} vardır?`,
          questionHTML: soruHTML,
          correct: cevap,
          wrong: benzersizYanlislar(cevap, [cevap + 1, cevap - 1, cevap + 2, cevap - 2], 0),
          isLong: true
        };
      }
    },
    uzamsal_iliskiler_simetri: {
      title: "Uzamsal İlişkiler & Simetri",
      desc: "Simetrik harf, rakam ve şekilleri tanıma ve ayırt etme.",
      generate: () => {
        const simetrikHarfler = ['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y', '8'];
        const asimetrikHarfler = ['F', 'G', 'J', 'K', 'L', 'N', 'P', 'Q', 'R', 'S', 'Z', '2', '3', '4', '5', '6', '7', '9'];
        const simetrikSoruluyor = Math.random() < 0.5;
        if (simetrikSoruluyor) {
          const correct = simetrikHarfler[Math.floor(Math.random() * simetrikHarfler.length)];
          const wrong = rastgeleSec(asimetrikHarfler, 3);
          return {
            question: "Aşağıdaki harf veya rakamlardan hangisi dikey eksende SİMETRİKTİR?",
            correct,
            wrong,
            isLong: true
          };
        } else {
          const correct = asimetrikHarfler[Math.floor(Math.random() * asimetrikHarfler.length)];
          const wrong = rastgeleSec(simetrikHarfler, 3);
          return {
            question: "Aşağıdaki harf veya rakamlardan hangisi dikey eksende SİMETRİK DEĞİLDİR?",
            correct,
            wrong,
            isLong: true
          };
        }
      }
    },
    geometrik_oruntu: {
      title: "Geometrik Örüntüler",
      desc: "Belirli bir kurala göre dizilmiş geometrik şekillerdeki eksik elemanı bulma.",
      generate: () => {
        const sekiller = ["🔴", "🟦", "🔺", "🟢"];
        const desen = [sekiller[0], sekiller[1], sekiller[2]];
        const oruntu = [...desen, ...desen];
        const boslukIndex = Math.floor(Math.random() * 3) + 3;
        const correct = oruntu[boslukIndex];
        const secilenKare = RITMIK_KARE_RENKLERI[Math.floor(Math.random() * RITMIK_KARE_RENKLERI.length)];
        const gosterim = [...oruntu];
        (gosterim as (string[])[number][])[boslukIndex] = secilenKare.emoji;

        const patternHTML = oruntu.map((item, idx) => {
          if (idx === boslukIndex) {
            return `<div class="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-tr ${secilenKare.bgClass} border text-white font-black flex items-center justify-center shadow-md animate-pulse text-sm xs:text-base sm:text-xl ring-2 ring-white/30 shrink-0">${secilenKare.emoji}</div>`;
          }
          return `<div class="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-900/80 border border-blue-400/60 flex items-center justify-center text-sm xs:text-base sm:text-xl shadow-md shrink-0">${item}</div>`;
        }).join('<span class="text-amber-300 font-extrabold text-[10px] xs:text-xs sm:text-sm md:text-base mx-0.5 shrink-0">-</span>');

        const soruHTML = `<div class="flex flex-col items-center justify-center w-full h-full my-auto gap-1.5 sm:gap-2.5 py-0.5">
          <div class="text-sm xs:text-base sm:text-lg md:text-xl font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-1.5 leading-snug sm:leading-normal">
            Aşağıdaki geometrik örüntüde <span class="text-amber-300 underline decoration-amber-400 font-extrabold">${secilenKare.ad}</span> yerine hangi şekil gelmelidir?
          </div>
          <div class="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5 flex-nowrap max-w-full overflow-hidden px-0.5">
            ${patternHTML}
          </div>
        </div>`;

        return {
          question: `Aşağıdaki geometrik örüntüde ${secilenKare.ad} (${secilenKare.emoji}) yerine hangi şekil gelmelidir?\n\n${gosterim.join("  -  ")}`,
          questionHTML: soruHTML,
          correct,
          wrong: sekiller.filter(s => s !== correct),
          isLong: true
        };
      }
    },

    // 2. SAYILAR VE NİCELİKLER
    nesne_sayisi: {
      title: "En Yakın Onluğa Yuvarlama",
      desc: "Sayıları en yakın onluğa yuvarlama alıştırması yapıyoruz.",
      generate: () => {
        const sayi = Math.floor(Math.random() * 89) + 11;
        const birler = sayi % 10;
        const onlar = Math.floor(sayi / 10);
        const dogruOnluk = birler >= 5 ? (onlar + 1) * 10 : onlar * 10;
        const yanlislar = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].filter(o => o !== dogruOnluk).sort(() => 0.5 - Math.random()).slice(0, 3);
        return {
          question: `${sayi} sayısı hangi onluğa daha yakındır?`,
          correct: dogruOnluk,
          wrong: yanlislar,
          isLong: true
        };
      }
    },
    sayi_basamak_degeri: {
      title: "Sayı ve Basamak Değeri",
      desc: "İki basamaklı sayılarda rakamların basamak ve sayı değerlerini bulma.",
      generate: () => {
        const onlar = Math.floor(Math.random() * 8) + 1;
        const birler = Math.floor(Math.random() * 9) + 1;
        const sayi = onlar * 10 + birler;
        const sorulanBasamak = Math.random() < 0.5 ? 'onlar' : 'birler';
        const soruTuru = Math.random() < 0.5 ? 'basamak' : 'sayi';
        const rakam = sorulanBasamak === 'onlar' ? onlar : birler;

        if (soruTuru === 'basamak') {
          const basamakDegeri = sorulanBasamak === 'onlar' ? onlar * 10 : birler;
          return {
            question: `${sayi} sayısının ${sorulanBasamak} basamağındaki rakamın BASAMAK DEĞERİ kaçtır?`,
            correct: basamakDegeri,
            wrong: benzersizYanlislar(basamakDegeri, [rakam, basamakDegeri + 10, basamakDegeri - 10, basamakDegeri + 5], 0),
            isLong: true
          };
        } else {
          const digerRakam = sorulanBasamak === 'onlar' ? birler : onlar;
          return {
            question: `${sayi} sayısının ${sorulanBasamak} basamağındaki rakamın SAYI DEĞERİ kaçtır?`,
            correct: rakam,
            wrong: benzersizYanlislar(rakam, [rakam + 1, rakam - 1, digerRakam, rakam * 10], 0),
            isLong: true
          };
        }
      }
    },
    deste_duzine: {
      title: "Deste ve Düzine",
      desc: "Deste (10 tane) ve Düzine (12 tane) kavramlarını öğrenme.",
      generate: () => {
        const k = Math.floor(Math.random() * 5) + 1;
        const isDeste = Math.random() < 0.5;
        const miktar = isDeste ? k * 10 : k * 12;
        const etiket = isDeste ? 'DESTE' : 'DÜZİNE';
        return {
          question: `${miktar} tane nesne kaç ${etiket} eder?`,
          correct: k,
          wrong: benzersizYanlislar(k, [k + 1, k - 1, k + 2, k + 3], 1),
          isLong: true
        };
      }
    },
    sayi_karsilastirma: {
      title: "Sayı Karşılaştırma & Semboller",
      desc: "İki basamaklı sayıları Büyüktür (>), Küçüktür (<) veya Eşittir (=) sembolleriyle karşılaştırma.",
      generate: () => {
        const a = Math.floor(Math.random() * 89) + 10;
        let b = Math.floor(Math.random() * 89) + 10;
        if (Math.random() < 0.2) b = a;
        let correct = '=';
        if (a > b) correct = '>';
        if (a < b) correct = '<';

        const soruHTML = `
          <div class="flex flex-col items-center justify-center w-full gap-2 sm:gap-3 my-auto max-h-full">
            <div class="flex items-center justify-center gap-2.5 sm:gap-5 text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">
              <span class="bg-black/40 px-3 sm:px-5 py-1 sm:py-2 rounded-2xl border border-amber-300/40 shadow-inner">${a}</span>
              <span class="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 border-2 sm:border-3 border-amber-300 text-white font-black shadow-[0_4px_14px_rgba(225,29,72,0.8)] animate-pulse shrink-0">
                <span class="text-lg sm:text-3xl md:text-4xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">?</span>
              </span>
              <span class="bg-black/40 px-3 sm:px-5 py-1 sm:py-2 rounded-2xl border border-amber-300/40 shadow-inner">${b}</span>
            </div>
            <div class="text-xs sm:text-sm md:text-base font-black text-amber-200 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] bg-slate-950/70 px-3.5 py-1 sm:py-1.5 rounded-xl border border-amber-300/40">
              Kırmızı kutu yerine hangi sembol gelmelidir?
            </div>
          </div>
        `;

        return {
          question: `${a}   [ 🟥 ]   ${b}\n\nKırmızı kutu yerine hangi sembol gelmelidir?`,
          questionHTML: soruHTML,
          correct,
          wrong: ['>', '<', '='].filter(s => s !== correct),
          isLong: false
        };
      }
    },
    sira_sayilari: {
      title: "Sıra Bildiren Sayılar",
      desc: "1., 2., 3. gibi sıra bildiren sayıların okunuşlarını bulma.",
      generate: () => {
        const sayilar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];
        const num = sayilar[Math.floor(Math.random() * sayilar.length)];
        const okunuslar: Record<number, string> = {
          1: "Birinci", 2: "İkinci", 3: "Üçüncü", 4: "Dördüncü", 5: "Beşinci",
          6: "Altıncı", 7: "Yedinci", 8: "Sekizinci", 9: "Dokuzuncu", 10: "Onuncu",
          12: "On ikinci", 15: "On beşinci", 20: "Yirminci"
        };
        const correct = okunuslar[num];
        const tumOkunuslar = Object.values(okunuslar).filter(o => o !== correct);
        const wrong = rastgeleSec(tumOkunuslar, 3);
        return {
          question: `"${num}." sayısının okunuşu aşağıdakilerden hangisidir?`,
          correct,
          wrong,
          isLong: true
        };
      }
    },
    ritmik_ileri_2: {
      title: "İleri İkişer Sayma (2-30)",
      desc: "30'a kadar ikişer ritmik sayma zinciri tamamlama.",
      generate: () => ritmikIleriUret(2, 30)
    },
    ritmik_ileri_3: {
      title: "İleri Üçer Sayma (3-30)",
      desc: "30'a kadar üçer ritmik sayma zinciri tamamlama.",
      generate: () => ritmikIleriUret(3, 30)
    },
    ritmik_ileri_4: {
      title: "İleri Dörder Sayma (4-40)",
      desc: "40'a kadar dörder ritmik sayma zinciri tamamlama.",
      generate: () => ritmikIleriUret(4, 40)
    },
    ritmik_ileri_5: {
      title: "İleri Beşer Sayma (5-100)",
      desc: "100'e kadar beşer ritmik sayma zinciri tamamlama.",
      generate: () => ritmikIleriUret(5, 100)
    },
    ritmik_ileri_10: {
      title: "İleri Onar Sayma (10-100)",
      desc: "100'e kadar onar ritmik sayma zinciri tamamlama.",
      generate: () => ritmikIleriUret(10, 100)
    },
    ritmik_geri_2: {
      title: "Geriye İkişer Sayma (20-0)",
      desc: "20'den geriye ikişer ritmik sayma zinciri tamamlama.",
      generate: () => ritmikGeriUret(2)
    },
    ritmik_geri_10: {
      title: "Geriye Onar Sayma (100 içinde)",
      desc: "100 içinde geriye onar ritmik sayma zinciri tamamlama.",
      generate: () => ritmikGeriUret(10)
    },

    // 3. İŞLEMLER VE CEBİR
    tek_islem_toplama_problemleri: {
      title: "Tek İşlemli Toplama Problemleri",
      desc: "Tek adımlı toplama problemleri çözme alıştırması.",
      generate: () => {
        const nesneler = ["bilye", "fındık", "kalem", "çıkartma", "balon", "elma", "çilek", "muz", "portakal", "karpuz", "şeftali", "üzüm", "kiraz", "ceviz"];
        const isim = getRastgeleOgrenci();
        const nesne = nesneler[Math.floor(Math.random() * nesneler.length)];
        const baslangic = Math.floor(Math.random() * 25) + 15;
        const degisim = Math.floor(Math.random() * 15) + 5;
        const correct = baslangic + degisim;
        const tamlayanIsim = getIsimTamlayan(isim);
        const iyelikNesne = getNesneIyelik(nesne);
        return {
          question: `${tamlayanIsim} ${baslangic} tane ${iyelikNesne} vardı. Arkadaşı ona ${degisim} tane daha verdi. ${tamlayanIsim} toplam kaç ${iyelikNesne} oldu?`,
          correct,
          wrong: benzersizYanlislar(correct, [correct - degisim, correct + 5, correct - 5, baslangic], 1),
          isLong: true
        };
      }
    },
    iki_islem_toplama_problemleri: {
      title: "İki İşlemli Toplama Problemleri",
      desc: "İki adımlı toplama problemleri çözme alıştırması.",
      generate: () => {
        const s1 = Math.floor(Math.random() * 15) + 5;
        const s2 = Math.floor(Math.random() * 15) + 5;
        const s3 = Math.floor(Math.random() * 15) + 5;
        const correct = s1 + s2 + s3;
        return {
          question: `Bir kütüphanede 1. rafta ${s1}, 2. rafta ${s2} ve 3. rafta ${s3} kitap vardır. Kütüphanede toplam kaç kitap vardır?`,
          correct,
          wrong: benzersizYanlislar(correct, [correct + 5, correct - 5, s1 + s2, correct + 10], 1),
          isLong: true
        };
      }
    },
    toplama_eldesiz_50: {
      title: "Eldesiz Toplama",
      desc: "Toplamı 50'yi geçmeyen eldesiz toplama alıştırmaları.",
      generate: () => {
        const { s1, s2, correct } = toplamaUret(20, 50, false);
        return {
          question: `${s1} + ${s2} = ?`,
          correct,
          wrong: benzersizYanlislar(correct, [correct + 10, correct - 2, correct + 5, correct - 5], 0),
          isLong: false
        };
      }
    },
    toplama_eldeli_50: {
      title: "Eldeli Toplama",
      desc: "Toplamı 50'yi geçmeyen eldeli toplama alıştırmaları.",
      generate: () => {
        const { s1, s2, correct } = toplamaUret(20, 50, true);
        return {
          question: `${s1} + ${s2} = ?\n(Eldeye dikkat!)`,
          correct,
          wrong: benzersizYanlislar(correct, [correct - 10, correct + 2, correct - 1, correct + 10], 0),
          isLong: false
        };
      }
    },
    verilmeyen_toplanani_bul: {
      title: "Verilmeyen Toplananı Bul",
      desc: "Toplama işleminde verilmeyen toplananı bulma alıştırmaları (100'den küçük sayılar).",
      generate: () => {
        const sum = Math.floor(Math.random() * 75) + 20; // 20 .. 94 (100'den küçük)
        const s1 = Math.floor(Math.random() * (sum - 10)) + 5; // 5 .. sum - 5
        const s2 = sum - s1;
        const isFirstMissing = Math.random() < 0.5;

        const correct = isFirstMissing ? s1 : s2;
        const knownNum = isFirstMissing ? s2 : s1;

        const qBoxHTML = `<div class="w-9 h-9 sm:w-13 sm:h-13 md:w-15 md:h-15 bg-gradient-to-b from-[#fcd34d] to-[#f59e0b] border-2 sm:border-3 border-[#d97706] rounded-lg sm:rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#1e293b] font-black text-xl sm:text-2xl md:text-3xl select-none shrink-0">?</div>`;
        const plusHTML = `<span class="text-[#f59e0b] font-black text-xl sm:text-3xl md:text-4xl [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] mx-0.5 sm:mx-1">+</span>`;
        const equalsHTML = `<span class="text-[#f59e0b] font-black text-xl sm:text-3xl md:text-4xl [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] mx-0.5 sm:mx-1">=</span>`;
        const knownNumHTML = `<span class="text-white font-black text-xl sm:text-3xl md:text-4xl [text-shadow:0_3px_6px_rgba(0,0,0,0.9)] tracking-wider">${knownNum}</span>`;
        const sumHTML = `<span class="text-[#38bdf8] font-black text-xl sm:text-3xl md:text-4xl [text-shadow:0_3px_6px_rgba(0,0,0,0.9)] tracking-wider">${sum}</span>`;

        const equationHTML = isFirstMissing
          ? `${qBoxHTML} ${plusHTML} ${knownNumHTML} ${equalsHTML} ${sumHTML}`
          : `${knownNumHTML} ${plusHTML} ${qBoxHTML} ${equalsHTML} ${sumHTML}`;

        const questionHTML = `
          <div class="flex flex-col items-center justify-center w-full my-auto py-1">
            <div class="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#008d7a] border border-[#14b8a6] text-white font-black text-[9px] sm:text-[11px] md:text-xs tracking-wider shadow-md uppercase mb-1.5 sm:mb-2.5">
              <span class="text-xs sm:text-sm font-black">+</span> VERİLMEYEN TOPLANANI BUL
            </div>
            <div class="flex items-center justify-center gap-1 sm:gap-2 md:gap-2.5 my-1 sm:my-1.5">
              ${equationHTML}
            </div>
            <div class="text-xs sm:text-sm md:text-base lg:text-lg font-black text-white text-center tracking-wide [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-md mt-1.5 sm:mt-2.5 px-2">
              Soru işareti (?) yerine hangi sayı gelmelidir?
            </div>
          </div>
        `;

        const question = isFirstMissing
          ? `? + ${s2} = ${sum}\nSoru işareti (?) yerine hangi sayı gelmelidir?`
          : `${s1} + ? = ${sum}\nSoru işareti (?) yerine hangi sayı gelmelidir?`;

        const distractors = [
          correct + 10,
          correct - 10,
          correct + 2,
          correct - 2,
          correct + 5,
          correct - 5,
          sum - 10,
          isFirstMissing ? s2 : s1
        ].filter(n => n > 0 && n < 100);

        return {
          question,
          questionHTML,
          correct,
          wrong: benzersizYanlislar(correct, distractors, 1),
          isLong: false
        };
      }
    },
    tek_islem_cikarma_problemleri: {
      title: "Tek İşlemli Çıkarma Problemleri",
      desc: "Tek adımlı çıkarma problemleri çözme alıştırması.",
      generate: () => {
        const nesneler = ["bilye", "fındık", "kalem", "çıkartma", "balon", "elma", "çilek", "muz", "portakal", "karpuz", "şeftali", "üzüm", "kiraz", "ceviz"];
        const isim = getRastgeleOgrenci();
        const nesne = nesneler[Math.floor(Math.random() * nesneler.length)];
        const baslangic = Math.floor(Math.random() * 25) + 15;
        const degisim = Math.floor(Math.random() * 10) + 5;
        const correct = baslangic - degisim;
        const tamlayanIsim = getIsimTamlayan(isim);
        const iyelikNesne = getNesneIyelik(nesne);
        return {
          question: `${tamlayanIsim} ${baslangic} tane ${iyelikNesne} vardı. ${degisim} tanesini arkadaşlarına dağıttı. ${tamlayanIsim} kaç ${iyelikNesne} kaldı?`,
          correct,
          wrong: benzersizYanlislar(correct, [baslangic + degisim, correct + 5, correct - 5, degisim], 1),
          isLong: true
        };
      }
    },
    iki_islem_cikarma_problemleri: {
      title: "İki İşlemli Çıkarma Problemleri",
      desc: "İki adımlı çıkarma problemleri çözme alıştırması.",
      generate: () => {
        const baslangic = Math.floor(Math.random() * 20) + 30;
        const cikan1 = Math.floor(Math.random() * 8) + 5;
        const cikan2 = Math.floor(Math.random() * 8) + 5;
        const correct = baslangic - cikan1 - cikan2;
        return {
          question: `Bir kümeste ${baslangic} tavuk vardı. Önce ${cikan1} tavuk, sonra ${cikan2} tavuk satıldı. Kümeste kaç tavuk kaldı?`,
          correct,
          wrong: benzersizYanlislar(correct, [baslangic - cikan1, correct + 5, correct - 5, baslangic - cikan2], 1),
          isLong: true
        };
      }
    },
    toplama_cikarma_problemleri: {
      title: "Toplama ve Çıkarma Problemleri",
      desc: "Toplama ve çıkarma işlemlerini içeren karma problemler.",
      generate: () => {
        const baslangic = Math.floor(Math.random() * 20) + 15;
        const eklenen = Math.floor(Math.random() * 15) + 5;
        const cikarilan = Math.floor(Math.random() * 10) + 5;
        const correct = baslangic + eklenen - cikarilan;
        return {
          question: `Bir otobüste ${baslangic} yolcu vardı. İlk durakta ${eklenen} yolcu bindi, 2. durakta ${cikarilan} yolcu indi. Otobüste kaç yolcu kaldı?`,
          correct,
          wrong: benzersizYanlislar(correct, [baslangic + eklenen, baslangic - cikarilan, correct + 5, correct - 5], 1),
          isLong: true
        };
      }
    },
    cikarma_onluksuz_50: {
      title: "Onluk Bozmadan",
      desc: "Onluk bozma gerektirmeyen çıkarma alıştırmaları.",
      generate: () => {
        const { s1, s2, correct } = cikarmaUret(21, 50, false);
        return {
          question: `${s1} - ${s2} = ?`,
          correct,
          wrong: benzersizYanlislar(correct, [correct + 10, correct - 5, correct + 2, correct - 2], 0),
          isLong: false
        };
      }
    },
    cikarma_onluklu_50: {
      title: "Onluk Bozarak",
      desc: "Onluk bozarak çıkarma alıştırmaları.",
      generate: () => {
        const { s1, s2, correct } = cikarmaUret(21, 50, true);
        return {
          question: `${s1} - ${s2} = ?\n(Komşudan onluk al!)`,
          correct,
          wrong: benzersizYanlislar(correct, [correct + 10, correct - 10, correct + 1, correct - 1], 0),
          isLong: false
        };
      }
    },
    zihinden_toplama: {
      title: "Zihinden Toplama",
      desc: "Zihinden toplama işlemleri yapma alıştırmaları.",
      generate: () => {
        const onlar = (Math.floor(Math.random() * 4) + 1) * 10;
        const birler = Math.floor(Math.random() * 30) + 10;
        const correct = onlar + birler;
        return {
          question: `${onlar} + ${birler} = ?\n(Zihinden topla)`,
          correct,
          wrong: benzersizYanlislar(correct, [correct + 10, correct - 10, correct + 5, correct - 5], 0),
          isLong: false
        };
      }
    },
    zihinden_cikarma: {
      title: "Zihinden Çıkarma",
      desc: "Zihinden çıkarma işlemleri yapma alıştırmaları.",
      generate: () => {
        const s1 = Math.floor(Math.random() * 40) + 30;
        const s2 = (Math.floor(Math.random() * 2) + 1) * 10;
        const correct = s1 - s2;
        return {
          question: `${s1} - ${s2} = ?\n(Zihinden çıkar)`,
          correct,
          wrong: benzersizYanlislar(correct, [correct + 10, correct - 10, correct + 5, correct - 5], 0),
          isLong: false
        };
      }
    },
    ardisik_toplama: {
      title: "Ardışık Toplama",
      desc: "Aynı sayının ardışık toplanması alıştırmaları.",
      generate: () => {
        const sayi = Math.floor(Math.random() * 4) + 2;
        const adet = Math.floor(Math.random() * 3) + 3;
        const dizi = Array(adet).fill(sayi);
        const correct = sayi * adet;
        const secilenKare = RITMIK_KARE_RENKLERI[Math.floor(Math.random() * RITMIK_KARE_RENKLERI.length)];

        const soruHTML = `<div class="flex flex-col items-center justify-center w-full h-full my-auto gap-2 sm:gap-3 py-1">
          <div class="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white text-center drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] [text-shadow:0_2px_4px_#000] px-1.5 leading-snug">
            İşlemde <span class="text-amber-300 underline decoration-amber-400 font-extrabold">${secilenKare.ad}</span> yerine hangi sayı gelmelidir?
          </div>
          <div class="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white flex-nowrap max-w-full overflow-hidden px-1 drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] [text-shadow:0_2px_4px_#000]">
            ${dizi.map(n => `<span class="px-2 py-1 rounded-xl bg-blue-900/90 border border-blue-400/60 shadow-md shrink-0">${n}</span>`).join('<span class="text-amber-400 mx-0.5 shrink-0">+</span>')}
            <span class="text-amber-400 mx-0.5 shrink-0">=</span>
            <div class="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${secilenKare.bgClass} border text-white font-black flex items-center justify-center shadow-lg animate-pulse text-base xs:text-lg sm:text-2xl ring-2 ring-white/30 shrink-0">${secilenKare.emoji}</div>
          </div>
        </div>`;

        return {
          question: `${dizi.join(" + ")} = ${secilenKare.emoji}`,
          questionHTML: soruHTML,
          correct,
          wrong: benzersizYanlislar(correct, [correct + sayi, correct - sayi, correct + 1, correct - 1], 1),
          isLong: false
        };
      }
    },
    ritmik_carpim: {
      title: "Ritmik Çarpım",
      desc: "Ritmik sayma ile çarpma alıştırmaları.",
      generate: () => {
        const carpanlar = [2, 3, 4, 5, 10];
        const c1 = carpanlar[Math.floor(Math.random() * carpanlar.length)];
        const c2 = Math.floor(Math.random() * 9) + 1;
        const correct = c1 * c2;
        const secilenKare = RITMIK_KARE_RENKLERI[Math.floor(Math.random() * RITMIK_KARE_RENKLERI.length)];

        const soruHTML = `<div class="flex flex-col items-center justify-center w-full h-full my-auto gap-2 sm:gap-3 py-1">
          <div class="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-white text-center drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] [text-shadow:0_2px_4px_#000] px-1.5 leading-snug">
            İşlemde <span class="text-amber-300 underline decoration-amber-400 font-extrabold">${secilenKare.ad}</span> yerine hangi sayı gelmelidir?
          </div>
          <div class="flex items-center justify-center gap-1.5 sm:gap-2 text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white flex-nowrap max-w-full overflow-hidden px-1 drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] [text-shadow:0_2px_4px_#000]">
            <span class="px-2.5 py-1 rounded-xl bg-blue-900/90 border border-blue-400/60 shadow-md shrink-0">${c1}</span>
            <span class="text-amber-400 shrink-0">x</span>
            <span class="px-2.5 py-1 rounded-xl bg-blue-900/90 border border-blue-400/60 shadow-md shrink-0">${c2}</span>
            <span class="text-amber-400 shrink-0">=</span>
            <div class="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${secilenKare.bgClass} border text-white font-black flex items-center justify-center shadow-lg animate-pulse text-base xs:text-lg sm:text-2xl ring-2 ring-white/30 shrink-0">${secilenKare.emoji}</div>
          </div>
        </div>`;

        return {
          question: `${c1}  x  ${c2}  =  ${secilenKare.emoji}`,
          questionHTML: soruHTML,
          correct,
          wrong: benzersizYanlislar(correct, [correct + c1, correct - c1, correct + 1, correct - 1], 1),
          isLong: false
        };
      }
    },
    esit_paylastirma: {
      title: "Eşit Paylaştırma",
      desc: "Eşit şekilde paylaştırma alıştırmaları.",
      generate: () => {
        const nesneler = ["elma", "çilek", "muz", "portakal", "karpuz", "şeftali", "üzüm", "kiraz", "mandalina", "erik", "fındık", "ceviz", "bilye", "balon"];
        const nesne = nesneler[Math.floor(Math.random() * nesneler.length)];
        const nesneBelirtme = getNesneBelirtme(nesne);
        const kisiler = Math.floor(Math.random() * 3) + 2;
        const kisiBasi = Math.floor(Math.random() * 5) + 2;
        const toplam = kisiler * kisiBasi;
        return {
          question: `${toplam} ${nesneBelirtme} ${kisiler} arkadaş eşit paylaşıyor. Her birine kaç ${nesne} düşer?`,
          correct: kisiBasi,
          wrong: benzersizYanlislar(kisiBasi, [kisiBasi + 1, kisiBasi - 1, kisiBasi + 2, kisiler], 1),
          isLong: true
        };
      }
    },
    ardisik_cikarma: {
      title: "Ardışık Çıkarma",
      desc: "Ardışık çıkarma alıştırmaları.",
      generate: () => {
        const cikan = Math.floor(Math.random() * 3) + 2;
        const tekrar = Math.floor(Math.random() * 3) + 3;
        const eksilen = cikan * tekrar;
        return {
          question: `${eksilen} sayısından sıfıra ulaşana kadar kaç kez ${cikan} çıkarılır?`,
          correct: tekrar,
          wrong: benzersizYanlislar(tekrar, [tekrar + 1, tekrar - 1, tekrar + 2, cikan], 1),
          isLong: true
        };
      }
    },
    kalansiz_bolme: {
      title: "Kalansız Bölme",
      desc: "Kalansız bölme alıştırmaları.",
      generate: () => {
        const bolen = [2, 3, 4, 5, 10][Math.floor(Math.random() * 5)];
        const bolum = Math.floor(Math.random() * 8) + 1;
        const bolunen = bolen * bolum;
        return {
          question: `${bolunen} ÷ ${bolen} = ?`,
          correct: bolum,
          wrong: benzersizYanlislar(bolum, [bolum + 1, bolum - 1, bolum + 2, bolum * 2], 1),
          isLong: false
        };
      }
    },

    // 4. ÖLÇME, VERİ VE KESİRLER
    kesirler: {
      title: "Kesirler (Bütün, Yarım, Çeyrek)",
      desc: "Bütün, yarım ve çeyrek kesir dönüşümleri.",
      generate: () => {
        const yiyecekler = ["ekmek", "elma", "pasta", "pide", "karpuz", "portakal", "simit", "pizza", "kivi", "şeftali"];
        const yiyecek = yiyecekler[Math.floor(Math.random() * yiyecekler.length)];
        const tur = Math.floor(Math.random() * 4);

        if (tur === 0) {
          // Yarım -> Bütün
          const yarim = (Math.floor(Math.random() * 5) + 1) * 2;
          const buton = yarim / 2;
          return {
            question: `${yarim} yarım ${yiyecek} kaç BÜTÜN ${yiyecek} eder?`,
            correct: `${buton} Bütün`,
            wrong: benzersizYanlislarString(`${buton} Bütün`, [`${buton + 1} Bütün`, `${Math.max(1, buton - 1)} Bütün`, `${yarim} Bütün`, `${buton * 2} Bütün`]),
            isLong: false
          };
        } else if (tur === 1) {
          // Bütün -> Çeyrek
          const buton = Math.floor(Math.random() * 4) + 1;
          const ceyrek = buton * 4;
          return {
            question: `${buton} bütün ${yiyecek} kaç ÇEYREK ${yiyecek} eder?`,
            correct: `${ceyrek} Çeyrek`,
            wrong: benzersizYanlislarString(`${ceyrek} Çeyrek`, [`${ceyrek + 2} Çeyrek`, `${ceyrek - 2} Çeyrek`, `${buton * 2} Çeyrek`, `${ceyrek + 4} Çeyrek`]),
            isLong: false
          };
        } else if (tur === 2) {
          // Çeyrek -> Bütün
          const ceyrek = (Math.floor(Math.random() * 4) + 1) * 4;
          const buton = ceyrek / 4;
          return {
            question: `${ceyrek} çeyrek ${yiyecek} kaç BÜTÜN ${yiyecek} eder?`,
            correct: `${buton} Bütün`,
            wrong: benzersizYanlislarString(`${buton} Bütün`, [`${buton + 1} Bütün`, `${buton + 2} Bütün`, `${ceyrek / 2} Bütün`, `${ceyrek} Bütün`]),
            isLong: false
          };
        } else {
          // Bütün -> Yarım
          const buton = Math.floor(Math.random() * 5) + 1;
          const yarim = buton * 2;
          return {
            question: `${buton} bütün ${yiyecek} kaç YARIM ${yiyecek} eder?`,
            correct: `${yarim} Yarım`,
            wrong: benzersizYanlislarString(`${yarim} Yarım`, [`${buton} Yarım`, `${yarim + 2} Yarım`, `${buton * 4} Yarım`, `${yarim + 1} Yarım`]),
            isLong: false
          };
        }
      }
    },
    zaman_olcme: {
      title: "Zaman Ölçme & Saatler",
      desc: "Görsel analog saatler üzerinde akrep ve yelkovanla saat okuma.",
      generate: () => {
        const h = Math.floor(Math.random() * 12) + 1;
        const tur = Math.floor(Math.random() * 5);
        const formatDigit = (num: number) => (num < 10 ? '0' + num : '' + num);

        if (tur === 0) {
          // Tam Saat (e.g. 03:00)
          const minute = 0;
          const dogruCevap = `${formatDigit(h)}:00`;
          const nextH = h === 12 ? 1 : h + 1;
          const prevH = h === 1 ? 12 : h - 1;
          const wrong = [
            `${formatDigit(h)}:30`,
            `${formatDigit(nextH)}:00`,
            `${formatDigit(prevH)}:00`
          ];

          const svg = generateClockSVG(h, minute);
          const soruHTML = `
            <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
              ${svg}
              <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
                <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
                <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
              </div>
              <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">
                Görseldeki saat kaçı göstermektedir?
              </div>
            </div>
          `;

          return {
            question: "Görseldeki saat kaçı göstermektedir?",
            questionHTML: soruHTML,
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        } else if (tur === 1) {
          // Buçuk / Yarım Saat (e.g. 04:30)
          const minute = 30;
          const dogruCevap = `${formatDigit(h)}:30`;
          const nextH = h === 12 ? 1 : h + 1;
          const wrong = [
            `${formatDigit(h)}:00`,
            `${formatDigit(nextH)}:30`,
            `${formatDigit(nextH)}:00`
          ];

          const svg = generateClockSVG(h, minute);
          const soruHTML = `
            <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
              ${svg}
              <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
                <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
                <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
              </div>
              <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">
                Görseldeki analog saat kaçı göstermektedir?
              </div>
            </div>
          `;

          return {
            question: "Görseldeki analog saat kaçı göstermektedir?",
            questionHTML: soruHTML,
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        } else if (tur === 2) {
          // Çeyrek Geçe (e.g. 02:15)
          const minute = 15;
          const dogruCevap = `${formatDigit(h)}:15`;
          const nextH = h === 12 ? 1 : h + 1;
          const wrong = [
            `${formatDigit(h)}:30`,
            `${formatDigit(h)}:00`,
            `${formatDigit(nextH)}:15`
          ];

          const svg = generateClockSVG(h, minute);
          const soruHTML = `
            <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
              ${svg}
              <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
                <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
                <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
              </div>
              <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">
                Görseldeki saat kaçı göstermektedir?
              </div>
            </div>
          `;

          return {
            question: "Görseldeki saat kaçı göstermektedir?",
            questionHTML: soruHTML,
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        } else if (tur === 3) {
          // Çeyrek Kala (e.g. 05:45)
          const minute = 45;
          const dogruCevap = `${formatDigit(h)}:45`;
          const nextH = h === 12 ? 1 : h + 1;
          const wrong = [
            `${formatDigit(h)}:15`,
            `${formatDigit(h)}:30`,
            `${formatDigit(nextH)}:45`
          ];

          const svg = generateClockSVG(h, minute);
          const soruHTML = `
            <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
              ${svg}
              <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
                <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
                <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
              </div>
              <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">
                Görseldeki saat kaçı göstermektedir?
              </div>
            </div>
          `;

          return {
            question: "Görseldeki saat kaçı göstermektedir?",
            questionHTML: soruHTML,
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        } else {
          // 1 saat sonrası sorusu
          const minute = 0;
          const simdikiSaat = `${formatDigit(h)}:00`;
          const sonrakiH = h === 12 ? 1 : h + 1;
          const dogruCevap = `${formatDigit(sonrakiH)}:00`;
          const wrong = [
            simdikiSaat,
            `${formatDigit(sonrakiH)}:30`,
            `${formatDigit(h === 1 ? 12 : h - 1)}:00`
          ];

          const svg = generateClockSVG(h, minute);
          const soruHTML = `
            <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
              ${svg}
              <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
                <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
                <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
              </div>
              <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">
                Görseldeki saatten <b>1 SAAT SONRA</b> saat kaç olur?
              </div>
            </div>
          `;

          return {
            question: "Görseldeki saatten 1 SAAT SONRA saat kaç olur?",
            questionHTML: soruHTML,
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        }
      }
    },
    saat_tam: {
      title: "Tam Saatler",
      desc: "Tam saatleri okuma ve ayırt etme.",
      generate: () => {
        const h = Math.floor(Math.random() * 12) + 1;
        const formatDigit = (num: number) => (num < 10 ? '0' + num : '' + num);
        const dogruCevap = `${formatDigit(h)}:00`;
        const nextH = h === 12 ? 1 : h + 1;
        const prevH = h === 1 ? 12 : h - 1;
        const wrong = [`${formatDigit(h)}:30`, `${formatDigit(nextH)}:00`, `${formatDigit(prevH)}:00`];
        const svg = generateClockSVG(h, 0);
        const soruHTML = `
          <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
            ${svg}
            <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
              <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
              <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
            </div>
            <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">Görseldeki analog saat kaçı göstermektedir?</div>
          </div>
        `;
        return { question: "Görseldeki analog saat kaçı göstermektedir?", questionHTML: soruHTML, correct: dogruCevap, wrong, isLong: false };
      }
    },
    saat_yarim: {
      title: "Yarım Saatler",
      desc: "Yarım (buçuk) saatleri okuma alıştırması.",
      generate: () => {
        const h = Math.floor(Math.random() * 12) + 1;
        const formatDigit = (num: number) => (num < 10 ? '0' + num : '' + num);
        const dogruCevap = `${formatDigit(h)}:30`;
        const nextH = h === 12 ? 1 : h + 1;
        const wrong = [`${formatDigit(h)}:00`, `${formatDigit(nextH)}:30`, `${formatDigit(nextH)}:00`];
        const svg = generateClockSVG(h, 30);
        const soruHTML = `
          <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
            ${svg}
            <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
              <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
              <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
            </div>
            <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">Görseldeki analog saat kaçı göstermektedir?</div>
          </div>
        `;
        return { question: "Görseldeki analog saat kaçı göstermektedir?", questionHTML: soruHTML, correct: dogruCevap, wrong, isLong: false };
      }
    },
    saat_ceyrek_gece: {
      title: "Çeyrek Geçiyor",
      desc: "Çeyrek geçe saatlerini okuma alıştırması.",
      generate: () => {
        const h = Math.floor(Math.random() * 12) + 1;
        const formatDigit = (num: number) => (num < 10 ? '0' + num : '' + num);
        const dogruCevap = `${formatDigit(h)}:15`;
        const nextH = h === 12 ? 1 : h + 1;
        const wrong = [`${formatDigit(h)}:30`, `${formatDigit(h)}:00`, `${formatDigit(nextH)}:15`];
        const svg = generateClockSVG(h, 15);
        const soruHTML = `
          <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
            ${svg}
            <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
              <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
              <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
            </div>
            <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">Görseldeki analog saat kaçı göstermektedir?</div>
          </div>
        `;
        return { question: "Görseldeki analog saat kaçı göstermektedir?", questionHTML: soruHTML, correct: dogruCevap, wrong, isLong: false };
      }
    },
    saat_ceyrek_kala: {
      title: "Çeyrek Var",
      desc: "Çeyrek kala saatlerini okuma alıştırması.",
      generate: () => {
        const h = Math.floor(Math.random() * 12) + 1;
        const formatDigit = (num: number) => (num < 10 ? '0' + num : '' + num);
        const dogruCevap = `${formatDigit(h)}:45`;
        const nextH = h === 12 ? 1 : h + 1;
        const wrong = [`${formatDigit(h)}:15`, `${formatDigit(h)}:30`, `${formatDigit(nextH)}:45`];
        const svg = generateClockSVG(h, 45);
        const soruHTML = `
          <div class="flex flex-col items-center justify-center gap-1 my-auto w-full">
            ${svg}
            <div class="flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
              <span class="flex items-center gap-1 text-red-200 bg-red-950/80 px-1.5 py-0.5 rounded-md border border-red-500/50">🔴 Akrep</span>
              <span class="flex items-center gap-1 text-blue-200 bg-blue-950/80 px-1.5 py-0.5 rounded-md border border-blue-500/50">🔵 Yelkovan</span>
            </div>
            <div class="text-xs sm:text-base md:text-lg font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">Görseldeki analog saat kaçı göstermektedir?</div>
          </div>
        `;
        return { question: "Görseldeki analog saat kaçı göstermektedir?", questionHTML: soruHTML, correct: dogruCevap, wrong, isLong: false };
      }
    },
    takvim_olcme: {
      title: "Takvim, Günler & Aylar",
      desc: "Gün, hafta, ay, mevsim kavramları ve takvim okuma.",
      generate: () => {
        const t = Math.floor(Math.random() * 4);
        if (t === 0) {
          return {
            question: "1 yılda kaç mevsim vardır?",
            correct: 4,
            wrong: [2, 7, 12],
            isLong: false
          };
        } else if (t === 1) {
          return {
            question: "1 yılda kaç ay vardır?",
            correct: 12,
            wrong: [4, 7, 30],
            isLong: false
          };
        } else if (t === 2) {
          return {
            question: "1 haftada kaç gün vardır?",
            correct: 7,
            wrong: [5, 12, 30],
            isLong: false
          };
        } else {
          const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
          const index = Math.floor(Math.random() * 11);
          const onceki = aylar[index];
          const sonraki = aylar[index + 1];
          return {
            question: `${onceki} ayından sonra hangi ay gelir?`,
            correct: sonraki,
            wrong: rastgeleSec(aylar.filter(a => a !== sonraki && a !== onceki), 3),
            isLong: true
          };
        }
      }
    },
    paralarimiz: {
      title: "Paralarımız",
      desc: "Lira ve Kuruş hesabı ile alışveriş problemleri.",
      generate: () => {
        const getParaGorselleriByTL = (tl: number): string[] => {
          if (tl === 200) return ['/paralar/200_tl_kagit_para.png'];
          if (tl === 100) return ['/paralar/100_tl_kagit_para.png'];
          if (tl === 50) return ['/paralar/50_tl_kagit_para.png'];
          if (tl === 20) return ['/paralar/20_tl_kagit_para.png'];
          if (tl === 10) return ['/paralar/10_tl_kagit_para.png'];
          if (tl === 5) return ['/paralar/5_tl_kagit_para.png'];
          if (tl === 1) return ['/paralar/1_tl_madeni_para.png'];
          
          if (tl >= 50) return ['/paralar/50_tl_kagit_para.png'];
          if (tl >= 20) return ['/paralar/20_tl_kagit_para.png'];
          if (tl >= 10) return ['/paralar/10_tl_kagit_para.png'];
          if (tl >= 5) return ['/paralar/5_tl_kagit_para.png'];
          return ['/paralar/1_tl_madeni_para.png'];
        };

        const renderMoneyQuestionHTML = (images: string[], questionText: string) => {
          return `
            <div class="flex flex-col items-center justify-center w-full gap-1.5 sm:gap-2.5 my-auto max-h-full">
              <div class="flex items-center justify-center gap-2 sm:gap-3 flex-wrap my-0.5 max-w-full">
                ${images.map(imgSrc => `
                  <img src="${imgSrc}" class="h-14 sm:h-20 md:h-24 max-w-[180px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform" />
                `).join('')}
              </div>
              <div class="text-xs sm:text-sm md:text-base font-black text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-2">
                ${questionText}
              </div>
            </div>
          `;
        };

        const get3WrongOptions = (correctVal: number): number[] => {
          const wr: number[] = [];
          const candidates = [
            correctVal + 5,
            correctVal - 5,
            correctVal + 10,
            correctVal - 10,
            correctVal + 15,
            correctVal - 15,
            correctVal + 20,
            correctVal + 2,
            correctVal - 2
          ];
          for (const cand of candidates) {
            if (cand > 0 && cand <= 100 && cand !== correctVal && !wr.includes(cand)) {
              wr.push(cand);
            }
            if (wr.length === 3) break;
          }
          let step = 1;
          while (wr.length < 3) {
            const cand = correctVal + step;
            if (cand > 0 && cand <= 100 && cand !== correctVal && !wr.includes(cand)) {
              wr.push(cand);
            }
            step++;
          }
          return wr;
        };

        const nesneler = ["kitap", "oyuncak", "kalem", "defter", "top", "şapka", "çanta", "kalemlik", "silgi"];
        const nesne = nesneler[Math.floor(Math.random() * nesneler.length)];
        const ogrenci = getRastgeleOgrenci();

        const tur = Math.floor(Math.random() * 4);

        if (tur === 0) {
          // Unit Price Shopping (Tanesi X TL olan...)
          // Prices must be valid single banknote values so image matches price exactly!
          const birimFiyatList = [5, 10, 20, 50];
          const birimFiyat = birimFiyatList[Math.floor(Math.random() * birimFiyatList.length)];
          const maxAdet = Math.min(5, Math.floor(100 / birimFiyat));
          const adet = Math.floor(Math.random() * (maxAdet - 1)) + 2; // at least 2
          const toplam = birimFiyat * adet; // strictly <= 100

          const images = getParaGorselleriByTL(birimFiyat); // Single banknote of unit price (e.g., 20 TL banknote)
          const questionText = `Tanesi ${birimFiyat} TL olan ${getNesneAyrilma(nesne)} ${adet} tane alan ${ogrenci} kaç TL öder?`;

          return {
            question: questionText,
            questionHTML: renderMoneyQuestionHTML(images, questionText),
            correct: `${toplam} TL`,
            wrong: get3WrongOptions(toplam).map(v => `${v} TL`),
            isLong: false
          };
        } else if (tur === 1) {
          // Change Back / Remaining Money (Para Üstü)
          const verilecekList = [20, 50, 100];
          const verilecek = verilecekList[Math.floor(Math.random() * verilecekList.length)];
          const harcananCandidates = [5, 10, 15, 20, 25, 30, 40, 50].filter(h => h < verilecek);
          const harcanan = harcananCandidates[Math.floor(Math.random() * harcananCandidates.length)];
          const kalan = verilecek - harcanan; // strictly <= 100

          const images = getParaGorselleriByTL(verilecek); // Banknote of the given money (e.g. 50 TL banknote)
          const questionText = `${verilecek} TL parası olan ${ogrenci}, ${harcanan} TL'ye bir ${nesne} alırsa kaç TL parası kalır?`;

          return {
            question: questionText,
            questionHTML: renderMoneyQuestionHTML(images, questionText),
            correct: `${kalan} TL`,
            wrong: get3WrongOptions(kalan).map(v => `${v} TL`),
            isLong: false
          };
        } else if (tur === 2) {
          // Two Different Items Shopping (İki farklı ürün)
          // Both item prices must be valid single banknote values (5, 10, 20, 50)
          const banknotlar = [5, 10, 20, 50];
          const fiyat1 = banknotlar[Math.floor(Math.random() * banknotlar.length)];
          const fiyat2Candidates = banknotlar.filter(f => f + fiyat1 <= 100);
          const fiyat2 = fiyat2Candidates[Math.floor(Math.random() * fiyat2Candidates.length)];
          const toplam = fiyat1 + fiyat2; // strictly <= 100

          // Exactly 2 banknotes representing the prices of item 1 and item 2!
          const images = [...getParaGorselleriByTL(fiyat1), ...getParaGorselleriByTL(fiyat2)];
          const nesne2Options = nesneler.filter(n => n !== nesne);
          const nesne2 = nesne2Options[Math.floor(Math.random() * nesne2Options.length)];
          const questionText = `Fiyatı ${fiyat1} TL olan ${nesne} ile ${fiyat2} TL olan ${getNesneBelirtme(nesne2)} alan ${ogrenci} toplam kaç TL öder?`;

          return {
            question: questionText,
            questionHTML: renderMoneyQuestionHTML(images, questionText),
            correct: `${toplam} TL`,
            wrong: get3WrongOptions(toplam).map(v => `${v} TL`),
            isLong: false
          };
        } else {
          // Kuruş to TL Conversion Problem
          const liraList = [1, 2, 3, 4, 5];
          const lira = liraList[Math.floor(Math.random() * liraList.length)];
          const kurus = lira * 100;

          // Display 50 kuruş or 1 TL coins representing kuruş
          let images: string[] = [];
          if (kurus === 100) {
            images = ['/paralar/50_kurus_madeni_para.png', '/paralar/50_kurus_madeni_para.png'];
          } else if (kurus === 200) {
            images = ['/paralar/1_tl_madeni_para.png', '/paralar/1_tl_madeni_para.png'];
          } else {
            images = ['/paralar/1_tl_madeni_para.png'];
          }

          const questionText = `Kumbarasından ${kurus} Kuruş çıkan ${getIsimTamlayan(ogrenci)} toplam kaç TL parası vardır?`;

          return {
            question: questionText,
            questionHTML: renderMoneyQuestionHTML(images, questionText),
            correct: `${lira} TL`,
            wrong: get3WrongOptions(lira).map(v => `${v} TL`),
            isLong: false
          };
        }
      }
    },
    uzunluk_olcme: {
      title: "Uzunluk Ölçme",
      desc: "Standart olan/olmayan birimler, uzunluk tahmin etme ve problemler.",
      generate: () => {
        // 3 Farklı Soru Tipi (Karma Etkinlik)
        // 1: Standart Olmayan Ölçme Araçları (Görsel 2 & 3 referanslı)
        // 2: Uzunluk Tahmin Etme
        // 3: Metre/Santimetre Dönüştürme ve Problemler
        const category = Math.floor(Math.random() * 3) + 1;

        if (category === 0) {
          // --- KATEGORİ 0: CETVEL ÜZERİNDE ÖLÇÜM (GÖRSEL CETVEL) ---
          // Cetvel 0 - 20 cm arasında
          const start = Math.floor(Math.random() * 6); // 0, 1, 2, 3, 4, 5
          const length = Math.floor(Math.random() * 10) + 3; // 3 - 12 cm arası
          const end = start + length;

          const startPct = (start / 20) * 100;
          const lengthPct = (length / 20) * 100;

          // 0'dan 20'ye kadar çizgiler
          let ticksHTML = '';
          for (let i = 0; i <= 20; i++) {
            const leftPct = (i / 20) * 100;
            const is5 = i % 5 === 0;
            const tickHeight = is5 ? 'h-3.5 sm:h-4.5 bg-amber-950 w-[2px]' : 'h-2 sm:h-2.5 bg-amber-900/80 w-[1px]';
            ticksHTML += `
              <div style="left: ${leftPct}%;" class="absolute top-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div class="${tickHeight}"></div>
                <span class="text-[8px] sm:text-[9.5px] font-black ${is5 ? 'text-amber-950 scale-105' : 'text-amber-900/85'} mt-0.5 select-none leading-none">${i}</span>
              </div>
            `;
          }

          const wrapCetvelHTML = `
            <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
              <div class="bg-slate-900/95 border-2 border-amber-400 rounded-2xl p-2.5 sm:p-3.5 shadow-xl w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center gap-2.5">
                <div class="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span>📏 CETVEL İLE UZUNLUK ÖLÇME</span>
                </div>
                
                <div class="w-full bg-amber-100/95 border-2 border-amber-500 rounded-xl p-3 sm:p-4 shadow-inner flex flex-col gap-1">
                  {/* ORTAK ÖLÇÜM SKALA KAPSAYICISI (px-4 sm:px-6) */}
                  <div class="relative w-full px-4 sm:px-6 pt-1 pb-1">
                    
                    {/* 1. ÇUBUK VE REHBER ÇİZGİLER (Tam W Genişliğinde) */}
                    <div class="relative w-full h-8 sm:h-10 mb-2">
                      {/* Pembe Çubuk */}
                      <div 
                        style="left: ${startPct}%; width: ${lengthPct}%;" 
                        class="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 border-2 border-white rounded-md shadow-md flex items-center justify-center px-1 font-black z-10"
                      >
                        <span class="text-[10px] sm:text-xs font-black text-white drop-shadow-sm whitespace-nowrap overflow-hidden">ÇUBUK</span>
                      </div>

                      {/* Başlangıç Kırmızı Dikey Çizgisi (Cetvele Tam Uzanır) */}
                      <div 
                        style="left: ${startPct}%;" 
                        class="absolute top-0 -bottom-4 sm:-bottom-5 w-[2px] bg-rose-600 z-30 pointer-events-none transform -translate-x-1/2"
                      ></div>

                      {/* Bitiş Kırmızı Dikey Çizgisi (Cetvele Tam Uzanır) */}
                      <div 
                        style="left: ${startPct + lengthPct}%;" 
                        class="absolute top-0 -bottom-4 sm:-bottom-5 w-[2px] bg-rose-600 z-30 pointer-events-none transform -translate-x-1/2"
                      ></div>
                    </div>

                    {/* 2. AHŞAP CETVEL GÖVDESİ VE ÇİZGİLERİ */}
                    <div class="relative w-full h-11 sm:h-13 bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-400 border-2 border-amber-800 rounded-xl shadow-md select-none">
                      {/* Çizgiler Katmanı (border-2 offsetini sıfırlamak için -left-[2px] -right-[2px]) */}
                      <div class="absolute inset-y-0 -left-[2px] -right-[2px] pt-0.5">
                        ${ticksHTML}
                      </div>
                    </div>

                  </div>
                </div>

                <div class="bg-amber-400/20 border border-amber-400/50 rounded-lg p-2 text-center w-full">
                  <div class="text-xs sm:text-sm md:text-base font-black text-white leading-snug">
                    Cetvel üzerinde gösterilen çubuğun uzunluğu kaç <b>santimetredir (cm)</b>? <br/>
                    <span class="text-[10px] sm:text-xs font-bold text-amber-200">(Çubuğun bittiği sayıdan başladığı sayıyı çıkarabilirsin)</span>
                  </div>
                </div>
              </div>
            </div>
          `;

          const dogruCevap = `${length} cm`;
          // Yanıltıcı şıklar: end cm (en sık yapılan hata), length + 1, length - 1, start cm
          const wrongList = [
            `${end} cm`,
            `${length + 2} cm`,
            `${Math.max(1, length - 2)} cm`,
            `${start > 0 ? start : length + 3} cm`
          ].filter(v => v !== dogruCevap);

          const uniqueWrong = Array.from(new Set(wrongList)).slice(0, 3);
          while (uniqueWrong.length < 3) {
            const extra = `${length + uniqueWrong.length + 3} cm`;
            if (!uniqueWrong.includes(extra) && extra !== dogruCevap) {
              uniqueWrong.push(extra);
            }
          }

          return {
            question: "Cetvel üzerinde gösterilen çubuğun uzunluğu kaç santimetredir?",
            questionHTML: wrapCetvelHTML,
            correct: dogruCevap,
            wrong: uniqueWrong,
            isLong: false
          };

        } else if (category === 1) {
          // --- KATEGORİ 1: STANDART OLMAYAN ÖLÇME ARAÇLARI (REFERANS GÖRSELLER) ---
          const STANDART_OLMAYAN_SORULAR = [
            {
              soru: "Silgilerimizi hangi standart olmayan ölçme aracıyla ölçmemiz daha doğru ve kolay olur?",
              emoji: "🧽",
              baslik: "SİLGİ ÖLÇÜMÜ",
              dogru: "Parmak",
              yanlis: ["Adım", "Kulaç", "Ayak"]
            },
            {
              soru: "90 metre uzunluğundaki bir duvarı adım, karış veya ayak ölçme araçlarından hangisini kullanarak <b>daha çabuk</b> ölçebiliriz?",
              emoji: "🧱",
              baslik: "DUVAR ÖLÇÜMÜ",
              dogru: "Adım",
              yanlis: ["Karış", "Parmak", "Ayağın boyu"]
            },
            {
              soru: "Açılan iki kol arasındaki mesafeye verilen standart olmayan ölçme birimi adı nedir?",
              emoji: "🫂",
              baslik: "KOL AÇIKLIĞI",
              dogru: "Kulaç",
              yanlis: ["Karış", "Ayağın boyu", "Parmak"]
            },
            {
              soru: "Bir elin açılmış başparmağı ile küçük parmağı arasındaki mesafeye ne ad verilir?",
              emoji: "🖐️",
              baslik: "EL ÖLÇÜMÜ",
              dogru: "Karış",
              yanlis: ["Kulaç", "Adım", "Parmak"]
            },
            {
              soru: "Sınıfımızın uzunluğunu en az sayıda sayma yaparak <b>en hızlı</b> şekilde ölçmek için hangisini tercih etmeliyiz?",
              emoji: "🏫",
              baslik: "SINIF BOYU ÖLÇÜMÜ",
              dogru: "Adım",
              yanlis: ["Karış", "Parmak", "Kulaç"]
            },
            {
              soru: "Aşağıdakilerden hangisi <b>STANDART</b> uzunluk ölçme birimidir?",
              emoji: "📏",
              baslik: "STANDART BİRİM",
              dogru: "Metre (m)",
              yanlis: ["Karış", "Kulaç", "Adım"]
            }
          ];

          const item = STANDART_OLMAYAN_SORULAR[Math.floor(Math.random() * STANDART_OLMAYAN_SORULAR.length)];

          const wrapStandartOlmayanHTML = `
            <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
              <div class="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border-2 border-white rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-0.5 shrink-0">
                <div class="text-3xl sm:text-4xl filter drop-shadow-md">${item.emoji}</div>
                <div class="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider bg-white/80 px-3 py-0.5 rounded-full border border-amber-400/60 shadow-2xs">${item.baslik}</div>
              </div>
              <div class="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl p-2 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
                <div class="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span>📐 ÖLÇME ARAÇLARI</span>
                </div>
                <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-sm text-white">${item.soru}</div>
              </div>
            </div>
          `;

          return {
            question: item.soru.replace(/<b>/g, '').replace(/<\/b>/g, ''),
            questionHTML: wrapStandartOlmayanHTML,
            correct: item.dogru,
            wrong: item.yanlis,
            isLong: true
          };

        } else if (category === 2) {
          // --- KATEGORİ 2: UZUNLUK TAHMİN ETME ---
          const TAHMIN_NESNELERI = [
            {
              nesne: "Kurşun Kalem",
              emoji: "✏️",
              soru: "Yazı yazarken kullandığımız bir <b>Kurşun Kalemin</b> boyu yaklaşık kaç santimetre (cm) olabilir?",
              plainSoru: "Kurşun kalemin boyu yaklaşık kaç cm olabilir?",
              dogru: "15 cm",
              yanlis: ["1 cm", "100 cm", "5 metre"]
            },
            {
              nesne: "Okul Silgisi",
              emoji: "🧽",
              soru: "Çantamızdaki standart bir <b>Okul Silgisinin</b> boyu yaklaşık ne kadar olabilir?",
              plainSoru: "Okul silgisinin boyu yaklaşık ne kadar olabilir?",
              dogru: "5 cm",
              yanlis: ["1 cm", "50 cm", "2 metre"]
            },
            {
              nesne: "Yazı Tahtası",
              emoji: "📋",
              soru: "Sınıfımızdaki <b>Yazı Tahtasının</b> genişliği yaklaşık ne kadar olabilir?",
              plainSoru: "Yazı tahtasının genişliği yaklaşık ne kadar olabilir?",
              dogru: "3 metre",
              yanlis: ["3 cm", "50 metre", "500 cm"]
            },
            {
              nesne: "Matematik Ders Kitabı",
              emoji: "📘",
              soru: "Masa üstündeki <b>Matematik Ders Kitabının</b> boyu yaklaşık ne kadar olabilir?",
              plainSoru: "Matematik ders kitabının boyu yaklaşık ne kadar olabilir?",
              dogru: "30 cm",
              yanlis: ["2 cm", "200 cm", "10 metre"]
            },
            {
              nesne: "Sınıf Kapısı",
              emoji: "🚪",
              soru: "Sınıfımızın <b>Kapısının</b> yüksekliği yaklaşık ne kadar olabilir?",
              plainSoru: "Sınıf kapısının yüksekliği yaklaşık ne kadar olabilir?",
              dogru: "2 metre",
              yanlis: ["10 cm", "50 metre", "100 metre"]
            },
            {
              nesne: "Bahçe Ağacı",
              emoji: "🌳",
              soru: "Okul bahçesindeki büyük bir <b>Ağacın</b> boyu yaklaşık ne kadar olabilir?",
              plainSoru: "Bahçe ağacının boyu yaklaşık ne kadar olabilir?",
              dogru: "5 metre",
              yanlis: ["5 cm", "100 metre", "1000 metre"]
            },
            {
              nesne: "Ataş (Kağıt Tutucu)",
              emoji: "📎",
              soru: "Kağıtları tutturduğumuz bir <b>Ataşın</b> boyu yaklaşık ne kadar olabilir?",
              plainSoru: "Ataşın boyu yaklaşık ne kadar olabilir?",
              dogru: "3 cm",
              yanlis: ["50 cm", "2 metre", "10 metre"]
            },
            {
              nesne: "Cep Telefonu",
              emoji: "📱",
              soru: "Akıllı bir <b>Cep Telefonunun</b> boyu yaklaşık ne kadar olabilir?",
              plainSoru: "Cep telefonunun boyu yaklaşık ne kadar olabilir?",
              dogru: "15 cm",
              yanlis: ["1 cm", "100 cm", "10 metre"]
            },
            {
              nesne: "Ders Cetveli",
              emoji: "📏",
              soru: "Çantamızdaki standart ders <b>Cetvelinin</b> boyu yaklaşık ne kadar olabilir?",
              plainSoru: "Ders cetvelinin boyu yaklaşık ne kadar olabilir?",
              dogru: "30 cm",
              yanlis: ["1 cm", "10 metre", "100 metre"]
            }
          ];

          const item = TAHMIN_NESNELERI[Math.floor(Math.random() * TAHMIN_NESNELERI.length)];

          const wrapUzunlukTahminHTML = `
            <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
              <div class="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border-2 border-white rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-0.5 shrink-0">
                <div class="text-3xl sm:text-4xl filter drop-shadow-md">${item.emoji}</div>
                <div class="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider bg-white/80 px-3 py-0.5 rounded-full border border-amber-400/60 shadow-2xs">${item.nesne}</div>
              </div>
              <div class="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl p-2 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
                <div class="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
                  <span>📏 UZUNLUK TAHMİNİ</span>
                </div>
                <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-sm text-white">${item.soru}</div>
              </div>
            </div>
          `;

          return {
            question: item.plainSoru,
            questionHTML: wrapUzunlukTahminHTML,
            correct: item.dogru,
            wrong: item.yanlis,
            isLong: false
          };

        } else {
          // --- KATEGORİ 3: METRE/SANTİMETRE DÖNÜŞTÜRME VE PROBLEMLER ---
          const problemType = Math.floor(Math.random() * 4);

          if (problemType === 0) {
            // 1 metre = 100 cm dönüşüm sorusu
            const metre = Math.floor(Math.random() * 4) + 1; // 1, 2, 3, 4 metre
            const dogruCm = metre * 100;
            const wrapHTML = `
              <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
                <div class="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border-2 border-white rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-0.5 shrink-0">
                  <div class="text-3xl sm:text-4xl filter drop-shadow-md">📐</div>
                  <div class="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider bg-white/80 px-3 py-0.5 rounded-full border border-amber-400/60 shadow-2xs">BİRİM DÖNÜŞÜMÜ</div>
                </div>
                <div class="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl p-2.5 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
                  <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-sm text-white">
                    <b>${metre} metre</b> kaç santimetredir (cm)?
                  </div>
                </div>
              </div>
            `;
            return {
              question: `${metre} metre kaç santimetredir (cm)?`,
              questionHTML: wrapHTML,
              correct: `${dogruCm} cm`,
              wrong: [`${metre * 10} cm`, `${metre * 50} cm`, `${metre * 1000} cm`],
              isLong: false
            };
          } else if (problemType === 1) {
            // Kurdele kesme problemi
            const toplam = (Math.floor(Math.random() * 5) + 4) * 10; // 40, 50, 60, 70, 80 cm
            const kesilen = (Math.floor(Math.random() * 3) + 1) * 10; // 10, 20, 30 cm
            const kalan = toplam - kesilen;

            const wrapHTML = `
              <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
                <div class="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border-2 border-white rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-0.5 shrink-0">
                  <div class="text-3xl sm:text-4xl filter drop-shadow-md">🎀</div>
                  <div class="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider bg-white/80 px-3 py-0.5 rounded-full border border-amber-400/60 shadow-2xs">UZUNLUK PROBLEMİ</div>
                </div>
                <div class="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl p-2.5 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
                  <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-sm text-white">
                    <b>${toplam} cm</b> uzunluğundaki kurdelenin <b>${kesilen} cm'si</b> kesildi. Geriye kaç cm kurdele kaldı?
                  </div>
                </div>
              </div>
            `;
            return {
              question: `${toplam} cm uzunluğundaki kurdelenin ${kesilen} cm'si kesilirse geriye kaç cm kalır?`,
              questionHTML: wrapHTML,
              correct: `${kalan} cm`,
              wrong: [`${toplam + kesilen} cm`, `${kalan + 10} cm`, `${Math.max(5, kalan - 10)} cm`],
              isLong: false
            };
          } else if (problemType === 2) {
            // Metre ve cm toplam boy
            const cmEk = (Math.floor(Math.random() * 8) + 1) * 5 + 10; // 15, 20, 25 ... 50 cm
            const toplamCm = 100 + cmEk;

            const wrapHTML = `
              <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
                <div class="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border-2 border-white rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-0.5 shrink-0">
                  <div class="text-3xl sm:text-4xl filter drop-shadow-md">🧍</div>
                  <div class="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider bg-white/80 px-3 py-0.5 rounded-full border border-amber-400/60 shadow-2xs">BOY ÖLÇÜSÜ</div>
                </div>
                <div class="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl p-2.5 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
                  <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-sm text-white">
                    Ali'nin boyu <b>1 metre ${cmEk} cm'dir</b>. Ali'nin boyu toplam kaç santimetredir?
                  </div>
                </div>
              </div>
            `;
            return {
              question: `Ali'nin boyu 1 metre ${cmEk} cm'dir. Ali'nin boyu toplam kaç santimetredir?`,
              questionHTML: wrapHTML,
              correct: `${toplamCm} cm`,
              wrong: [`${cmEk + 10} cm`, `${toplamCm + 20} cm`, `${toplamCm - 10} cm`],
              isLong: false
            };
          } else {
            // 1 Metrelik kumaştan kesilen
            const kesilen = (Math.floor(Math.random() * 6) + 2) * 10; // 20, 30, 40, 50, 60, 70 cm
            const kalan = 100 - kesilen;

            const wrapHTML = `
              <div class="w-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
                <div class="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 text-slate-950 border-2 border-white rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center gap-0.5 shrink-0">
                  <div class="text-3xl sm:text-4xl filter drop-shadow-md">🧵</div>
                  <div class="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider bg-white/80 px-3 py-0.5 rounded-full border border-amber-400/60 shadow-2xs">KUMAŞ PROBLEMİ</div>
                </div>
                <div class="bg-slate-900/90 text-white border-2 border-amber-400 rounded-xl p-2.5 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
                  <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-sm text-white">
                    <b>1 metrelik (100 cm)</b> bir kumaşın <b>${kesilen} cm'si</b> satıldı. Geriye kaç cm kumaş kaldı?
                  </div>
                </div>
              </div>
            `;
            return {
              question: `1 metrelik kumaşın ${kesilen} cm'si satıldı. Geriye kaç cm kumaş kaldı?`,
              questionHTML: wrapHTML,
              correct: `${kalan} cm`,
              wrong: [`${kesilen} cm`, `${kalan + 10} cm`, `${Math.max(10, kalan - 20)} cm`],
              isLong: false
            };
          }
        }
      }
    },
    tartma_olcme: {
      title: "Ağırlık Ölçme",
      desc: "Kütleleri ölçme, Kilogram (kg) kavramı ve nesneleri karşılaştırma.",
      generate: () => {
        const t = Math.floor(Math.random() * 3);
        if (t === 0) {
          return {
            question: "Kütle (ağırlık) ölçüm birimi aşağıdakilerden hangisidir?",
            correct: "Kilogram (kg)",
            wrong: ["Litre (L)", "Metre (m)", "Saat"],
            isLong: true
          };
        } else if (t === 1) {
          const meyveler = ["elma", "karpuz", "portakal", "çilek", "muz", "şeftali", "kavun", "üzüm", "limon", "ananas", "mandalina", "armut", "erik"];
          const m1 = meyveler[Math.floor(Math.random() * meyveler.length)];
          let m2 = meyveler[Math.floor(Math.random() * meyveler.length)];
          while (m2 === m1) m2 = meyveler[Math.floor(Math.random() * meyveler.length)];

          const k1 = Math.floor(Math.random() * 5) + 2;
          const k2 = Math.floor(Math.random() * 5) + 2;
          const toplam = k1 + k2;
          return {
            question: `${k1} kg ${m1} ile ${k2} kg ${m2} toplam kaç kg eder?`,
            correct: toplam,
            wrong: benzersizYanlislar(toplam, [toplam + 2, toplam - 1, k1 * k2, toplam + 5], 1),
            isLong: false
          };
        } else {
          const meyveler = ["elma", "çilek", "muz", "portakal", "şeftali", "karpuz", "kavun", "üzüm", "mandalina"];
          const m = meyveler[Math.floor(Math.random() * meyveler.length)];
          const ogrenci = getRastgeleOgrenci();
          const k1 = Math.floor(Math.random() * 6) + 5;
          const k2 = Math.floor(Math.random() * 4) + 1;
          const kalan = k1 - k2;
          const mAyrilma = getNesneAyrilma(m);
          return {
            question: `${ogrenci} pazardan ${k1} kg ${m} aldı. Ailesi ile birlikte ${k2} kg ${mAyrilma} yedi. Geride kaç kg ${m} kaldı?`,
            correct: kalan,
            wrong: benzersizYanlislar(kalan, [k1 + k2, kalan + 2, kalan - 1, k2], 1),
            isLong: true
          };
        }
      }
    },
    sivi_olcme: {
      title: "Sıvı Ölçme",
      desc: "Sıvıları bardak, sürahi, kova gibi birimlerle ölçme.",
      generate: () => {
        const b = Math.floor(Math.random() * 4) + 2;
        const s = b * 4;
        return {
          question: `1 sürahi 4 bardak su almaktadır. Buna göre ${b} sürahi kaç bardak su alır?`,
          correct: s,
          wrong: benzersizYanlislar(s, [s + 2, s - 2, b + 4, s + 4], 1),
          isLong: true
        };
      }
    },
    veri_grafik: {
      title: "Veri İşleme (Nesne Grafiği)",
      desc: "3 nesneli nesne grafiklerini okuma, sayma ve karşılaştırma soruları.",
      generate: () => {
        const temalar = [
          {
            baslik: "Sevilen Meyveler",
            birim: "öğrenci",
            nesneler: [
              { ad: "Elma", simge: "🍎" },
              { ad: "Muz", simge: "🍌" },
              { ad: "Çilek", simge: "🍓" }
            ]
          },
          {
            baslik: "Yaz Meyveleri",
            birim: "kilo",
            nesneler: [
              { ad: "Karpuz", simge: "🍉" },
              { ad: "Şeftali", simge: "🍑" },
              { ad: "Kiraz", simge: "🍒" }
            ]
          },
          {
            baslik: "Manavdaki Meyveler",
            birim: "kasa",
            nesneler: [
              { ad: "Portakal", simge: "🍊" },
              { ad: "Üzüm", simge: "🍇" },
              { ad: "Ananas", simge: "🍍" }
            ]
          },
          {
            baslik: "Oyun Alanındaki Oyuncaklar",
            birim: "oyuncak",
            nesneler: [
              { ad: "Araba", simge: "🚗" },
              { ad: "Bebek", simge: "🪆" },
              { ad: "Top", simge: "⚽" }
            ]
          },
          {
            baslik: "Sınıftaki Balon Sayıları",
            birim: "balon",
            nesneler: [
              { ad: "Kırmızı Balon", simge: "🔴" },
              { ad: "Mavi Balon", simge: "🔵" },
              { ad: "Sarı Balon", simge: "🟡" }
            ]
          },
          {
            baslik: "Çiftlikteki Hayvanlar",
            birim: "hayvan",
            nesneler: [
              { ad: "İnek", simge: "🐮" },
              { ad: "Koyun", simge: "🐑" },
              { ad: "Tavuk", simge: "🐔" }
            ]
          },
          {
            baslik: "En Sevilen Sporlar",
            birim: "öğrenci",
            nesneler: [
              { ad: "Futbol", simge: "⚽" },
              { ad: "Basketbol", simge: "🏀" },
              { ad: "Yüzme", simge: "🏊" }
            ]
          },
          {
            baslik: "Kırtasiye Malzemeleri",
            birim: "malzeme",
            nesneler: [
              { ad: "Kalem", simge: "✏️" },
              { ad: "Defter", simge: "📖" },
              { ad: "Cetvel", simge: "📐" }
            ]
          }
        ];

        // 1 tema seç
        const tema = temalar[Math.floor(Math.random() * temalar.length)];

        // 3 nesne için benzersiz rastgele sayılar üret (2 ile 7 arasında)
        const olasiSayilar = [2, 3, 4, 5, 6, 7];
        const secilenSayilar = rastgeleSec(olasiSayilar, 3) as number[];

        const grafikData = tema.nesneler.map((item, idx) => ({
          ...item,
          count: secilenSayilar[idx]
        }));

        // Kat çarpanı: Her nesne 1 veya 2 birim temsil eder
        const factor = Math.random() < 0.25 ? 2 : 1;

        // Görsel 3 Nesneli Grafik HTML Tasarımı
        const grafikHTML = `
          <div class="bg-slate-950/75 backdrop-blur-xs border border-amber-300/80 rounded-xl p-2 sm:p-3 text-left shadow-lg w-full max-w-sm sm:max-w-md mx-auto flex flex-col justify-center shrink-0 my-auto">
            <div class="flex items-center justify-between border-b border-amber-300/40 pb-1 mb-1.5">
              <span class="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                📊 NESNE GRAFİĞİ: ${tema.baslik}
              </span>
            </div>
            <div class="space-y-1 sm:space-y-1.5">
              ${grafikData.map(item => `
                <div class="flex items-center justify-between bg-black/60 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 border border-white/15 shadow-2xs">
                  <span class="font-black text-xs sm:text-sm text-amber-200 w-22 sm:w-28 shrink-0 flex items-center gap-1.5">
                    <span class="text-sm sm:text-lg">${item.simge}</span>
                    <span class="truncate">${item.ad}</span>
                  </span>
                  <div class="flex items-center gap-1 flex-wrap justify-end flex-1">
                    ${Array.from({ length: item.count }).map(() => `<span class="text-base sm:text-xl drop-shadow-xs">${item.simge}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="mt-1.5 pt-1 border-t border-white/20 text-[10px] sm:text-xs text-amber-200 font-bold text-center bg-amber-400/20 rounded-md py-0.5 px-2">
              📌 Not: Grafikteki her 1 nesne <b>${factor} ${tema.birim}</b> göstermektedir.
            </div>
          </div>
        `;

        // Helper function for prominent Question Box Banner
        const wrapQuestionBanner = (metin: string) => `
          <div class="w-full h-full flex flex-col justify-center items-center gap-1.5 sm:gap-2 my-auto">
            ${grafikHTML}
            <div class="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-slate-950 border-2 border-white rounded-xl p-2 shadow-lg text-center w-full max-w-sm sm:max-w-md mx-auto shrink-0">
              <div class="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-widest">❓ SORU</div>
              <div class="text-xs sm:text-sm md:text-base font-black leading-snug drop-shadow-2xs text-slate-950">${metin}</div>
            </div>
          </div>
        `;

        // 5 Soru Tipinden Birini Seç
        const soruTuru = Math.floor(Math.random() * 5);

        if (soruTuru === 0) {
          // Tip 1: Belirli bir nesnenin sayısını sorma
          const hedefItem = grafikData[Math.floor(Math.random() * grafikData.length)];
          const dogruCevap = hedefItem.count * factor;
          const wrong = benzersizYanlislar(dogruCevap, [dogruCevap + factor, dogruCevap - factor, dogruCevap + 2 * factor, dogruCevap + 1], 0);

          const soruMetni = `Grafiğe göre <b>${hedefItem.ad} ${hedefItem.simge}</b> sayısı kaçtır?`;
          return {
            question: `Grafiğe göre ${hedefItem.ad} sayısı kaçtır?`,
            questionHTML: wrapQuestionBanner(soruMetni),
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        } else if (soruTuru === 1) {
          // Tip 2: En çok olan nesneyi sorma
          const maxItem = [...grafikData].sort((a, b) => b.count - a.count)[0];
          const dogruCevap = `${maxItem.ad} ${maxItem.simge}`;
          const wrong = grafikData.filter(i => i.ad !== maxItem.ad).map(i => `${i.ad} ${i.simge}`);
          if (wrong.length < 3) wrong.push("Hepsi Eşittir");

          const soruMetni = `Nesne grafiğine göre sayısı <b>EN FAZLA (en çok)</b> olan nesne hangisidir?`;
          return {
            question: `Nesne grafiğine göre sayısı EN FAZLA olan nesne hangisidir?`,
            questionHTML: wrapQuestionBanner(soruMetni),
            correct: dogruCevap,
            wrong,
            isLong: true
          };
        } else if (soruTuru === 2) {
          // Tip 3: En az olan nesneyi sorma
          const minItem = [...grafikData].sort((a, b) => a.count - b.count)[0];
          const dogruCevap = `${minItem.ad} ${minItem.simge}`;
          const wrong = grafikData.filter(i => i.ad !== minItem.ad).map(i => `${i.ad} ${i.simge}`);
          if (wrong.length < 3) wrong.push("Hepsi Eşittir");

          const soruMetni = `Nesne grafiğine göre sayısı <b>EN AZ</b> olan nesne hangisidir?`;
          return {
            question: `Nesne grafiğine göre sayısı EN AZ olan nesne hangisidir?`,
            questionHTML: wrapQuestionBanner(soruMetni),
            correct: dogruCevap,
            wrong,
            isLong: true
          };
        } else if (soruTuru === 3) {
          // Tip 4: Toplam miktar sorma
          const toplamNesne = grafikData.reduce((acc, curr) => acc + curr.count, 0);
          const dogruCevap = toplamNesne * factor;
          const wrong = benzersizYanlislar(dogruCevap, [dogruCevap + factor, dogruCevap - factor, dogruCevap + 2 * factor, dogruCevap - 2 * factor], 1);

          const soruMetni = `Grafikte <b>TOPLAM</b> kaç ${tema.birim} vardır?`;
          return {
            question: `Grafikte TOPLAM kaç ${tema.birim} vardır?`,
            questionHTML: wrapQuestionBanner(soruMetni),
            correct: dogruCevap,
            wrong,
            isLong: false
          };
        } else {
          // Tip 5: İki nesne arasındaki farkı sorma
          const sorted = [...grafikData].sort((a, b) => b.count - a.count);
          const itemFazla = sorted[0];
          const itemAz = sorted[1];
          const fark = (itemFazla.count - itemAz.count) * factor;
          const wrong = benzersizYanlislar(fark, [fark + 1, fark + 2, itemFazla.count * factor, itemAz.count * factor], 0);

          const soruMetni = `<b>${itemFazla.ad} ${itemFazla.simge}</b> sayısı, <b>${itemAz.ad} ${itemAz.simge}</b> sayısından kaç FAZLADIR?`;
          return {
            question: `${itemFazla.ad} sayısı, ${itemAz.ad} sayısından kaç fazladır?`,
            questionHTML: wrapQuestionBanner(soruMetni),
            correct: fark,
            wrong,
            isLong: false
          };
        }
      }
    }
  };

  const generateUniqueQuestion = (targetTopicKey?: string): QuestionData => {
    const topicToUse = targetTopicKey || currentTopic;
    const topicConfig = topics[topicToUse] || topics['nesne_sayisi'];
    let data: QuestionData;
    let imza: string;
    let deneme = 0;
    do {
      data = topicConfig.generate();
      imza = data.signature || `${JSON.stringify(data.question)}||${JSON.stringify(data.correct)}`;
      deneme++;
    } while (askedQuestions.includes(imza) && deneme < 40);

    setAskedQuestions(prev => [...prev, imza]);
    return data;
  };

  const generateQuestionForPlayer = (targetTopicKey: string, askedList: string[]) => {
    const topicToUse = targetTopicKey || currentTopic;
    const topicConfig = topics[topicToUse] || topics['nesne_sayisi'];
    let data: QuestionData;
    let imza: string;
    let deneme = 0;
    do {
      data = topicConfig.generate();
      imza = data.signature || `${JSON.stringify(data.question)}||${JSON.stringify(data.correct)}`;
      deneme++;
    } while (askedList.includes(imza) && deneme < 40);

    const rawOptions = [data.correct, ...data.wrong];
    const shuffled = [...rawOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return { data, signature: imza, shuffledOptions: shuffled };
  };

  const setQuestionAndPrepareOptions = (data: QuestionData) => {
    setCurrentQuestionData(data);
    const rawOptions = [data.correct, ...data.wrong];
    // Fisher-Yates shuffle to randomly order options ONCE per question
    const shuffled = [...rawOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledOptions(shuffled);
  };

  const nextQuestion = (targetTopicKey?: string) => {
    setSelectedOption(null);
    setFeedbackState('none');
    const data = generateUniqueQuestion(targetTopicKey);
    setQuestionAndPrepareOptions(data);
  };

  const selectTopicAndStart = (topicKey: string) => {
    if (topicKey !== currentTopic) {
      playFarkliLvlSound();
    }
    setCurrentTopic(topicKey);
    setHasHad3StreakInSession(false);
    setHasFailedAfter3Streak(false);
    setOpenedTopics(prev => {
      if (!prev.includes(topicKey)) {
        const next = [...prev, topicKey];
        localStorage.setItem('openedTopics_v1', JSON.stringify(next));
        return next;
      }
      return prev;
    });
    setScore(0);
    setLives(3);
    setStreak(0);
    setAskedQuestions([]);
    setSelectedOption(null);
    setFeedbackState('none');
    setDuelWinnerIndex(null);
    
    // Initialize Players based on playerCountMode (1, 2, or 3)
    const initialPlayers: PlayerData[] = [];
    const playerConfigs = [
      {
        id: 1,
        name: "1. GRUP",
        avatar: "🥇 1. GRUP",
        colorTheme: {
          bg: "from-blue-950/90 via-indigo-950/90 to-slate-950/90",
          border: "border-blue-400",
          text: "text-blue-200",
          badge: "bg-blue-600 text-white",
          headerBg: "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700"
        }
      },
      {
        id: 2,
        name: "2. GRUP",
        avatar: "🥈 2. GRUP",
        colorTheme: {
          bg: "from-rose-950/90 via-red-950/90 to-slate-950/90",
          border: "border-rose-400",
          text: "text-rose-200",
          badge: "bg-rose-600 text-white",
          headerBg: "bg-gradient-to-r from-rose-600 via-red-600 to-amber-700"
        }
      },
      {
        id: 3,
        name: "3. GRUP",
        avatar: "🥉 3. GRUP",
        colorTheme: {
          bg: "from-emerald-950/90 via-teal-950/90 to-slate-950/90",
          border: "border-emerald-400",
          text: "text-emerald-200",
          badge: "bg-emerald-600 text-white",
          headerBg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700"
        }
      }
    ];

    let cumulativeAsked: string[] = [];
    for (let i = 0; i < playerCountMode; i++) {
      const qRes = generateQuestionForPlayer(topicKey, cumulativeAsked);
      cumulativeAsked.push(qRes.signature);
      initialPlayers.push({
        ...playerConfigs[i],
        score: 0,
        lives: 3,
        streak: 0,
        currentQuestionData: qRes.data,
        shuffledOptions: qRes.shuffledOptions,
        selectedOption: null,
        feedbackState: 'none',
        askedQuestions: [qRes.signature]
      });
    }

    setPlayers(initialPlayers);

    // Single player setup
    if (playerCountMode === 1 && initialPlayers[0]?.currentQuestionData) {
      setCurrentQuestionData(initialPlayers[0].currentQuestionData);
      setShuffledOptions(initialPlayers[0].shuffledOptions);
    }

    setGameState('playing');
  };

  const kaydetGrupIstatistik = (pIndex: number, topicId: string, dogruMu: boolean) => {
    try {
      const groupId = `grup${pIndex + 1}`;
      const raw = localStorage.getItem('mathGameGroupStats_v1');
      let currentGroupStats: GroupStatsRecord = raw ? JSON.parse(raw) : DEFAULT_GROUP_STATS;

      if (!currentGroupStats[groupId]) {
        const names = ['1. GRUP', '2. GRUP', '3. GRUP'];
        const badges = ['🥇', '🥈', '🥉'];
        const colors = ['blue', 'rose', 'emerald'];
        currentGroupStats[groupId] = {
          id: groupId,
          name: names[pIndex] || `${pIndex + 1}. GRUP`,
          badge: badges[pIndex] || '⭐',
          color: colors[pIndex] || 'amber',
          dogru: 0,
          yanlis: 0,
          wins: 0,
          topicStats: {}
        };
      }

      if (!currentGroupStats[groupId].topicStats) {
        currentGroupStats[groupId].topicStats = {};
      }

      if (!currentGroupStats[groupId].topicStats[topicId]) {
        currentGroupStats[groupId].topicStats[topicId] = { dogru: 0, yanlis: 0 };
      }

      if (dogruMu) {
        currentGroupStats[groupId].dogru = (currentGroupStats[groupId].dogru || 0) + 1;
        currentGroupStats[groupId].topicStats[topicId].dogru += 1;
      } else {
        currentGroupStats[groupId].yanlis = (currentGroupStats[groupId].yanlis || 0) + 1;
        currentGroupStats[groupId].topicStats[topicId].yanlis += 1;
      }

      localStorage.setItem('mathGameGroupStats_v1', JSON.stringify(currentGroupStats));
      setGroupStatsData({ ...currentGroupStats });
    } catch (e) {
      console.error('Group stat save error:', e);
    }
  };

  const kaydetGrupGalibiyet = (winnerIdx: number) => {
    try {
      const groupId = `grup${winnerIdx + 1}`;
      const raw = localStorage.getItem('mathGameGroupStats_v1');
      const currentGroupStats: GroupStatsRecord = raw ? JSON.parse(raw) : DEFAULT_GROUP_STATS;

      if (currentGroupStats[groupId]) {
        currentGroupStats[groupId].wins = (currentGroupStats[groupId].wins || 0) + 1;
        localStorage.setItem('mathGameGroupStats_v1', JSON.stringify(currentGroupStats));
        setGroupStatsData({ ...currentGroupStats });
      }
    } catch (e) {
      console.error('Group win save error:', e);
    }
  };

  const kaydetIstatistik = (topicId: string, dogruMu: boolean) => {
    try {
      const stats = JSON.parse(localStorage.getItem('mathGameStats_v1') || '{}') as Record<string, StatRecord>;
      if (!stats[topicId]) stats[topicId] = { dogru: 0, yanlis: 0 };
      
      const oldLevelInfo = getPlayerLevelInfo(stats, badgeCounts, unlockedBadges);

      if (dogruMu) stats[topicId].dogru++;
      else stats[topicId].yanlis++;

      const newLevelInfo = getPlayerLevelInfo(stats, badgeCounts, unlockedBadges);
      if (dogruMu && newLevelInfo.currentLevel > oldLevelInfo.currentLevel) {
        playNextLvlSound();
      }

      localStorage.setItem('mathGameStats_v1', JSON.stringify(stats));
      setStatsData(stats);
    } catch {
      // Ignore
    }
  };

  const handleAnswer = (option: string | number) => {
    if (feedbackState !== 'none' || !currentQuestionData) return;

    setSelectedOption(option);
    const isCorrect = option === currentQuestionData.correct;
    kaydetIstatistik(currentTopic, isCorrect);

    if (isCorrect) {
      playCorrectSound();
      setFeedbackState('correct');
      setScore(prev => prev + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);

      incrementBadgeCount('ilk_dogru');
      if (newStreak % 3 === 0) {
        incrementBadgeCount('seri_3');
      }
      if (newStreak % 5 === 0) {
        incrementBadgeCount('seri_5');
      }
      if (newStreak % 7 === 0) {
        incrementBadgeCount('seri_7');
      }

      if (newStreak === 3) {
        triggerFireworks();
        playParaAndTekSound();
        if (hasFailedAfter3Streak) {
          setHasFailedAfter3Streak(false);
        } else {
          setHasHad3StreakInSession(true);
        }
      } else if (newStreak === 5) {
        triggerFireworks();
        playCoinAndTekSound();
      } else if (newStreak === 7) {
        triggerFireworks();
        playParaAndTekSound();
      }

      const nextScore = score + 1;
      checkAndUnlockBadges(statsData, newStreak, nextScore, lives, nextScore >= 10);

      if (nextScore >= 10) {
        // Level tamamlandığında dtt.mp3 sesini hemen çalıştır
        playDttSound();

        incrementBadgeCount('tam_puan');
        if (lives === 3) {
          incrementBadgeCount('kusursuz');
        }

        // Increment topic win count (repeat success counter)
        const prevWins = topicWinCounts[currentTopic] || 0;
        const newWins = prevWins + 1;
        const updatedTopicWins = { ...topicWinCounts, [currentTopic]: newWins };
        try {
          localStorage.setItem('mathGameTopicWins_v1', JSON.stringify(updatedTopicWins));
        } catch {
          // Ignore
        }
        setTopicWinCounts(updatedTopicWins);

        // Success repeated for the 3rd time (or multiples of 3)
        const isThreeStarWin = newWins >= 3 || newWins % 3 === 0;

        setTimeout(() => {
          playWinSound();
          playDttSound();
          checkAndUnlockBadges(statsData, newStreak, nextScore, lives, true);
          setGameResult({
            reason: 'puan',
            score: nextScore,
            livesLeft: lives,
            streak: newStreak,
            topicWinCount: newWins,
            isThreeStarWin
          });
          setGameState('gameover');
        }, 800);
        return;
      }
    } else {
      playWrongSound();
      setFeedbackState('wrong');
      setLives(prev => prev - 1);
      if (hasHad3StreakInSession) {
        setHasFailedAfter3Streak(true);
      }
      setStreak(0);

      const nextLives = lives - 1;
      if (nextLives <= 0) {
        setTimeout(() => {
          setGameResult({ reason: 'can', score, livesLeft: 0 });
          setGameState('gameover');
        }, 800);
        return;
      }
    }

    setTimeout(() => {
      nextQuestion(currentTopic);
    }, 900);
  };

  const handlePlayerAnswer = (pIndex: number, option: string | number) => {
    if (playerCountMode === 1) {
      handleAnswer(option);
      return;
    }

    if (pIndex >= players.length) return;
    const targetPlayer = players[pIndex];
    if (targetPlayer.feedbackState !== 'none' || !targetPlayer.currentQuestionData || targetPlayer.lives <= 0) return;

    const isCorrect = option === targetPlayer.currentQuestionData.correct;
    kaydetIstatistik(currentTopic, isCorrect);
    kaydetGrupIstatistik(pIndex, currentTopic, isCorrect);

    if (isCorrect) {
      playCorrectSound();
      const newScore = targetPlayer.score + 1;
      const newStreak = targetPlayer.streak + 1;

      setPlayers(prev => {
        const updated = [...prev];
        if (pIndex < updated.length) {
          updated[pIndex] = {
            ...updated[pIndex],
            score: newScore,
            streak: newStreak,
            selectedOption: option,
            feedbackState: 'correct'
          };
        }
        return updated;
      });

      if (newScore >= 10) {
        playDttSound();
        playWinSound();
        triggerFireworks();
        setDuelWinnerIndex(pIndex);
        kaydetGrupGalibiyet(pIndex);
        setTimeout(() => {
          setGameResult({
            reason: 'puan',
            score: newScore,
            livesLeft: targetPlayer.lives,
            streak: newStreak
          });
          setGameState('gameover');
        }, 700);
        return;
      }

      setTimeout(() => {
        setPlayers(prev => {
          if (pIndex >= prev.length) return prev;
          const currentP = prev[pIndex];
          const qRes = generateQuestionForPlayer(currentTopic, currentP.askedQuestions);
          const updated = [...prev];
          updated[pIndex] = {
            ...currentP,
            currentQuestionData: qRes.data,
            shuffledOptions: qRes.shuffledOptions,
            selectedOption: null,
            feedbackState: 'none',
            askedQuestions: [...currentP.askedQuestions, qRes.signature]
          };
          return updated;
        });
      }, 800);

    } else {
      playWrongSound();
      const newLives = targetPlayer.lives - 1;

      setPlayers(prev => {
        const updated = [...prev];
        if (pIndex < updated.length) {
          updated[pIndex] = {
            ...updated[pIndex],
            lives: newLives,
            streak: 0,
            selectedOption: option,
            feedbackState: 'wrong'
          };
        }
        return updated;
      });

      setTimeout(() => {
        setPlayers(prev => {
          const alivePlayers = prev.filter(p => p.lives > 0);
          if (alivePlayers.length <= 1) {
            let winnerIdx = 0;
            if (alivePlayers.length === 1) {
              winnerIdx = prev.findIndex(p => p.id === alivePlayers[0].id);
            } else {
              const sorted = [...prev].sort((a, b) => b.score - a.score);
              winnerIdx = prev.findIndex(p => p.id === sorted[0].id);
            }
            if (winnerIdx < 0) winnerIdx = 0;

            playDttSound();
            playWinSound();
            triggerFireworks();
            setDuelWinnerIndex(winnerIdx);
            kaydetGrupGalibiyet(winnerIdx);
            setGameResult({
              reason: 'can',
              score: prev[winnerIdx]?.score || 0,
              livesLeft: prev[winnerIdx]?.lives || 0
            });
            setGameState('gameover');
            return prev;
          }

          if (newLives > 0 && pIndex < prev.length) {
            const currentP = prev[pIndex];
            const qRes = generateQuestionForPlayer(currentTopic, currentP.askedQuestions);
            const updated = [...prev];
            updated[pIndex] = {
              ...currentP,
              currentQuestionData: qRes.data,
              shuffledOptions: qRes.shuffledOptions,
              selectedOption: null,
              feedbackState: 'none',
              askedQuestions: [...currentP.askedQuestions, qRes.signature]
            };
            return updated;
          }
          return prev;
        });
      }, 800);
    }
  };

  const optionsList = shuffledOptions;

  return (
    <div className="relative h-[100dvh] bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50/70 dark:from-[#0B132B] dark:via-blue-950 dark:to-slate-950 text-blue-950 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden select-none">
      {/* SUBTLE POSITIVE BACKGROUND IMAGE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/intro2.png" 
          alt="Arka Plan Görseli"
          referrerPolicy="no-referrer"
          style={{ opacity: 1 }}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-300"
        />
      </div>

      {/* GLOBAL HEADER BAR - 3D CARTOON GAME UI STYLE WITH SYMMETRICAL, EVENLY SPACED BUTTONS */}
      <header className="bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md border-b-3 border-yellow-400 dark:border-yellow-500/80 px-2 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-2.5 shadow-lg z-30 shrink-0 w-full max-w-full overflow-hidden">
        {/* LEFT: ANASAYFA BUTTON */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={() => {
              setGameState('welcome');
              setSelectedCategoryId(null);
              setShowTopicModal(false);
              setShowStatsModal(false);
              setShow3DLab(false);
            }}
            title="Ana Sayfaya Dön"
            className="group relative w-[95px] h-[33px] sm:w-[115px] sm:h-[40px] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/buton.png')` }}
            />
            <span className="relative z-10 text-white font-black text-[10px] sm:text-xs tracking-wider [text-shadow:0_2px_0_#000,0_3px_6px_rgba(0,0,0,0.8)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase select-none -translate-y-[1px]">
              ANA SAYFA
            </span>
          </button>
        </div>

        {/* 5 EVENLY SPACED ICON BUTTONS (GERİ, ÇEVİR, SES, İSTATİSTİK, KARANLIK) */}
        <div className="flex-1 flex items-center justify-end sm:justify-center gap-0.5 xs:gap-1 sm:gap-2 shrink min-w-0">
          {/* 1. GERİ */}
          <button
            onClick={() => {
              if (show3DLab) {
                setShow3DLab(false);
                return;
              }
              if (showStatsModal) {
                setShowStatsModal(false);
                return;
              }
              if (showTopicModal) {
                setShowTopicModal(false);
                return;
              }
              if (gameState === 'playing') {
                setGameState('welcome');
                return;
              }
              if (selectedCategoryId !== null) {
                setSelectedCategoryId(null);
                return;
              }
            }}
            title="Bir önceki menüye dön"
            className="relative group w-[40px] h-[31px] xs:w-[45px] xs:h-[35px] sm:w-[54px] sm:h-[42px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/geril.png')` }}
            />
          </button>

          {/* 2. EKRAN ÇEVİR */}
          <button
            onClick={toggleOrientation}
            className="relative group w-[40px] h-[31px] xs:w-[45px] xs:h-[35px] sm:w-[54px] sm:h-[42px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
            title={isLandscape ? "Dikey Moda Geç (Portrait)" : "Yatay Moda Geç (Landscape)"}
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/cvrl.png')` }}
            />
          </button>

          {/* 3. SES */}
          <button
            onClick={toggleSound}
            className={`relative group w-[40px] h-[31px] xs:w-[45px] xs:h-[35px] sm:w-[54px] sm:h-[42px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0 ${!soundEnabled ? 'opacity-40 grayscale' : ''}`}
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/sesl.png')` }}
            />
            {!soundEnabled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-5 h-0.5 bg-red-600/90 rotate-45 rounded-full shadow-xs" />
              </div>
            )}
          </button>

          {/* 4. İSTATİSTİK */}
          <button
            onClick={() => {
              try {
                setStatsData(JSON.parse(localStorage.getItem('mathGameStats_v1') || '{}'));
              } catch {}
              setShowStatsModal(true);
            }}
            className="relative group w-[40px] h-[31px] xs:w-[45px] xs:h-[35px] sm:w-[54px] sm:h-[42px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
            title="İlerleme ve İstatistikler"
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/istl.png')` }}
            />
          </button>

          {/* 5. KARANLIK MOD */}
          <button
            onClick={toggleTheme}
            className="relative group w-[40px] h-[31px] xs:w-[45px] xs:h-[35px] sm:w-[54px] sm:h-[42px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] shrink-0"
            title="Karanlık / Aydınlık Mod"
          >
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url('/krnl.png')` }}
            />
          </button>
        </div>
      </header>

      {/* SCREEN ORIENTATION TOAST BADGE */}
      {showOrientationToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-500 text-white font-black px-4 py-2 rounded-full border-2 border-white shadow-2xl animate-bounce flex items-center gap-2 text-xs sm:text-sm">
          <GlossyScreenRotateIcon isLandscape={isLandscape} size={20} />
          <span>{showOrientationToast}</span>
        </div>
      )}

      {/* MAIN SCREEN ROUTING - 4 RECTANGULAR CARDS OR SUB-TOPIC BUTTON CARDS (NO ACCORDION) */}
      {gameState === 'welcome' && (
        <div className="flex-1 flex flex-col items-center justify-start pt-0.5 sm:pt-1 pb-2 sm:pb-4 px-2 sm:px-4 md:px-6 overflow-y-auto no-scrollbar min-h-0 w-full">
          {selectedCategoryId === null ? (
            /* 4 MAIN CATEGORY CARDS IN A 2x2 GRID */
            <div className="max-w-4xl w-full mx-auto flex flex-col items-center py-0">
              {/* COMPACT TITLE BADGE */}
              <div className="mb-0.5 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-blue-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-md border-2 border-white drop-shadow-sm">
                  🎮 2. SINIF MATEMATİK OYUNU
                </span>
              </div>

              {/* 1 OYUNCU, 2 OYUNCU DÜELLO, 3 OYUNCU DÜELLO SEÇİM ALANI */}
              <div className="w-full max-w-2xl mx-auto mb-0.5 sm:mb-1 flex items-center justify-center gap-1 sm:gap-2 z-20">
                <button
                  type="button"
                  onClick={() => {
                    setPlayerCountMode(1);
                    playMp3('/coin.mp3');
                  }}
                  className={`flex-1 py-1 sm:py-1.5 px-1 sm:px-2.5 rounded-lg sm:rounded-xl font-black text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider transition-all transform flex items-center justify-center gap-1 cursor-pointer shadow-md border-2 whitespace-nowrap ${
                    playerCountMode === 1
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-blue-950 border-white shadow-[0_3px_10px_rgba(245,158,11,0.6)] scale-105 ring-2 ring-amber-300'
                      : 'bg-slate-800/85 text-white/80 border-slate-600 hover:bg-slate-700/90'
                  }`}
                >
                  <span className="text-xs sm:text-sm shrink-0">👤</span>
                  <span className="whitespace-nowrap">1 OYUNCU</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlayerCountMode(2);
                    playMp3('/coin.mp3');
                  }}
                  className={`flex-1 py-1 sm:py-1.5 px-1 sm:px-2.5 rounded-lg sm:rounded-xl font-black text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider transition-all transform flex items-center justify-center gap-1 cursor-pointer shadow-md border-2 whitespace-nowrap ${
                    playerCountMode === 2
                      ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white border-white shadow-[0_3px_10px_rgba(225,29,72,0.6)] scale-105 ring-2 ring-rose-300'
                      : 'bg-slate-800/85 text-white/80 border-slate-600 hover:bg-slate-700/90'
                  }`}
                >
                  <span className="text-xs sm:text-sm shrink-0">⚔️</span>
                  <span className="whitespace-nowrap">2 OYUNCU DÜELLO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlayerCountMode(3);
                    playMp3('/coin.mp3');
                  }}
                  className={`flex-1 py-1 sm:py-1.5 px-1 sm:px-2.5 rounded-lg sm:rounded-xl font-black text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider transition-all transform flex items-center justify-center gap-1 cursor-pointer shadow-md border-2 whitespace-nowrap ${
                    playerCountMode === 3
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white border-white shadow-[0_3px_10px_rgba(16,185,129,0.6)] scale-105 ring-2 ring-emerald-300'
                      : 'bg-slate-800/85 text-white/80 border-slate-600 hover:bg-slate-700/90'
                  }`}
                >
                  <span className="text-xs sm:text-sm shrink-0">⚔️⚔️</span>
                  <span className="whitespace-nowrap">3 OYUNCU DÜELLO</span>
                </button>
              </div>

              {/* MAIN CATEGORY CARDS - 2x2 GRID FOR TOP 4 CATEGORIES, PLUS 5TH BANNER RECTANGLE BELOW */}
              <div className="w-full max-w-3xl mx-auto flex flex-col gap-1 sm:gap-1.5">
                {/* 2x2 GRID FOR THE 4 MAIN CATEGORIES */}
                <div className="grid grid-cols-2 gap-1 sm:gap-1.5 w-full">
                  {/* CARD 1: GEOMETRİ */}
                  <button
                    onClick={() => setSelectedCategoryId('geometri')}
                    className="group relative w-full bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-600 dark:from-blue-600 dark:via-indigo-700 dark:to-sky-800 text-white rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 border-3 sm:border-4 border-white/90 dark:border-slate-700/80 shadow-[0_6px_16px_rgba(0,0,0,0.3),0_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0.5 flex flex-col items-center justify-between text-center overflow-hidden cursor-pointer min-h-[135px] sm:min-h-[165px]"
                  >
                    {/* Sunburst Ray & Top Gloss Overlays */}
                    <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_50%,transparent_70%)] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-[20px]" />

                    {/* Top 3D Icon Badge */}
                    <div className="relative shrink-0 z-10 w-11 h-11 sm:w-15 sm:h-15 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border-2 sm:border-3 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center p-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <img src="/iconn/s21.png" alt="Geometri" className="w-full h-full object-cover scale-[1.55] sm:scale-[1.65] filter drop-shadow-md" />
                    </div>

                    {/* Center Text Column */}
                    <div className="flex-1 flex flex-col items-center justify-center z-10 py-0.5 min-w-0">
                      <h3 className="font-black text-xs sm:text-base md:text-lg text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight uppercase tracking-wide">
                        1. Nesnelerin Geometrisi
                      </h3>
                      <p className="text-[9px] sm:text-[11px] font-extrabold text-blue-100/90 mt-0.5 drop-shadow-xs line-clamp-2">
                        Şekiller, Cisimler & Örüntüler
                      </p>
                    </div>

                    {/* Bottom Action Pill Button */}
                    <div className="z-10 shrink-0 relative w-[65px] h-[26px] sm:w-[90px] sm:h-[35px] group-hover:scale-105 transition-all filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] flex items-center justify-center mt-0.5">
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                        style={{ backgroundImage: `url('/playl.png')` }}
                      />
                    </div>
                  </button>

                  {/* CARD 2: SAYILAR */}
                  <button
                    onClick={() => setSelectedCategoryId('sayilar')}
                    className="group relative w-full bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 dark:from-amber-600 dark:via-orange-700 dark:to-red-700 text-white rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 border-3 sm:border-4 border-white/90 dark:border-slate-700/80 shadow-[0_6px_16px_rgba(0,0,0,0.3),0_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0.5 flex flex-col items-center justify-between text-center overflow-hidden cursor-pointer min-h-[135px] sm:min-h-[165px]"
                  >
                    {/* Sunburst Ray & Top Gloss Overlays */}
                    <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_50%,transparent_70%)] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-[20px]" />

                    {/* Top 3D Icon Badge */}
                    <div className="relative shrink-0 z-10 w-11 h-11 sm:w-15 sm:h-15 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border-2 sm:border-3 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center p-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <img src="/iconn/s19.png" alt="Sayılar" className="w-full h-full object-cover scale-[1.55] sm:scale-[1.65] filter drop-shadow-md" />
                    </div>

                    {/* Center Text Column */}
                    <div className="flex-1 flex flex-col items-center justify-center z-10 py-0.5 min-w-0">
                      <h3 className="font-black text-xs sm:text-base md:text-lg text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight uppercase tracking-wide">
                        2. Sayılar ve Nicelikler
                      </h3>
                      <p className="text-[9px] sm:text-[11px] font-extrabold text-amber-100/90 mt-0.5 drop-shadow-xs line-clamp-2">
                        Ritmik Sayma, Basamak Değeri & Kesirler
                      </p>
                    </div>

                    {/* Bottom Action Pill Button */}
                    <div className="z-10 shrink-0 relative w-[65px] h-[26px] sm:w-[90px] sm:h-[35px] group-hover:scale-105 transition-all filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] flex items-center justify-center mt-0.5">
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                        style={{ backgroundImage: `url('/playl.png')` }}
                      />
                    </div>
                  </button>

                  {/* CARD 3: İŞLEMLER */}
                  <button
                    onClick={() => setSelectedCategoryId('islemler')}
                    className="group relative w-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 dark:from-purple-700 dark:via-fuchsia-700 dark:to-pink-700 text-white rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 border-3 sm:border-4 border-white/90 dark:border-slate-700/80 shadow-[0_6px_16px_rgba(0,0,0,0.3),0_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0.5 flex flex-col items-center justify-between text-center overflow-hidden cursor-pointer min-h-[135px] sm:min-h-[165px]"
                  >
                    {/* Sunburst Ray & Top Gloss Overlays */}
                    <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_50%,transparent_70%)] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-[20px]" />

                    {/* Top 3D Icon Badge */}
                    <div className="relative shrink-0 z-10 w-11 h-11 sm:w-15 sm:h-15 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border-2 sm:border-3 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center p-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <img src="/iconn/s6.png" alt="İşlemler" className="w-full h-full object-cover scale-[1.55] sm:scale-[1.65] filter drop-shadow-md" />
                    </div>

                    {/* Center Text Column */}
                    <div className="flex-1 flex flex-col items-center justify-center z-10 py-0.5 min-w-0">
                      <h3 className="font-black text-xs sm:text-base md:text-lg text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight uppercase tracking-wide">
                        3. İşlemler ve Cebir
                      </h3>
                      <p className="text-[9px] sm:text-[11px] font-extrabold text-pink-100/90 mt-0.5 drop-shadow-xs line-clamp-2">
                        Toplama, Çıkarma, Çarpma ve Bölme
                      </p>
                    </div>

                    {/* Bottom Action Pill Button */}
                    <div className="z-10 shrink-0 relative w-[65px] h-[26px] sm:w-[90px] sm:h-[35px] group-hover:scale-105 transition-all filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] flex items-center justify-center mt-0.5">
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                        style={{ backgroundImage: `url('/playl.png')` }}
                      />
                    </div>
                  </button>

                  {/* CARD 4: VERİ İŞLEME */}
                  <button
                    onClick={() => setSelectedCategoryId('olcme')}
                    className="group relative w-full bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 dark:from-teal-600 dark:via-emerald-700 dark:to-green-800 text-white rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 border-3 sm:border-4 border-white/90 dark:border-slate-700/80 shadow-[0_6px_16px_rgba(0,0,0,0.3),0_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0.5 flex flex-col items-center justify-between text-center overflow-hidden cursor-pointer min-h-[135px] sm:min-h-[165px]"
                  >
                    {/* Sunburst Ray & Top Gloss Overlays */}
                    <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_50%,transparent_70%)] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-[20px]" />

                    {/* Top 3D Icon Badge */}
                    <div className="relative shrink-0 z-10 w-11 h-11 sm:w-15 sm:h-15 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border-2 sm:border-3 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center p-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      <img src="/iconn/s15.png" alt="Veri İşleme" className="w-full h-full object-cover scale-[1.55] sm:scale-[1.65] filter drop-shadow-md" />
                    </div>

                    {/* Center Text Column */}
                    <div className="flex-1 flex flex-col items-center justify-center z-10 py-0.5 min-w-0">
                      <h3 className="font-black text-xs sm:text-base md:text-lg text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight uppercase tracking-wide">
                        4. Veri İşleme
                      </h3>
                      <p className="text-[9px] sm:text-[11px] font-extrabold text-emerald-100/90 mt-0.5 drop-shadow-xs line-clamp-2">
                        Sütun Grafikleri & Tablolar
                      </p>
                    </div>

                    {/* Bottom Action Pill Button */}
                    <div className="z-10 shrink-0 relative w-[65px] h-[26px] sm:w-[90px] sm:h-[35px] group-hover:scale-105 transition-all filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] flex items-center justify-center mt-0.5">
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                        style={{ backgroundImage: `url('/playl.png')` }}
                      />
                    </div>
                  </button>
                </div>

                {/* FEATURED SPECIAL 5TH ITEM: 3D GEOMETRY LAB RECTANGULAR BANNER */}
                <button
                  onClick={() => setShow3DLab(true)}
                  className="group relative w-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 dark:from-amber-500 dark:via-orange-600 dark:to-pink-700 text-white rounded-[18px] sm:rounded-[24px] p-2.5 sm:p-3.5 border-3 sm:border-4 border-white/90 dark:border-slate-700/80 shadow-[0_6px_16px_rgba(249,115,22,0.3),0_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_10px_24px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-between gap-2.5 sm:gap-4 overflow-hidden cursor-pointer"
                >
                  {/* Sunburst Ray & Top Gloss Overlays */}
                  <div className="absolute -left-10 -top-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_50%,transparent_70%)] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-[20px]" />

                  {/* Left 3D Icon Badge */}
                  <div className="relative shrink-0 z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border-2 sm:border-3 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center p-0 overflow-hidden group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <img src="/iconn/s10.png" alt="3D Geometri" className="w-full h-full object-cover scale-[1.55] sm:scale-[1.65] filter drop-shadow-md" />
                  </div>

                  {/* Center Text Column */}
                  <div className="flex-1 text-left min-w-0 z-10 py-0.5">
                    <div className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-200 flex items-center gap-1 drop-shadow-xs">
                      <Sparkles size={12} /> İNTERAKTİF DOKUNMA LABI
                    </div>
                    <h3 className="font-black text-xs sm:text-xl text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] leading-tight uppercase tracking-wider">
                      3D Geometri Keşif Labı
                    </h3>
                    <p className="text-[10px] sm:text-xs font-extrabold text-amber-100/90 mt-0.5 drop-shadow-xs line-clamp-1">
                      Küp, Silindir, Koni ve Prizmaları 3D Çevir & Keşfet!
                    </p>
                  </div>

                  {/* Right 3D Green Action Pill Button Image */}
                  <div className="z-10 shrink-0 relative w-[78px] h-[31px] sm:w-[100px] sm:h-[39px] group-hover:scale-105 transition-all filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    <div 
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                      style={{ backgroundImage: `url('/playl.png')` }}
                    />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* SUB-TOPIC BUTTON CARDS SCREEN FOR SELECTED CATEGORY (3-COLUMN SQUARE CARDS) */
            <div className="max-w-5xl w-full mx-auto flex flex-col items-center py-1 sm:py-2">
              
              {/* CENTERED TITLE HEADER LOGO (mattt.gif) & CATEGORY TITLE BADGE */}
              {/* COMPACT CATEGORY HEADER BADGE */}
              <div className="flex flex-col items-center justify-center mb-3 sm:mb-4 max-w-5xl w-full mx-auto shrink-0 py-1">
                {(() => {
                  const cat = CATEGORY_MAP.find(c => c.id === selectedCategoryId);
                  if (!cat) return null;
                  return (
                    <div className="z-10 flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-blue-950 px-5 sm:px-8 py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-white shadow-[0_4px_15px_rgba(0,0,0,0.6)] font-black text-sm sm:text-base md:text-lg uppercase tracking-wider whitespace-nowrap max-w-full shrink-0">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white text-blue-950 border-2 border-amber-500 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                        {cat.icon.startsWith('/') ? (
                          <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover scale-[1.55] filter drop-shadow-xs" />
                        ) : (
                          cat.icon
                        )}
                      </span>
                      <span className="drop-shadow-xs truncate">{cat.name}</span>
                    </div>
                  );
                })()}
              </div>

              {/* SUB-TOPICS RENDERED AS PILL BUTTONS IN A 2-COLUMN GRID (REFERENCE STYLE) */}
              <div className="w-full space-y-5">
                
                {/* 1. NESNELERİN GEOMETRİSİ */}
                {selectedCategoryId === 'geometri' && (
                  <div className="space-y-4">
                    {/* SPECIAL 3D LAB BANNER BUTTON FOR GEOMETRY */}
                    <button
                      onClick={() => setShow3DLab(true)}
                      className="w-full group relative bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-2xl p-3.5 border-3 border-white dark:border-slate-700 shadow-[0_5px_0_#c2410c] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white p-0 overflow-hidden flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                          <img src="/iconn/s10.png" alt="3D Geometri" className="w-full h-full object-cover scale-[1.55]" />
                        </div>
                        <div className="text-left text-white">
                          <div className="text-[10px] font-black uppercase text-yellow-200 tracking-wider">İnteraktif 3D Laboratuvarı</div>
                          <div className="text-sm sm:text-base font-black leading-tight">3D Geometrik Cisimleri 360° Döndür & İncele</div>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-white text-slate-950 font-black text-xs rounded-xl shadow-md group-hover:bg-yellow-300">
                        BAŞLAT ▶
                      </span>
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        'geometrik_sekil_cisim',
                        'yuz_ayrit_kose',
                        'geometrik_oruntu',
                        'uzamsal_iliskiler_simetri',
                        'sivi_olcme',
                        'tartma_olcme'
                      ].map(key => {
                        const t = topics[key];
                        if (!t) return null;
                        return (
                          <TopicButtonReferenceStyle
                            key={key}
                            topicKey={key}
                            title={t.title}
                            onClick={() => selectTopicAndStart(key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. SAYILAR VE NİCELİKLER */}
                {selectedCategoryId === 'sayilar' && (
                  <div className="space-y-5">
                    {/* Standalone topics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {['nesne_sayisi', 'sayi_basamak_degeri', 'deste_duzine', 'kesirler', 'sayi_karsilastirma', 'paralarimiz', 'zaman_olcme', 'uzunluk_olcme'].map(key => {
                        const t = topics[key];
                        if (!t) return null;
                        return (
                          <TopicButtonReferenceStyle
                            key={key}
                            topicKey={key}
                            title={t.title}
                            onClick={() => selectTopicAndStart(key)}
                          />
                        );
                      })}
                    </div>

                    {/* Ritmik Saymalar Group Section */}
                    <div className="bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm border-2 border-amber-400 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-md">
                      <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-blue-950 font-black text-sm sm:text-base px-3.5 py-1.5 rounded-xl border border-amber-500 shadow-sm flex items-center gap-2 mb-3">
                        <img src="/iconn/s17.png" alt="Ritmik" className="w-7 h-7 object-contain filter drop-shadow-sm" />
                        <span>Ritmik Saymalar</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {['ritmik_ileri_2', 'ritmik_ileri_3', 'ritmik_ileri_4', 'ritmik_ileri_5', 'ritmik_ileri_10', 'ritmik_geri_2', 'ritmik_geri_10'].map(key => {
                          const t = topics[key];
                          if (!t) return null;
                          return (
                            <TopicButtonReferenceStyle
                              key={key}
                              topicKey={key}
                              title={t.title}
                              onClick={() => selectTopicAndStart(key)}
                              compact
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Saati Okuma Group Section */}
                    <div className="bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm border-2 border-amber-400 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-md">
                      <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-blue-950 font-black text-sm sm:text-base px-3.5 py-1.5 rounded-xl border border-amber-500 shadow-sm flex items-center gap-2 mb-3">
                        <img src="/iconn/s24.png" alt="Saati Okuma" className="w-7 h-7 object-contain filter drop-shadow-sm" />
                        <span>Saati Okuma</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {['saat_tam', 'saat_yarim', 'saat_ceyrek_gece', 'saat_ceyrek_kala'].map(key => {
                          const t = topics[key];
                          if (!t) return null;
                          return (
                            <TopicButtonReferenceStyle
                              key={key}
                              topicKey={key}
                              title={t.title}
                              onClick={() => selectTopicAndStart(key)}
                              compact
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. İŞLEMLERDEN CEBİRSEL DÜŞÜNMEYE */}
                {selectedCategoryId === 'islemler' && (
                  <div className="space-y-5">
                    {/* Toplama İşlemi Group */}
                    <div className="bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm border-2 border-amber-400 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-md">
                      <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-blue-950 font-black text-sm sm:text-base px-3.5 py-1.5 rounded-xl border border-amber-500 shadow-sm flex items-center gap-2 mb-3">
                        <img src="/iconn/s28.png" alt="Toplama" className="w-7 h-7 object-contain filter drop-shadow-sm" />
                        <span>Toplama İşlemi</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {['toplama_eldesiz_50', 'toplama_eldeli_50', 'verilmeyen_toplanani_bul', 'zihinden_toplama', 'tek_islem_toplama_problemleri', 'iki_islem_toplama_problemleri'].map(key => {
                          const t = topics[key];
                          if (!t) return null;
                          return (
                            <TopicButtonReferenceStyle
                              key={key}
                              topicKey={key}
                              title={t.title}
                              onClick={() => selectTopicAndStart(key)}
                              compact
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Çıkarma İşlemi Group */}
                    <div className="bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm border-2 border-amber-400 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-md">
                      <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-blue-950 font-black text-sm sm:text-base px-3.5 py-1.5 rounded-xl border border-amber-500 shadow-sm flex items-center gap-2 mb-3">
                        <img src="/iconn/s33.png" alt="Çıkarma" className="w-7 h-7 object-contain filter drop-shadow-sm" />
                        <span>Çıkarma İşlemi</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {['cikarma_onluksuz_50', 'cikarma_onluklu_50', 'zihinden_cikarma', 'tek_islem_cikarma_problemleri', 'iki_islem_cikarma_problemleri'].map(key => {
                          const t = topics[key];
                          if (!t) return null;
                          return (
                            <TopicButtonReferenceStyle
                              key={key}
                              topicKey={key}
                              title={t.title}
                              onClick={() => selectTopicAndStart(key)}
                              compact
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Çarpma, Bölme ve Diğer İşlemler Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {['toplama_cikarma_problemleri', 'ardisik_toplama', 'ritmik_carpim', 'esit_paylastirma', 'ardisik_cikarma', 'kalansiz_bolme'].map(key => {
                        const t = topics[key];
                        if (!t) return null;
                        return (
                          <TopicButtonReferenceStyle
                            key={key}
                            topicKey={key}
                            title={t.title}
                            onClick={() => selectTopicAndStart(key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. VERİ İŞLEME */}
                {selectedCategoryId === 'olcme' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {['veri_grafik'].map(key => {
                      const t = topics[key];
                      if (!t) return null;
                      return (
                        <TopicButtonReferenceStyle
                          key={key}
                          topicKey={key}
                          title={t.title}
                          onClick={() => selectTopicAndStart(key)}
                        />
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}
        </div>
      )}

      {/* FULL SCREEN GAME AREA (TEK KİŞİLİK TAM SAYFA ETKİNLİK) */}
      {gameState === 'playing' && playerCountMode === 1 && (
        <div className="flex-1 flex flex-col p-1.5 sm:p-3 max-w-3xl mx-auto w-full justify-between overflow-hidden min-h-0 relative h-full">
          
          {/* ACTIVE MASCOT & TOPIC TITLE HEADER BAR - 3D CARTOON GAME UI STYLE WITH BASBACK.PNG BACKGROUND */}
          <div
            style={{ backgroundImage: `url('/basback.png')`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
            className="relative overflow-hidden bg-cover bg-center rounded-2xl px-2.5 sm:px-4 py-1 sm:py-1.5 mb-1 sm:mb-1.5 shrink-0 flex items-center gap-2 min-h-[42px] sm:min-h-[50px]"
          >
            {/* Top Gloss Overlay */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none rounded-t-2xl z-0" />

            <div className="flex-1 min-w-0 z-10 flex items-center justify-center text-center">
              {(() => {
                const titleStr = topics[currentTopic]?.title || '';
                const len = titleStr.length;
                const sizeClass =
                  len <= 15
                    ? 'text-sm sm:text-lg md:text-xl'
                    : len <= 28
                    ? 'text-xs sm:text-base md:text-lg'
                    : len <= 40
                    ? 'text-[11px] sm:text-sm md:text-base'
                    : 'text-[10px] sm:text-xs md:text-sm';
                return (
                  <h2 className={`${sizeClass} font-black text-amber-950 tracking-tight sm:tracking-wide leading-snug uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] [text-shadow:_0_1px_1px_rgba(255,255,255,0.5)] break-words whitespace-normal line-clamp-2 text-center`}>
                    {titleStr}
                  </h2>
                );
              })()}
            </div>
          </div>

          {/* TOP BAR: LIVES, SCORE, STREAK - WITH BASBACK2.PNG BACKGROUND */}
          <div
            style={{ backgroundImage: `url('/basback2.png')`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
            className="relative overflow-hidden bg-cover bg-center rounded-2xl p-1.5 sm:p-2 flex justify-between items-center shrink-0 mb-1 sm:mb-1.5 min-h-[38px] sm:min-h-[44px]"
          >
            {/* Top Gloss Overlay */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-2xl" />

            {/* LIVES */}
            <div className="flex items-center gap-1 z-10">
              <div className="flex gap-1 sm:gap-1.5 items-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    className={
                      i < lives
                        ? "fill-red-500 text-rose-200 filter drop-shadow-[0_2px_6px_rgba(225,29,72,0.9)] [filter:_drop-shadow(0_1px_2px_rgba(0,0,0,0.95))] animate-pulse scale-105"
                        : "fill-slate-900/80 text-slate-500 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] opacity-60"
                    }
                  />
                ))}
              </div>
            </div>

            {/* SCORE */}
            <div 
              style={{ backgroundImage: `url('/buton.png')`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              className="relative z-10 flex items-center justify-center text-center px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl shrink-0 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.3)] min-h-[34px] sm:min-h-[40px]"
            >
              <span className="font-black text-xs sm:text-sm md:text-base text-white uppercase tracking-wider leading-none [text-shadow:_1px_1px_0_#000,_-1px_1px_0_#000,_1px_-1px_0_#000,_-1px_-1px_0_#000,_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
                PUAN: {score} / 10
              </span>
            </div>

            {/* STREAK & REMAINING QUESTIONS */}
            <div className="flex items-center gap-1.5 z-10">
              {streak >= 3 && (
                <div className="bg-gradient-to-b from-amber-400 to-orange-500 text-white border-2 border-white px-1.5 py-0.5 rounded-full font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-[0_2px_0_#c2410c] animate-bounce">
                  <Flame size={12} className="fill-amber-200 text-white" />
                  <span>{streak}x</span>
                </div>
              )}
              <div className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider [text-shadow:_1px_1px_0_#000,_-1px_1px_0_#000,_1px_-1px_0_#000,_-1px_-1px_0_#000,_0_2px_4px_rgba(0,0,0,0.9)]">
                {10 - score} KALDI
              </div>
            </div>
          </div>

          {/* QUESTION CARD - CLEAN CRISP ARK22.PNG BACKGROUND */}
          <div className="relative flex-1 rounded-2xl p-1 sm:p-2 flex flex-col items-center justify-center text-center my-1 sm:my-1.5 min-h-[180px] sm:min-h-[250px] md:min-h-[300px] w-full max-w-3xl mx-auto z-10 overflow-hidden">
            {/* ARK22.PNG QUESTION BACKGROUND - FIT TO BOARD */}
            <div 
              className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat pointer-events-none rounded-2xl"
              style={{ backgroundImage: `url('/ark22.png')` }}
            />

            {/* TOP EMBLEM EMBOSSED "SORU" BADGE */}
            <div className="absolute top-1 sm:top-1.5 z-20 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 border border-amber-200 text-amber-950 font-black text-[9px] sm:text-[11px] rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.4)] flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 fill-amber-950 text-amber-950" />
              <span>SORU</span>
              <Sparkles className="w-2.5 h-2.5 fill-amber-950 text-amber-950" />
            </div>

            {/* QUESTION TEXT - STRICTLY INSIDE INNER WOODEN BOARD PLANK AREA */}
            <div className="absolute top-[10%] bottom-[11%] left-[10%] right-[10%] z-10 flex flex-col items-center justify-center text-center overflow-y-auto no-scrollbar px-2 py-1">
              {currentQuestionData?.questionHTML ? (
                <div dangerouslySetInnerHTML={{ __html: currentQuestionData.questionHTML }} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] [text-shadow:0_2px_4px_#000] text-white font-black w-full h-full flex flex-col items-center justify-center min-h-0" />
              ) : (
                <div className={`my-auto font-black text-white whitespace-pre-line leading-snug tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_4px_#000,_0_4px_10px_rgba(0,0,0,0.9)] px-2 py-1 max-w-full break-words text-center ${
                  (currentQuestionData?.question?.length || 0) < 30
                    ? "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wider"
                    : "text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl"
                }`}>
                  {currentQuestionData?.question}
                </div>
              )}
            </div>
          </div>

          {/* OPTIONS GRID - 3D CARTOON GAME BUTTONS WITH BUTON2.PNG BACKGROUND */}
          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-1.5 w-full max-w-2xl mx-auto shrink-0 z-10">
            {optionsList.map((opt, idx) => {
              let btnTransform = "filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98]";
              let textColor = "text-white font-black [text-shadow:0_2px_0_#000,0_3px_6px_rgba(0,0,0,0.95),0_0_12px_rgba(0,0,0,0.85)] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]";

              if (selectedOption !== null && currentQuestionData) {
                if (opt === currentQuestionData.correct) {
                  btnTransform = "scale-105";
                  textColor = "text-emerald-200 font-black [text-shadow:0_2px_0_#000,0_3px_6px_rgba(0,0,0,0.95)]";
                } else if (opt === selectedOption) {
                  btnTransform = "scale-95 opacity-80";
                  textColor = "text-rose-200 font-black [text-shadow:0_2px_0_#000,0_3px_6px_rgba(0,0,0,0.95)]";
                }
              }

              const isCompact = currentQuestionData?.isLong || currentQuestionData?.questionHTML || optionsList.some(o => String(o).length > 8);
              const isNumberOnly = !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(String(opt).trim());

              // Dynamic font sizes: Pure numbers are enlarged for clarity, text options remain standard size
              let fontSizeClass = "";
              if (isNumberOnly) {
                fontSizeClass = "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black";
              } else {
                fontSizeClass = isCompact ? "text-sm sm:text-base md:text-lg lg:text-xl font-black" : "text-sm sm:text-lg md:text-xl lg:text-2xl font-black";
              }

              const isCorrect = selectedOption !== null && currentQuestionData && opt === currentQuestionData.correct;
              const isWrong = selectedOption !== null && currentQuestionData && opt === selectedOption && opt !== currentQuestionData.correct;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedbackState !== 'none'}
                  className={`relative group w-full aspect-[757/240] h-12 sm:h-14 md:h-16 max-h-[66px] transition-all flex items-center justify-center text-center leading-tight break-words cursor-pointer uppercase tracking-wider overflow-visible ${btnTransform}`}
                >
                  {/* ORGANIC PNG CONTOUR GLOW BEHIND BUT1.PNG (TRACES LEAVES, VINES & WOOD EDGES EXACTLY) */}
                  {isCorrect && (
                    <img
                      src="/but1.png"
                      alt=""
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 blur-md scale-110 opacity-90 filter brightness-[1.6] sepia-1 hue-rotate-[90deg] saturate-[4] z-0 animate-pulse"
                    />
                  )}

                  {isWrong && (
                    <img
                      src="/but1.png"
                      alt=""
                      className="absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 blur-md scale-105 opacity-90 filter brightness-[1.5] sepia-1 hue-rotate-[300deg] saturate-[4] z-0"
                    />
                  )}

                  {/* BUTTON BACKGROUND IMAGE (BUT1.PNG) WITH CONTOUR-FOLLOWING DROP-SHADOW GLOW */}
                  <img
                    src="/but1.png"
                    alt=""
                    className={`absolute inset-0 w-full h-full object-fill pointer-events-none transition-all duration-300 z-10 ${
                      isCorrect
                        ? 'filter drop-shadow-[0_0_10px_#22c55e] drop-shadow-[0_0_22px_#10b981] drop-shadow-[0_0_36px_#4ade80] scale-105 animate-pulse'
                        : isWrong
                        ? 'filter drop-shadow-[0_0_10px_#ef4444] drop-shadow-[0_0_22px_#f43f5e] drop-shadow-[0_0_36px_#fb7185] scale-95'
                        : 'group-hover:scale-[1.02]'
                    }`}
                  />

                  <span className={`relative z-30 px-3 flex items-center justify-center text-center pointer-events-none ${textColor} ${fontSizeClass}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MULTI-PLAYER SPLIT SCREEN DÜELLO ALANI (2 VE 3 OYUNCU) */}
      {gameState === 'playing' && playerCountMode > 1 && (
        <div className="flex-1 flex flex-col p-2 sm:p-3 w-full h-full overflow-hidden min-h-0 relative z-10 max-w-7xl mx-auto">
          {/* COMMON TOP BAR: TOPIC TITLE & DÜELLO BADGE */}
          <div
            style={{ backgroundImage: `url('/basback.png')`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
            className="relative overflow-hidden bg-cover bg-center rounded-2xl px-3 py-1.5 mb-2 shrink-0 flex items-center justify-between gap-2 min-h-[46px]"
          >
            <span className="px-3 py-1 bg-amber-400 text-blue-950 font-black text-xs sm:text-sm rounded-xl shadow-md uppercase tracking-wider shrink-0">
              ⚔️ {playerCountMode} OYUNCU DÜELLO
            </span>
            <div className="flex-1 min-w-0 text-center">
              <h2 className="text-xs sm:text-base md:text-lg font-black text-amber-950 uppercase tracking-tight truncate drop-shadow-sm">
                {topics[currentTopic]?.title || ''}
              </h2>
            </div>
            <span className="px-3 py-1 bg-slate-900/80 text-amber-300 border border-amber-400/50 font-black text-xs sm:text-sm rounded-xl shadow-sm uppercase shrink-0">
              HEDEF: 10 PUAN
            </span>
          </div>

          {/* SPLIT SCREEN GRID FOR 2 OR 3 PLAYERS */}
          <div className={`flex-1 grid grid-cols-1 ${playerCountMode === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-2 sm:gap-3.5 w-full min-h-0 overflow-y-auto no-scrollbar`}>
            {players.map((p, pIdx) => (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border-3 ${p.colorTheme.border} bg-gradient-to-b ${p.colorTheme.bg} shadow-2xl overflow-hidden min-h-0 z-10 transition-all`}
              >
                {/* PLAYER HEADER BAR */}
                <div className={`relative overflow-hidden ${p.colorTheme.headerBg} rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-md shrink-0 border border-white/40`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-xs sm:text-sm text-white uppercase tracking-wider truncate drop-shadow-md">
                      {p.avatar}
                    </span>
                  </div>

                  {/* LIVES */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Heart
                        key={i}
                        size={18}
                        className={
                          i < p.lives
                            ? "fill-red-500 text-rose-200 filter drop-shadow-[0_1px_4px_rgba(225,29,72,0.9)] animate-pulse"
                            : "fill-slate-900/80 text-slate-600 opacity-50"
                        }
                      />
                    ))}
                  </div>

                  {/* SCORE */}
                  <div className="bg-black/50 border border-amber-300/80 text-amber-300 px-2.5 py-0.5 rounded-lg font-black text-xs sm:text-sm shadow-inner shrink-0">
                    PUAN: {p.score} / 10
                  </div>
                </div>

                {/* QUESTION AREA FOR THIS PLAYER */}
                <div className="relative flex-1 rounded-2xl p-1 sm:p-2 my-1 sm:my-1.5 flex flex-col items-center justify-center text-center z-10 overflow-hidden min-h-[135px] sm:min-h-[155px]">
                  <div 
                    className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat pointer-events-none rounded-xl"
                    style={{ backgroundImage: `url('/ark22.png')` }}
                  />
                  
                  {p.lives <= 0 ? (
                    <div className="relative z-20 flex flex-col items-center justify-center gap-1">
                      <div className="text-3xl sm:text-4xl animate-bounce">💀💔</div>
                      <div className="text-rose-400 font-black text-base sm:text-xl uppercase tracking-wider">ELENDİ!</div>
                      <div className="text-white/80 text-xs font-bold">Diğer oyuncular yarışıyor...</div>
                    </div>
                  ) : (
                    <div className="absolute top-[7%] bottom-[8%] left-[10%] right-[10%] z-10 flex flex-col items-center justify-center text-center overflow-visible px-1">
                      {p.currentQuestionData?.questionHTML ? (
                        <div dangerouslySetInnerHTML={{ __html: p.currentQuestionData.questionHTML }} className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] [text-shadow:0_2px_4px_#000] text-white font-black w-full h-full flex flex-col items-center justify-center min-h-0 scale-90 xs:scale-95 sm:scale-100 origin-center" />
                      ) : (
                        <div className={`my-auto font-black text-white whitespace-pre-line leading-snug tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_4px_#000,_0_4px_10px_rgba(0,0,0,0.9)] px-1 py-0.5 max-w-full break-words text-center ${
                          (p.currentQuestionData?.question?.length || 0) < 30
                            ? "text-xl xs:text-2xl sm:text-3xl md:text-4xl tracking-wider"
                            : "text-sm xs:text-base sm:text-lg md:text-xl"
                        }`}>
                          {p.currentQuestionData?.question}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CHOICE BUTTONS GRID FOR THIS PLAYER */}
                {p.lives > 0 && (
                  <div className="grid grid-cols-2 gap-1 sm:gap-1.5 w-full shrink-0 z-10">
                    {p.shuffledOptions.map((opt, oIdx) => {
                      const isCorrect = p.selectedOption !== null && p.currentQuestionData && opt === p.currentQuestionData.correct;
                      const isWrong = p.selectedOption !== null && p.currentQuestionData && opt === p.selectedOption && opt !== p.currentQuestionData.correct;

                      let btnClass = "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-blue-950 border-2 border-white shadow-[0_2px_0_#b45309] hover:scale-[1.02] active:scale-95";
                      if (isCorrect) {
                        btnClass = "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white border-2 border-emerald-200 shadow-[0_0_12px_#22c55e] scale-105 animate-pulse";
                      } else if (isWrong) {
                        btnClass = "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 text-white border-2 border-rose-200 shadow-[0_0_12px_#ef4444] scale-95 opacity-80";
                      }

                      const isNumberOnly = !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(String(opt).trim());
                      const fontClass = isNumberOnly 
                        ? (playerCountMode === 3 ? "text-base xs:text-lg sm:text-xl md:text-2xl font-black" : "text-lg xs:text-xl sm:text-2xl md:text-3xl font-black")
                        : "text-xs xs:text-sm sm:text-base font-black";

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handlePlayerAnswer(pIdx, opt)}
                          disabled={p.feedbackState !== 'none'}
                          className={`relative group w-full py-1.5 sm:py-2.5 px-1.5 rounded-xl transition-all flex items-center justify-center text-center cursor-pointer uppercase tracking-wide overflow-hidden ${btnClass}`}
                        >
                          <span className={`relative z-10 truncate ${fontClass} [text-shadow:0_2px_0_#000,0_2px_4px_rgba(0,0,0,0.9)] drop-shadow-md text-white font-black`}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* GLOBAL FOOTER WITH COPYRIGHT TEXT */}
      <footer className="z-30 shrink-0 bg-slate-950/90 dark:bg-[#070D1E]/95 backdrop-blur-md border-t-2 border-yellow-400/90 dark:border-yellow-500/80 py-2.5 sm:py-3.5 px-4 flex items-center justify-center shadow-xl">
        <p className="text-yellow-400 dark:text-yellow-300 font-bold text-xs sm:text-sm tracking-wide text-center drop-shadow-sm">
          © 2026 OLCİCO Tüm hakları saklıdır.
        </p>
      </footer>

      {/* GAME OVER / VICTORY OVERLAY */}
      {gameState === 'gameover' && gameResult && (
        <div className="fixed inset-0 h-[100dvh] w-full z-50 flex items-center justify-center text-white text-center overflow-hidden select-none">
          {/* FULL SCREEN BACKGROUND IMAGE FOR VICTORY / DEFEAT */}
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
            style={{ backgroundImage: `url('/kazanek.png')` }}
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none z-0" />

          {/* INNER PARCHMENT CONTAINER: STRICTLY CONFINED TO THE CLEAR AREA BETWEEN TOP MASK AND BOTTOM WOLF HEAD */}
          <div className="relative z-10 w-full max-w-[340px] sm:max-w-md md:max-w-lg h-[58vh] sm:h-[62vh] max-h-[460px] flex flex-col items-center justify-between px-2 sm:px-4 py-0">
            {/* 1. TOP HEADER SECTION: BANNER & COINS / DUEL RESULT */}
            <div className="relative flex flex-col items-center shrink-0 w-full z-10">
              {playerCountMode > 1 ? (
                <div className="flex flex-col items-center w-full max-w-sm">
                  <div className="relative w-full h-11 sm:h-14 flex items-center justify-center px-3">
                    {/* bb3.png BANNER BACKGROUND */}
                    <div 
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                      style={{ backgroundImage: `url('/bb3.png')` }}
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center -translate-y-0.5">
                      <h2 className="text-xs sm:text-sm font-black text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wider">
                        🏆 DÜELLO ŞAMPİYONU
                      </h2>
                      <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wide drop-shadow-md">
                        {players[duelWinnerIndex !== null ? duelWinnerIndex : 0]?.avatar || '1. OYUNCU'} KAZANDI!
                      </p>
                    </div>
                  </div>

                  {/* MULTI-PLAYER SCOREBOARD TABLE (COMPACT) */}
                  <div className="w-full bg-slate-900/90 border-2 border-amber-400 rounded-xl p-1.5 my-0.5 text-center shadow-xl">
                    <div className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-widest mb-0.5 border-b border-amber-400/30 pb-0.5">
                      📊 DÜELLO SKOR TABLOSU
                    </div>
                    <div className="space-y-0.5">
                      {players.map((p, idx) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between px-2 py-0.5 rounded border ${
                            idx === duelWinnerIndex
                              ? 'bg-amber-400/25 border-amber-300 text-amber-200 font-black shadow-xs'
                              : 'bg-black/50 border-white/20 text-white font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {idx === duelWinnerIndex ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide truncate max-w-[100px]">{p.avatar}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-black text-amber-300">
                            {p.score} PUAN
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : gameResult.reason === 'puan' ? (
                <div className="flex flex-col items-center w-full">
                  <GlossyCompleteCard
                    title={gameResult.livesLeft === 3 ? "MÜKEMMEL BAŞARI!" : "TEBRİKLER!"}
                    subtitle={gameResult.livesLeft === 3 ? "🔥 Can Kaybetmeden Tamamladın!" : "10 Puana Ulaşarak Zafer Kazandın!"}
                    starsCount={gameResult.livesLeft === 3 ? 3 : gameResult.livesLeft >= 2 ? 2 : 1}
                  />
                  <div className="relative flex flex-col items-center w-full mt-0.5">
                    <GoldCoinDisplayCard sessionCoins={gameResult.score * 10} totalCoins={totalCoins} compact={true} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full max-w-sm">
                  {/* BANNER WITH bb3.png BEHIND "Üzgünüm, Canların Bitti!" */}
                  <div className="relative w-full h-11 sm:h-14 flex items-center justify-center px-3">
                    <div 
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                      style={{ backgroundImage: `url('/bb3.png')` }}
                    />
                    <div className="relative z-10 flex items-center justify-center gap-1.5 -translate-y-0.5">
                      <span className="text-base sm:text-lg drop-shadow-md">💔🎒</span>
                      <h2 className="text-[11px] sm:text-xs md:text-sm font-black text-amber-100 uppercase tracking-wide [text-shadow:0_2px_4px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.8)]">
                        Üzgünüm, Canların Bitti!
                      </h2>
                    </div>
                  </div>
                  <div className="mt-0.5">
                    <GoldCoinDisplayCard sessionCoins={gameResult.score * 10} totalCoins={totalCoins} compact={true} />
                  </div>
                </div>
              )}
            </div>

            {/* 2. MIDDLE SECTION: VICTORY / DEFEAT VIDEO PLAYBACK WITH CHROMA KEY */}
            <div className="relative flex-1 min-h-0 w-full my-0.5 flex items-center justify-center overflow-visible pointer-events-none z-30">
              {gameResult.reason === 'puan' ? (
                <div className="h-full max-h-[20vh] sm:max-h-[24vh] aspect-[9/16] flex items-center justify-center relative">
                  <ChromaKeyVideo
                    key={customWinVideo || 'default-win-video'}
                    src={customWinVideo || "/aslan-win.mp4"}
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    enableChromaKey={true}
                    showControls={false}
                    className="w-full h-full object-contain scale-110 sm:scale-120 relative z-30 pointer-events-none"
                  />

                  {/* OVERLAY mcomp.mp4 (GÖREV TAMAMLANDI) DIRECTLY ON ASLAN'S BELLY IF WIN */}
                  <div className="absolute inset-x-0 top-[38%] -translate-y-1/2 z-40 pointer-events-none flex items-center justify-center overflow-visible">
                    <ChromaKeyVideo
                      src="/mcomp.mp4"
                      autoPlay={true}
                      loop={true}
                      muted={true}
                      enableChromaKey={true}
                      showControls={false}
                      className="w-full h-24 sm:h-28 object-contain scale-[1.6] origin-center pointer-events-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full max-h-[20vh] sm:max-h-[24vh] aspect-video w-full flex items-center justify-center relative">
                  <ChromaKeyVideo
                    key="trytry2-defeat-video"
                    src="/trytry2.mp4"
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    enableChromaKey={true}
                    showControls={false}
                    className="w-full h-full object-contain scale-110 sm:scale-120 relative z-30 pointer-events-none"
                  />
                </div>
              )}
            </div>

            {/* 3. BOTTOM SECTION: ACTION BUTTONS (INSIDE PARCHMENT, ABOVE WOLF TOTEM) */}
            <div className="relative z-50 shrink-0 flex items-center justify-center gap-2.5 sm:gap-4 w-full max-w-xs mt-0.5">
              {/* REPLAY ICON BUTTON (tryl.png) */}
              <button
                onClick={() => selectTopicAndStart(currentTopic)}
                title="Yeniden Oyna"
                className="group relative w-[42px] h-[32px] sm:w-[48px] sm:h-[38px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] shrink-0"
              >
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                  style={{ backgroundImage: `url('/tryl.png')` }}
                />
              </button>

              {/* ANA SAYFA BUTTON (buton.png) */}
              <button
                onClick={() => {
                  setGameState('welcome');
                  setSelectedCategoryId(null);
                }}
                title="Ana Sayfaya Dön"
                className="group relative w-[115px] h-[34px] sm:w-[135px] sm:h-[40px] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] shrink-0"
              >
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                  style={{ backgroundImage: `url('/buton.png')` }}
                />
                <span className="relative z-10 text-white font-black text-[10px] sm:text-xs tracking-wider [text-shadow:0_2px_0_#000,0_2px_4px_rgba(0,0,0,0.8)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase select-none -translate-y-[1px]">
                  ANA SAYFA
                </span>
              </button>

              {/* MENU ICON BUTTON (menul.png) */}
              <button
                onClick={() => {
                  setGameState('welcome');
                  setSelectedCategoryId(getCategoryIdForTopic(currentTopic));
                }}
                title="Konu Menüsüne Dön"
                className="group relative w-[42px] h-[32px] sm:w-[48px] sm:h-[38px] transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] shrink-0"
              >
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none"
                  style={{ backgroundImage: `url('/menul.png')` }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEWLY UNLOCKED BADGE / TROPHY TOAST NOTIFICATION */}
      {newlyUnlockedBadge && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[99999] animate-bounce px-4 w-full max-w-md pointer-events-none">
          <div className={`p-4 rounded-3xl bg-gradient-to-r ${newlyUnlockedBadge.badgeColor} border-4 ${newlyUnlockedBadge.borderColor} shadow-[0_12px_30px_rgba(0,0,0,0.6)] text-white flex items-center gap-3.5`}>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 shadow-inner overflow-hidden p-1">
              {newlyUnlockedBadge.imageSrc ? (
                <img src={newlyUnlockedBadge.imageSrc} alt={newlyUnlockedBadge.title} className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                newlyUnlockedBadge.icon
              )}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-yellow-200 drop-shadow-xs flex items-center gap-1">
                <Sparkles size={14} /> YENİ ROZET/KUPA KAZANILDIN!
              </div>
              <div className="text-lg font-black drop-shadow-md leading-tight">{newlyUnlockedBadge.title}</div>
              <div className="text-xs opacity-90 line-clamp-1">{newlyUnlockedBadge.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* STATS & TROPHY ROOM MODAL */}
      {showStatsModal && (() => {
        const playerLevel = getPlayerLevelInfo(statsData, badgeCounts, unlockedBadges);

        return (
          <ModernStatsView
            statsData={statsData}
            groupStatsData={groupStatsData}
            topics={topics}
            openedTopics={openedTopics}
            unlockedBadges={unlockedBadges}
            badgeCounts={badgeCounts}
            playerLevel={playerLevel}
            streak={streak}
            onSelectTopic={(key) => selectTopicAndStart(key)}
            onResetStats={() => {
              const keysToRemove = [
                'mathGameStats_v1',
                'mathGameGroupStats_v1',
                'mathGameBadges_v1',
                'mathGameBadgeCounts_v1',
                'mathGameTopicWins_v1',
                'openedTopics_v1',
                'mathGameStats',
                'mathGameBadges',
                'mathGameBadgeCounts',
                'mathGameTopicWins',
                'openedTopics'
              ];
              keysToRemove.forEach((key) => {
                try {
                  localStorage.removeItem(key);
                } catch (e) {
                  console.error('Error removing key:', key, e);
                }
              });
              try {
                localStorage.setItem('mathGameStats_v1', '{}');
                localStorage.setItem('mathGameGroupStats_v1', JSON.stringify(DEFAULT_GROUP_STATS));
                localStorage.setItem('mathGameBadges_v1', '[]');
                localStorage.setItem('mathGameBadgeCounts_v1', '{}');
                localStorage.setItem('mathGameTopicWins_v1', '{}');
                localStorage.setItem('openedTopics_v1', JSON.stringify(['nesne_sayisi']));
              } catch (e) {
                console.error('Error setting empty stats:', e);
              }
              setStatsData({});
              setGroupStatsData(DEFAULT_GROUP_STATS);
              setUnlockedBadges([]);
              setBadgeCounts({});
              setTopicWinCounts({});
              setOpenedTopics(['nesne_sayisi']);
              setScore(0);
              setStreak(0);
              setLives(3);
              setGameResult(null);
              setFeedbackState('none');
              setNewlyUnlockedBadge(null);
            }}
            confirmReset={confirmReset}
            setConfirmReset={setConfirmReset}
            onClose={() => setShowStatsModal(false)}
          />
        );
      })()}


      {/* 3D GEOMETRY INTERACTIVE LAB MODAL */}
      {show3DLab && <Geometry3DLab onClose={() => setShow3DLab(false)} />}

      {/* FULL SCREEN GAME INTRO OVERLAY */}
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-end p-4 sm:p-8 overflow-hidden animate-fadeIn">
          {/* Full Screen Intro Background Video */}
          <video
            ref={introVideoRef}
            src="/introh.mp4"
            poster="/intro2.png"
            autoPlay
            loop
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            // @ts-ignore
            x5-playsinline="true"
            disablePictureInPicture
            controls={false}
            className="absolute inset-0 w-full h-full object-cover sm:object-contain bg-slate-950 pointer-events-none select-none"
          />

          {/* Subtle Bottom Gradient Shade for Button Readability */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          {/* Giriş Button Overlay positioned higher from the bottom using grs.png */}
          <div className="relative z-10 mb-12 sm:mb-20 md:mb-24 flex flex-col items-center">
            <button
              onClick={() => {
                playMp3('/coin.mp3');
                setShowIntro(false);
              }}
              className="group focus:outline-none cursor-pointer transition-transform transform hover:scale-105 active:scale-95 duration-200"
              aria-label="Oyuna Başla"
            >
              <img
                src="/grs.png"
                alt="Giriş Yap"
                className="h-16 sm:h-24 md:h-28 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform group-hover:brightness-110"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
