'use client';

type RadarScannerProps = {
  active?: boolean;
  scanning?: boolean;
  size?: number;
};

export default function RadarScanner({ active = true, scanning = false, size = 112 }: RadarScannerProps) {
  const pulseDuration = scanning ? '1.2s' : '2.4s';
  const sweepDuration = scanning ? '1.5s' : '3s';
  return (
    <div
      className="relative shrink-0 mx-auto"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full border border-[#8f4a54]/25"
        style={{ background: 'radial-gradient(circle, rgba(143,74,84,0.12) 0%, transparent 70%)' }}
      />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`absolute inset-0 rounded-full border-2 border-[#8f4a54]/40 ${active ? 'animate-radar-pulse' : ''}`}
          style={{
            animationDelay: active ? `${i * (scanning ? 0.4 : 0.9)}s` : undefined,
            animationDuration: active ? pulseDuration : undefined,
          }}
        />
      ))}
      <div
        className={`absolute left-1/2 top-1/2 h-full w-full ${active ? 'animate-radar-sweep' : ''}`}
        style={{ animationDuration: active ? sweepDuration : undefined }}
      >
        <span className="absolute left-1/2 top-1/2 h-[46%] w-0.5 -translate-x-1/2 origin-bottom rounded-full bg-gradient-to-t from-[#8f4a54] via-[#8f4a54]/40 to-transparent" />
      </div>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg"
        style={{ backgroundColor: '#8f4a54' }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.5" fill="currentColor" />
        </svg>
      </div>
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c84a] shadow-sm" />
    </div>
  );
}
