import { StatRecord } from './types';

export interface BadgeItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  imageSrc?: string;
  category: 'rozet' | 'kupa';
  badgeColor: string;
  borderColor: string;
  conditionText: string;
  checkUnlocked: (
    stats: Record<string, StatRecord>,
    currentStreak: number,
    score: number,
    livesLeft: number,
    isWin?: boolean,
    unlockedCount?: number
  ) => boolean;
  getProgress: (
    stats: Record<string, StatRecord>,
    currentStreak: number,
    score?: number,
    livesLeft?: number,
    unlockedCount?: number
  ) => { current: number; total: number; label: string };
}

export const BADGES: BadgeItem[] = [
  // --- ROZETLER ---
  {
    id: 'ilk_dogru',
    title: 'İlk Kıvılcım',
    desc: 'İlk doğru cevabını başarıyla verdin!',
    icon: '🌟',
    imageSrc: '/rozets/d1.png',
    category: 'rozet',
    badgeColor: 'from-amber-400 to-yellow-500',
    borderColor: 'border-yellow-300',
    conditionText: '1 Doğru Cevap',
    checkUnlocked: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return totalDogru >= 1;
    },
    getProgress: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return { current: Math.min(totalDogru, 1), total: 1, label: `${Math.min(totalDogru, 1)} / 1` };
    }
  },
  {
    id: 'seri_3',
    title: 'Seri Başlangıcı',
    desc: 'Üst üste 3 soruyu fire vermeden doğru yanıtladın!',
    icon: '🔥',
    imageSrc: '/rozets/d2.png',
    category: 'rozet',
    badgeColor: 'from-orange-400 to-red-500',
    borderColor: 'border-orange-300',
    conditionText: '3 Seri Doğru',
    checkUnlocked: (_, streak) => streak >= 3,
    getProgress: (_, streak) => ({ current: Math.min(streak, 3), total: 3, label: `${Math.min(streak, 3)} / 3 Seri` })
  },
  {
    id: 'seri_5',
    title: 'Alevli Zeka',
    desc: 'Harika bir tempo! Üst üste 5 soruya doğru cevap verdin.',
    icon: '⚡',
    imageSrc: '/rozets/d3.png',
    category: 'rozet',
    badgeColor: 'from-amber-300 via-orange-400 to-rose-500',
    borderColor: 'border-amber-300',
    conditionText: '5 Seri Doğru',
    checkUnlocked: (_, streak) => streak >= 5,
    getProgress: (_, streak) => ({ current: Math.min(streak, 5), total: 5, label: `${Math.min(streak, 5)} / 5 Seri` })
  },
  {
    id: 'seri_7',
    title: 'Durdurulamaz!',
    desc: 'İnanılmaz bir başarı! Üst üste 7 soruya doğru cevap verdin.',
    icon: '🎆',
    imageSrc: '/rozets/d4.png',
    category: 'rozet',
    badgeColor: 'from-purple-500 via-pink-500 to-rose-500',
    borderColor: 'border-pink-300',
    conditionText: '7 Seri Doğru',
    checkUnlocked: (_, streak) => streak >= 7,
    getProgress: (_, streak) => ({ current: Math.min(streak, 7), total: 7, label: `${Math.min(streak, 7)} / 7 Seri` })
  },
  {
    id: 'tam_puan',
    title: 'Şampiyon Tur',
    desc: 'Bir etkinlikte 10 puana ulaşarak zafer kazandın!',
    icon: '🏆',
    imageSrc: '/rozets/d5.png',
    category: 'rozet',
    badgeColor: 'from-yellow-400 via-amber-500 to-orange-500',
    borderColor: 'border-yellow-200',
    conditionText: '10 Puan ile Zafer',
    checkUnlocked: (_, __, score, ___, isWin) => Boolean(isWin && score >= 10),
    getProgress: (_, __, score) => ({ current: Math.min(score, 10), total: 10, label: `${Math.min(score, 10)} / 10 Puan` })
  },
  {
    id: 'kusursuz',
    title: 'Kusursuz Zafer',
    desc: 'Hiç can kaybetmeden (3 canla) 10 puan aldın!',
    icon: '💎',
    imageSrc: '/rozets/d6.png',
    category: 'rozet',
    badgeColor: 'from-cyan-400 via-sky-500 to-blue-600',
    borderColor: 'border-cyan-200',
    conditionText: '3 Can ile 10 Puan',
    checkUnlocked: (_, __, score, livesLeft, isWin) => Boolean(isWin && score >= 10 && livesLeft === 3),
    getProgress: (_, __, score, livesLeft) => ({
      current: score >= 10 && livesLeft === 3 ? 1 : 0,
      total: 1,
      label: score >= 10 && livesLeft === 3 ? 'Tamamlandı' : '3 Canla Tamamla'
    })
  },
  {
    id: 'soru_25',
    title: 'Matematik Avcısı',
    desc: 'Toplamda 25 doğru cevaba ulaştın!',
    icon: '🎯',
    imageSrc: '/rozets/d7.png',
    category: 'rozet',
    badgeColor: 'from-emerald-400 to-teal-600',
    borderColor: 'border-emerald-300',
    conditionText: '25 Toplam Doğru',
    checkUnlocked: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return totalDogru >= 25;
    },
    getProgress: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return { current: Math.min(totalDogru, 25), total: 25, label: `${Math.min(totalDogru, 25)} / 25 Doğru` };
    }
  },
  {
    id: 'uzman_yuzde',
    title: 'Usta Zeka',
    desc: 'Bir konuda en az 5 soru çözüp %100 başarı oranına ulaştın!',
    icon: '👑',
    imageSrc: '/rozets/d8.png',
    category: 'rozet',
    badgeColor: 'from-indigo-500 via-purple-500 to-pink-500',
    borderColor: 'border-indigo-300',
    conditionText: '%100 Başarı Oranı',
    checkUnlocked: (stats) => {
      return Object.values(stats).some(s => s.dogru >= 5 && s.yanlis === 0);
    },
    getProgress: (stats) => {
      const maxFlawless = Math.max(0, ...Object.values(stats).map(s => (s.yanlis === 0 ? s.dogru : 0)));
      return { current: Math.min(maxFlawless, 5), total: 5, label: `${Math.min(maxFlawless, 5)} / 5 Kusursuz` };
    }
  },

  // --- KUPALAR ---
  {
    id: 'kupa_bronz',
    title: 'Bronz Matematik Kupası',
    desc: 'Toplam 15 soruya doğru cevap vererek ilk kupanı kazandın!',
    icon: '🥉',
    imageSrc: '/rozets/d9.png',
    category: 'kupa',
    badgeColor: 'from-amber-700 via-yellow-700 to-amber-800',
    borderColor: 'border-amber-400',
    conditionText: '15 Toplam Doğru',
    checkUnlocked: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return totalDogru >= 15;
    },
    getProgress: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return { current: Math.min(totalDogru, 15), total: 15, label: `${Math.min(totalDogru, 15)} / 15 Doğru` };
    }
  },
  {
    id: 'kupa_gumus',
    title: 'Gümüş Matematik Kupası',
    desc: 'Toplam 40 doğru cevaba ulaştın! Gümüş kupa senin!',
    icon: '🥈',
    imageSrc: '/rozets/d10.png',
    category: 'kupa',
    badgeColor: 'from-slate-300 via-slate-400 to-slate-500',
    borderColor: 'border-slate-200',
    conditionText: '40 Toplam Doğru',
    checkUnlocked: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return totalDogru >= 40;
    },
    getProgress: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return { current: Math.min(totalDogru, 40), total: 40, label: `${Math.min(totalDogru, 40)} / 40 Doğru` };
    }
  },
  {
    id: 'kupa_altin',
    title: 'Altın Matematik Kupası',
    desc: 'Muazzam azim! 80 soruya doğru cevap vererek Altın Kupayı kaldırdın!',
    icon: '🥇',
    imageSrc: '/rozets/d11.png',
    category: 'kupa',
    badgeColor: 'from-yellow-300 via-amber-400 to-yellow-600',
    borderColor: 'border-yellow-200',
    conditionText: '80 Toplam Doğru',
    checkUnlocked: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return totalDogru >= 80;
    },
    getProgress: (stats) => {
      const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);
      return { current: Math.min(totalDogru, 80), total: 80, label: `${Math.min(totalDogru, 80)} / 80 Doğru` };
    }
  },
  {
    id: 'kupa_elmas',
    title: 'Büyük Elmas Şampiyonluk Kupası',
    desc: 'En az 5 farklı rozet açarak matematik müzesinin en büyük kupasını kazandın!',
    icon: '💎',
    imageSrc: '/rozets/d12.png',
    category: 'kupa',
    badgeColor: 'from-cyan-300 via-blue-500 to-indigo-600',
    borderColor: 'border-cyan-300',
    conditionText: '5 Rozet Kazan',
    checkUnlocked: (_, __, ___, ____, _____, unlockedCount = 0) => unlockedCount >= 5,
    getProgress: (_, __, unlockedCount = 0) => ({ current: Math.min(unlockedCount, 5), total: 5, label: `${Math.min(unlockedCount, 5)} / 5 Rozet` })
  }
];

