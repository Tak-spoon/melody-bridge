import React, { useRef, useState, useEffect } from 'react';

interface TickerTextProps {
  text: string;
  className?: string;
  speed?: number; // ピクセル/秒（小さいほどゆっくり）
}

export const TickerText: React.FC<TickerTextProps> = ({
  text,
  className = '',
  speed = 18, // ゆったりと落ち着いた速度
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState<number>(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !textRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        setOverflowDistance(textWidth - containerWidth + 12);
      } else {
        setOverflowDistance(0);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  if (overflowDistance <= 0) {
    return (
      <div ref={containerRef} className="overflow-hidden whitespace-nowrap min-w-0 flex-1">
        <span ref={textRef} className={`inline-block ${className}`}>
          {text}
        </span>
      </div>
    );
  }

  // スクロールにかかる時間を計算
  const scrollDuration = overflowDistance / speed;
  const totalDuration = Math.max(6, scrollDuration + 4); // 静止時間を考慮
  const animKey = `ticker-anim-${Math.round(overflowDistance)}`;

  return (
    <div ref={containerRef} className="overflow-hidden whitespace-nowrap min-w-0 flex-1 relative">
      <style>{`
        @keyframes ${animKey} {
          0%, 18% {
            transform: translateX(0);
          }
          76%, 95% {
            transform: translateX(-${overflowDistance}px);
          }
          95.01%, 100% {
            transform: translateX(0);
          }
        }
      `}</style>
      <span
        ref={textRef}
        key={text}
        className={`inline-block will-change-transform ${className}`}
        style={{
          animation: `${animKey} ${totalDuration.toFixed(1)}s linear infinite`,
        }}
      >
        {text}
      </span>
    </div>
  );
};
