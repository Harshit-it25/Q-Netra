import React from 'react';

interface IndiaFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IndiaFlag: React.FC<IndiaFlagProps> = ({ className = '', size = 'md' }) => {
  const dimensions =
    size === 'sm'
      ? 'w-4 h-2.5'
      : size === 'lg'
      ? 'w-6 h-4'
      : 'w-5 h-3.5';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-xs overflow-hidden border border-white/20 shadow-xs ${dimensions} ${className}`}
      title="India"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 16"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top band: Saffron */}
        <rect width="24" height="5.33" fill="#FF9933" />
        {/* Middle band: White */}
        <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
        {/* Bottom band: India Green */}
        <rect y="10.67" width="24" height="5.33" fill="#138808" />
        {/* Ashoka Chakra in center */}
        <circle cx="12" cy="8" r="2.2" fill="none" stroke="#000088" strokeWidth="0.5" />
        <circle cx="12" cy="8" r="0.6" fill="#000088" />
        {/* Chakra spokes */}
        <path
          d="M12 5.8 L12 10.2 M9.8 8 L14.2 8 M10.4 6.4 L13.6 9.6 M10.4 9.6 L13.6 6.4"
          stroke="#000088"
          strokeWidth="0.3"
        />
      </svg>
    </span>
  );
};
