import React, { useState } from 'react';
import { Trophy, Award, Flame, Star, RotateCcw, X, CheckCircle, XCircle, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';
import { StatRecord, GroupStatsRecord, GroupInfoStat, QuestionData } from '../types';
import { BADGES } from '../badges';

export const Cute3DStarMascotSVG: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 36 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 5 L61 35 L95 38 L69 60 L77 93 L50 75 L23 93 L31 60 L5 38 L39 35 Z"
        fill="url(#starGrad)"
        stroke="#FDE047"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="45" r="5" fill="#1E293B" />
      <circle cx="60" cy="45" r="5" fill="#1E293B" />
      <circle cx="38" cy="43" r="1.5" fill="#FFFFFF" />
      <circle cx="58" cy="43" r="1.5" fill="#FFFFFF" />
      <path d="M43 54 Q50 60 57 54" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="starGrad" x1="50" y1="5" x2="50" y2="93" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface ModernStatsViewProps {
  statsData: Record<string, StatRecord>;
  groupStatsData?: GroupStatsRecord;
  topics: Record<string, { title: string; desc: string; generate: () => QuestionData }>;
  openedTopics: string[];
  unlockedBadges: string[];
  badgeCounts: Record<string, number>;
  playerLevel: {
    level: number;
    title: string;
    icon: string;
    target?: number;
    currentExp?: number;
    progressPercent?: number;
  };
  streak: number;
  onSelectTopic: (key: string) => void;
  onResetStats: () => void;
  confirmReset: boolean;
  setConfirmReset: (val: boolean) => void;
  onClose: () => void;
}

export const ModernStatsView: React.FC<ModernStatsViewProps> = ({
  statsData,
  groupStatsData,
  topics,
  openedTopics,
  unlockedBadges,
  badgeCounts,
  playerLevel,
  streak,
  onSelectTopic,
  onResetStats,
  confirmReset,
  setConfirmReset,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'badges' | 'groups'>('topics');

  const statsList = Object.values(statsData) as StatRecord[];
  const totalDogru = statsList.reduce((acc, curr) => acc + (curr.dogru || 0), 0);
  const totalYanlis = statsList.reduce((acc, curr) => acc + (curr.yanlis || 0), 0);
  const totalSorular = totalDogru + totalYanlis;
  const basariYuzdesi = totalSorular > 0 ? Math.round((totalDogru / totalSorular) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-3 border-amber-400/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border-b-2 border-amber-400/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cute3DStarMascotSVG size={36} />
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-amber-300 uppercase tracking-wide">
                Gelişim ve Başarı Karnesi
              </h2>
              <p className="text-[11px] sm:text-xs text-blue-200">
                Seviye: <span className="text-yellow-300 font-bold">{playerLevel.title} (Sv. {playerLevel.level})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Level & Metric Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/70 border-b border-indigo-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-emerald-300 font-bold uppercase">Toplam Doğru</span>
            <span className="text-lg sm:text-xl font-black text-white">{totalDogru}</span>
          </div>
          <div className="bg-rose-950/70 border border-rose-500/40 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-rose-300 font-bold uppercase">Toplam Yanlış</span>
            <span className="text-lg sm:text-xl font-black text-white">{totalYanlis}</span>
          </div>
          <div className="bg-amber-950/70 border border-amber-500/40 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase">Başarı Oranı</span>
            <span className="text-lg sm:text-xl font-black text-amber-300">%{basariYuzdesi}</span>
          </div>
          <div className="bg-purple-950/70 border border-purple-500/40 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-purple-300 font-bold uppercase">Kazanılan Rozet</span>
            <span className="text-lg sm:text-xl font-black text-purple-300">{unlockedBadges.length} / {BADGES.length}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 flex items-center gap-2 border-b border-indigo-800/40 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 font-black text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'topics'
                ? 'bg-indigo-800 text-amber-300 border-t-2 border-x-2 border-amber-400 shadow-md'
                : 'text-indigo-300 hover:text-white bg-slate-950/40'
            }`}
          >
            <Target size={16} />
            <span>Konu Başarıları</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 font-black text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'badges'
                ? 'bg-indigo-800 text-amber-300 border-t-2 border-x-2 border-amber-400 shadow-md'
                : 'text-indigo-300 hover:text-white bg-slate-950/40'
            }`}
          >
            <Trophy size={16} />
            <span>Rozet & Kupa Odası ({unlockedBadges.length})</span>
          </button>
          {groupStatsData && Object.keys(groupStatsData).length > 0 && (
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 font-black text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'groups'
                  ? 'bg-indigo-800 text-amber-300 border-t-2 border-x-2 border-amber-400 shadow-md'
                  : 'text-indigo-300 hover:text-white bg-slate-950/40'
              }`}
            >
              <Award size={16} />
              <span>Grup İstatistikleri</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
          {activeTab === 'topics' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.entries(topics) as [string, { title: string; desc: string; generate: () => QuestionData }][]).map(([key, topic]) => {
                const stat = statsData[key] || { dogru: 0, yanlis: 0 };
                const total = stat.dogru + stat.yanlis;
                const pct = total > 0 ? Math.round((stat.dogru / total) * 100) : 0;
                return (
                  <div
                    key={key}
                    className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 flex flex-col justify-between hover:border-amber-400/60 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white truncate" title={topic.title}>
                        {topic.title}
                      </h4>
                      <p className="text-[10px] text-indigo-300 line-clamp-1 mt-0.5">{topic.desc}</p>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                        <span className="text-emerald-400 font-black">+{stat.dogru} Doğru</span>
                        <span className="text-rose-400 font-black">-{stat.yanlis} Yanlış</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BADGES.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                const count = badgeCounts[badge.id] || 0;
                const progress = badge.getProgress ? badge.getProgress(statsData, streak) : { current: isUnlocked ? 1 : 0, total: 1, label: '' };

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-indigo-900/80 to-purple-950/80 border-amber-400/80 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 p-1 ${
                      isUnlocked ? 'bg-amber-400/20 border border-amber-300' : 'bg-slate-800'
                    }`}>
                      {badge.imageSrc ? (
                        <img src={badge.imageSrc} alt={badge.title} className="w-full h-full object-contain filter drop-shadow-md" />
                      ) : (
                        badge.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white truncate">{badge.title}</h4>
                        {count > 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black">
                            x{count}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-indigo-200 line-clamp-1 mt-0.5">{badge.desc}</p>
                      <div className="mt-1 flex items-center justify-between text-[9px] font-bold text-amber-300/80">
                        <span>{badge.conditionText}</span>
                        {progress.label && <span>{progress.label}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'groups' && groupStatsData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.values(groupStatsData) as GroupInfoStat[]).map((group) => (
                <div
                  key={group.id}
                  className="p-4 rounded-2xl bg-indigo-950/70 border-2 border-indigo-700/60 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{group.badge}</span>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">{group.name}</h4>
                      <p className="text-xs text-amber-300 font-bold">🏆 {group.wins} Zafer</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-indigo-800/40 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-emerald-950/60 rounded-lg p-1.5 border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold">Doğru: {group.dogru}</span>
                    </div>
                    <div className="bg-rose-950/60 rounded-lg p-1.5 border border-rose-500/30">
                      <span className="text-rose-400 font-bold">Yanlış: {group.yanlis}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Reset Data */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/90 border-t border-indigo-800/40 flex items-center justify-between">
          <div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-bold">Tüm skorlar silinsin mi?</span>
                <button
                  onClick={onResetStats}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Evet, Sıfırla
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-[11px] text-slate-400 hover:text-rose-400 underline transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>İstatistikleri Sıfırla</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
