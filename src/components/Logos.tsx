import React from "react";

interface LogoProps {
  className?: string;
  color?: string; // Optional custom color to override brand color
}

export function DocflixLogo({ className = "h-10", color }: LogoProps) {
  const primaryColor = color || "#e13d3d"; // Red color

  return (
    <svg
      id="docflix-logo-svg"
      viewBox="0 0 320 80"
      className={`${className} select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red Stylized "D" with Stethoscope */}
      <g>
        {/* The Outer "D" boundary */}
        <path
          d="M 12 8 C 12 4.7 14.7 2 18 2 L 40 2 C 58 2 72 16.2 72 34 C 72 51.8 58 66 40 66 L 18 66 C 14.7 66 12 63.3 12 60 L 12 8 Z"
          stroke={primaryColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stethoscope Binaural Headset (inside upper D) */}
        <path
          d="M 28 22 C 28 17 32 17 34 17 C 36 17 40 17 40 22"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 28 22 L 28 28 C 28 36 40 36 40 28 L 40 22"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stethoscope Tubing extension */}
        <path
          d="M 34 32 L 34 46"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Loop to chest piece at bottom right */}
        <path
          d="M 34 46 C 34 56 46 56 46 46"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Chestpiece Diaphragm (Circle with inner dot) */}
        <circle cx="46" cy="46" r="6" fill={primaryColor} />
        <circle cx="46" cy="46" r="2" fill="#000000" />
      </g>

      {/* "Docflix" Text in elegant sans-serif */}
      <text
        x="90"
        y="45"
        fill="#FFFFFF"
        fontSize="28"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1.5"
      >
        DOCFLIX
      </text>
      
      {/* Mini "OTT" badge */}
      <rect x="250" y="24" width="34" height="16" rx="3" fill="#D4AF37" />
      <text
        x="267"
        y="36"
        fill="#000000"
        fontSize="10"
        fontWeight="900"
        fontFamily="monospace"
        textAnchor="middle"
      >
        OTT
      </text>
    </svg>
  );
}

export function MankindLogo({ className = "h-10", color }: LogoProps) {
  const brandBlue = color || "#005691";

  return (
    <svg
      id="mankind-logo-svg"
      viewBox="0 0 350 110"
      className={`${className} select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brand Icon Oval */}
      <ellipse
        cx="145"
        cy="28"
        rx="64"
        ry="25"
        stroke={brandBlue}
        strokeWidth="5"
      />
      
      {/* Stylized white 'm' inside the oval */}
      <path
        d="M 105 32 C 110 24, 115 15, 122 17 C 128 19, 126 31, 133 31 C 139 31, 142 18, 148 18 C 153 18, 153 28, 159 28 C 165 28, 170 18, 175 22"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Upward diagonal arrow cutting out of the oval */}
      <path
        d="M 148 26 L 245 -22"
        stroke={brandBlue}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 226 -22 L 245 -22 L 245 -3"
        stroke={brandBlue}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mankind Corporate Text */}
      <text
        x="10"
        y="80"
        fill={brandBlue}
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        Mankind
      </text>

      {/* Slashes (four vertical slashes) */}
      <path
        d="M 216 60 L 210 80 M 224 60 L 218 80 M 232 60 L 226 80 M 240 60 L 234 80"
        stroke={brandBlue}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Play-button right-pointing triangle */}
      <path
        d="M 252 59 L 285 70 L 252 81 Z"
        fill={brandBlue}
      />

      {/* "Serving Life" Subtext */}
      <text
        x="64"
        y="102"
        fill="#3ca0e6"
        fontSize="17"
        fontWeight="500"
        fontStyle="italic"
        fontFamily="Georgia, serif"
        letterSpacing="0.5"
      >
        Serving Life
      </text>
    </svg>
  );
}
