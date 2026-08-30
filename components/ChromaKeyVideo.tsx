import React, { useRef, useEffect, useState } from 'react';

interface ChromaKeyVideoProps {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  enableChromaKey?: boolean;
  showControls?: boolean;
  className?: string;
}

export const ChromaKeyVideo: React.FC<ChromaKeyVideoProps> = ({
  src,
  autoPlay = true,
  loop = true,
  muted = true,
  enableChromaKey = false,
  showControls = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-amber-500/10 border-2 border-dashed border-amber-400/40 rounded-2xl text-amber-200 text-xs font-bold ${className}`}>
        <span className="text-3xl mb-1 animate-bounce">🦁✨</span>
        <span>Harika İş Çıkardın!</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      controls={showControls}
      onError={() => setHasError(true)}
      className={`object-contain ${className}`}
    />
  );
};
