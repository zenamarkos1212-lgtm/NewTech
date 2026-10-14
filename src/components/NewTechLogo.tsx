import React from 'react';

interface NewTechLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const NewTechLogo: React.FC<NewTechLogoProps> = ({
  size = 48,
  className = '',
  glow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full flex-shrink-0 select-none ${
        glow ? 'shadow-[0_0_24px_rgba(245,158,11,0.45)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="screws-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Black Leather Disc */}
        <circle cx="250" cy="250" r="244" fill="#070707" stroke="#161616" strokeWidth="2" />

        {/* Outer Stitched Dashed Gold Border */}
        <circle
          cx="250"
          cy="250"
          r="234"
          fill="none"
          stroke="#eab308"
          strokeWidth="4.5"
          strokeDasharray="9 7"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Inner Solid Gold Concentric Circle */}
        <circle
          cx="250"
          cy="250"
          r="194"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3.5"
          opacity="0.9"
        />

        {/* Subtle Background Radial Center Glow */}
        <circle cx="250" cy="245" r="140" fill="url(#screws-glow)" opacity="0.25" />

        {/* Center Monogram Graphics: Gold/Yellow T Top Bar & TN/M Wings */}
        <g id="newtech-emblem" fill="#f59e0b">
          {/* Top T-Bar with beveled corners */}
          <path
            d="M 148 152 L 352 152 L 340 182 L 160 182 Z"
            fill="#eab308"
          />

          {/* Left Wing Pillar */}
          <path
            d="M 148 194 L 194 194 L 194 330 L 148 348 Z"
            fill="#f59e0b"
          />

          {/* Right Wing Pillar */}
          <path
            d="M 306 194 L 352 194 L 352 348 L 306 330 Z"
            fill="#f59e0b"
          />

          {/* Left Diagonal Chevron */}
          <path
            d="M 194 252 L 232 284 L 208 304 L 194 290 Z"
            fill="#d97706"
          />

          {/* Right Diagonal Chevron */}
          <path
            d="M 268 284 L 306 252 L 306 290 L 292 304 Z"
            fill="#d97706"
          />
        </g>

        {/* Center Vertical Technician Screwdriver Icon */}
        <g id="center-screwdriver" filter="url(#gold-glow)">
          {/* Screwdriver Handle Top Cap */}
          <path
            d="M 236 178 Q 250 174 264 178 L 268 184 L 232 184 Z"
            fill="#facc15"
          />

          {/* Ribbed Handle Body */}
          <rect
            x="233"
            y="184"
            width="34"
            height="52"
            rx="5"
            fill="#eab308"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          {/* Vertical Ribs on handle */}
          <line x1="242" y1="187" x2="242" y2="233" stroke="#854d0e" strokeWidth="2" />
          <line x1="250" y1="187" x2="250" y2="233" stroke="#854d0e" strokeWidth="2.2" />
          <line x1="258" y1="187" x2="258" y2="233" stroke="#854d0e" strokeWidth="2" />

          {/* Collar / Tapered Neck */}
          <polygon points="239,236 261,236 257,246 243,246" fill="#ca8a04" />

          {/* Screwdriver Metallic Shaft */}
          <rect
            x="246"
            y="246"
            width="8"
            height="86"
            rx="1.5"
            fill="#fef08a"
            stroke="#ca8a04"
            strokeWidth="1"
          />

          {/* Pointed Flathead Tip */}
          <polygon
            points="246,332 254,332 252,352 248,352"
            fill="#f59e0b"
          />
        </g>
      </svg>
    </div>
  );
};