export const getBadgeRepeatCount = (
  badge: BadgeItem,
  stats: Record<string, StatRecord>,
  badgeCounts: Record<string, number>,
  unlockedBadges: string[]
): number => {
  const isUnlocked = unlockedBadges.includes(badge.id);
  if (!isUnlocked) return 0;

  const storedCount = badgeCounts[badge.id] || 0;
  const totalDogru = Object.values(stats).reduce((acc, curr) => acc + curr.dogru, 0);

  if (badge.id === 'ilk_dogru') {
    return Math.max(1, storedCount, totalDogru);
  }
  if (badge.id === 'soru_25') {
    return Math.max(1, storedCount, Math.floor(totalDogru / 25));
  }
  if (badge.id === 'kupa_bronz') {
    return Math.max(1, storedCount, Math.floor(totalDogru / 15));
  }
  if (badge.id === 'kupa_gumus') {
    return Math.max(1, storedCount, Math.floor(totalDogru / 40));
  }
  if (badge.id === 'kupa_altin') {
    return Math.max(1, storedCount, Math.floor(totalDogru / 80));
  }
  if (badge.id === 'uzman_yuzde') {
    const flawlessCount = Object.values(stats).filter(s => s.dogru >= 5 && s.yanlis === 0).length;
    return Math.max(1, storedCount, flawlessCount);
  }
  if (badge.id === 'kupa_elmas') {
    return Math.max(1, storedCount, Math.floor(unlockedBadges.length / 5));
  }

  // For streak badges & wins (seri_3, seri_5, seri_7, tam_puan, kusursuz)
  return Math.max(1, storedCount);
};

