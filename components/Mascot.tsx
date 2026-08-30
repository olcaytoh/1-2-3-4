import React from 'react';

export const AslanSVG: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 48 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="45" fill="#F59E0B" />
      <circle cx="50" cy="52" r="35" fill="#FBBF24" />
      <circle cx="38" cy="46" r="6" fill="#1E293B" />
      <circle cx="62" cy="46" r="6" fill="#1E293B" />
      <circle cx="36" cy="44" r="2" fill="#FFFFFF" />
      <circle cx="60" cy="44" r="2" fill="#FFFFFF" />
      <path d="M44 56 C47 60, 53 60, 56 56" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="28" r="12" fill="#D97706" />
      <circle cx="80" cy="28" r="12" fill="#D97706" />
      <circle cx="20" cy="28" r="7" fill="#FDE68A" />
      <circle cx="80" cy="28" r="7" fill="#FDE68A" />
      <ellipse cx="50" cy="54" rx="5" ry="3" fill="#B45309" />
    </svg>
  );
};
