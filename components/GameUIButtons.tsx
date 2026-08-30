import React from 'react';
import { RotateCw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Award, Star, Coins } from 'lucide-react';

export const GlossyScreenRotateIcon: React.FC<{ isLandscape?: boolean; size?: number }> = ({ isLandscape = false, size = 20 }) => {
  return (
    <div className="inline-flex items-center justify-center filter drop-shadow-sm">
      <RotateCw size={size} className={`transition-transform duration-500 ${isLandscape ? 'rotate-90 text-amber-300' : 'text-white'}`} />
    </div>
  );
};

export const GlossyRoundButton: React.FC<{
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}> = ({
  children,
  onClick,
  className = '',
  title,
  disabled = false,
  size = 'md',
  variant = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base'
  }[size];

  const variantGradients = {
    blue: 'from-sky-400 via-blue-500 to-indigo-600 border-blue-200 shadow-blue-900/50',
    green: 'from-emerald-400 via-green-500 to-teal-600 border-green-200 shadow-green-900/50',
    amber: 'from-amber-300 via-yellow-400 to-amber-500 border-yellow-100 shadow-amber-900/50 text-slate-900',
    red: 'from-rose-400 via-red-500 to-pink-600 border-rose-200 shadow-red-900/50',
    purple: 'from-violet-400 via-purple-500 to-indigo-700 border-purple-200 shadow-purple-900/50'
  }[variant];

  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`relative group rounded-full bg-gradient-to-b ${variantGradients} border-2 sm:border-3 text-white font-black flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer select-none overflow-hidden ${sizeClasses} ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full pointer-events-none" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const GlossyPillButton: React.FC<{
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'blue'
}) => {
  const variantGradients = {
    blue: 'from-sky-500 via-blue-600 to-indigo-700 border-sky-300 text-white',
    green: 'from-emerald-500 via-green-600 to-teal-700 border-emerald-300 text-white',
    amber: 'from-amber-400 via-yellow-400 to-amber-500 border-yellow-200 text-slate-950',
    red: 'from-rose-500 via-red-600 to-pink-700 border-rose-300 text-white',
    purple: 'from-violet-500 via-purple-600 to-indigo-800 border-purple-300 text-white'
  }[variant];

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative group px-4 py-2 rounded-full bg-gradient-to-b ${variantGradients} border-2 shadow-[0_5px_0_rgba(0,0,0,0.25),0_8px_16px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-sm font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  );
};

export const GlossyArrowIcon: React.FC<{ direction?: 'left' | 'right' | 'up' | 'down'; size?: number }> = ({ direction = 'right', size = 18 }) => {
  switch (direction) {
    case 'left': return <ArrowLeft size={size} />;
    case 'up': return <ArrowUp size={size} />;
    case 'down': return <ArrowDown size={size} />;
    case 'right':
    default:
      return <ArrowRight size={size} />;
  }
};

export const GlossyCompleteCard: React.FC<{
  title: string;
  subtitle: string;
  starsCount?: number;
}> = ({ title, subtitle, starsCount = 3 }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto p-4 rounded-3xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 border-4 border-yellow-200 shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,255,255,0.8)] text-center text-slate-950 overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-3xl" />
      
      {/* Stars Header */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3].map((star) => (
          <div
            key={star}
            className={`transition-all transform ${
              star <= starsCount
                ? 'text-yellow-100 scale-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)] animate-bounce'
                : 'text-amber-700/60 scale-90'
            }`}
          >
            <Star size={star === 2 ? 34 : 26} fill="currentColor" />
          </div>
        ))}
      </div>

      <h2 className="relative z-10 text-lg sm:text-xl font-black uppercase tracking-wider text-slate-950 drop-shadow-sm">
        {title}
      </h2>
      <p className="relative z-10 text-xs sm:text-sm font-extrabold text-amber-950 mt-1">
        {subtitle}
      </p>
    </div>
  );
};

export const GoldCoinDisplayCard: React.FC<{
  sessionCoins: number;
  totalCoins: number;
  compact?: boolean;
}> = ({ sessionCoins, totalCoins, compact = false }) => {
  return (
    <div className={`relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/80 border-2 border-amber-400/80 rounded-full ${compact ? 'px-3 py-1 text-xs' : 'px-5 py-2 text-sm'} shadow-lg text-amber-300 font-black backdrop-blur-md`}>
      <div className="flex items-center gap-1.5 text-yellow-300">
        <Coins size={compact ? 16 : 20} className="text-yellow-400 animate-pulse" />
        <span>+{sessionCoins} Altın</span>
      </div>
      <span className="text-amber-500/60">|</span>
      <div className="flex items-center gap-1 text-amber-100">
        <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Kasa:</span>
        <span>{totalCoins}</span>
      </div>
    </div>
  );
};
