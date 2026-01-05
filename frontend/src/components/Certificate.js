import React from 'react';

const Certificate = ({ studentName, courseName, date }) => {
  // Use current date if not provided
  const certificateDate = date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <svg
      id="certificate-svg"
      viewBox="0 0 1000 700"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fcd34d', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b45309', stopOpacity: 1 }} />
        </linearGradient>

        <pattern id="watermark" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse" opacity="0.03">
          <text x="100" y="100" fontFamily="serif" fontSize="60" fill="#1e40af" textAnchor="middle" transform="rotate(-45 100 100)">CERTIFIED</text>
        </pattern>
      </defs>

      {/* Background */}
      <rect width="1000" height="700" fill="#fefcf9" />
      <rect width="1000" height="700" fill="url(#watermark)" />
      
      {/* Decorative borders */}
      <rect x="40" y="40" width="920" height="620" fill="none" stroke="url(#borderGradient)" strokeWidth="3" />
      <rect x="50" y="50" width="900" height="600" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />
      <rect x="55" y="55" width="890" height="590" fill="none" stroke="#d4af37" strokeWidth="1" />
      
      {/* Corner ornaments */}
      <g>
        {/* Top-left ornament */}
        <path d="M 60 60 L 120 60 L 60 120 Z" fill="url(#goldGradient)" opacity="0.3" />
        <path d="M 70 70 Q 80 70 80 80 Q 80 90 70 90" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        
        {/* Top-right ornament */}
        <path d="M 940 60 L 880 60 L 940 120 Z" fill="url(#goldGradient)" opacity="0.3" />
        <path d="M 930 70 Q 920 70 920 80 Q 920 90 930 90" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        
        {/* Bottom-left ornament */}
        <path d="M 60 640 L 120 640 L 60 580 Z" fill="url(#goldGradient)" opacity="0.3" />
        <path d="M 70 630 Q 80 630 80 620 Q 80 610 70 610" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        
        {/* Bottom-right ornament */}
        <path d="M 940 640 L 880 640 L 940 580 Z" fill="url(#goldGradient)" opacity="0.3" />
        <path d="M 930 630 Q 920 630 920 620 Q 920 610 930 610" fill="none" stroke="#d4af37" strokeWidth="1.5" />
      </g>

      {/* Header emblem */}
      <g transform="translate(500, 100)">
        {/* Shield background */}
        <path d="M 0 -35 L 25 -30 L 25 0 Q 25 20 0 35 Q -25 20 -25 0 L -25 -30 Z" 
              fill="url(#goldGradient)" stroke="#92400e" strokeWidth="2" />
        <path d="M 0 -30 L 20 -25 L 20 0 Q 20 17 0 30 Q -20 17 -20 0 L -20 -25 Z" 
              fill="#fef3c7" />
        
        {/* Star inside shield */}
        <path d="M 0 -15 L 4 -5 L 15 -5 L 6 2 L 10 12 L 0 6 L -10 12 L -6 2 L -15 -5 L -4 -5 Z" 
              fill="url(#goldGradient)" stroke="#92400e" strokeWidth="1" />
        
        {/* Ribbon */}
        <path d="M -30 10 Q -30 20 -20 25 L 0 30 L 20 25 Q 30 20 30 10" 
              fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
      </g>

      {/* Title */}
      <text x="500" y="180" fontFamily="Georgia, serif" fontSize="42" fontWeight="bold" 
            fill="#1e3a8a" textAnchor="middle" letterSpacing="4">
        CERTIFICATE
      </text>
      <text x="500" y="210" fontFamily="Georgia, serif" fontSize="20" 
            fill="#1e3a8a" textAnchor="middle" letterSpacing="8">
        OF COMPLETION
      </text>
      
      {/* Decorative line under title */}
      <line x1="350" y1="225" x2="650" y2="225" stroke="url(#goldGradient)" strokeWidth="2" />
      <line x1="360" y1="228" x2="640" y2="228" stroke="#d4af37" strokeWidth="1" />

      {/* Certification text */}
      <text x="500" y="270" fontFamily="Georgia, serif" fontSize="18" 
            fill="#374151" textAnchor="middle" fontStyle="italic">
        This is to certify that
      </text>

      {/* Student name */}
      <text x="500" y="330" fontFamily="'Brush Script MT', cursive, Georgia, serif" fontSize="54" 
            fontWeight="bold" fill="#1e293b" textAnchor="middle">
        {studentName || 'Student Name'}
      </text>
      
      <line x1="200" y1="345" x2="800" y2="345" stroke="#d4af37" strokeWidth="1.5" />

      {/* Achievement text */}
      <text x="500" y="390" fontFamily="Georgia, serif" fontSize="17" 
            fill="#374151" textAnchor="middle">
        has successfully completed the course
      </text>

      {/* Course name */}
      <text x="500" y="445" fontFamily="Georgia, serif" fontSize="36" fontWeight="bold" 
            fill="#1e3a8a" textAnchor="middle">
        {courseName || 'Course Name'}
      </text>
      
      {/* Decorative line under course */}
      <line x1="250" y1="460" x2="750" y2="460" stroke="#d4af37" strokeWidth="1" opacity="0.5" />

      {/* Date */}
      <text x="500" y="500" fontFamily="Georgia, serif" fontSize="16" 
            fill="#374151" textAnchor="middle">
        Awarded on {certificateDate}
      </text>

      {/* Left signature - Director */}
      <g transform="translate(180, 550)">
        {/* Signature line */}
        <line x1="0" y1="0" x2="200" y2="0" stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Handwritten signature */}
        <path d="M 30 -25 Q 50 -35 70 -20 Q 90 -5 100 -15 Q 115 -30 130 -15 Q 140 -5 150 -20" 
              stroke="#1e40af" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 50 -20 Q 55 -10 60 -15 L 65 -25" 
              stroke="#1e40af" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Name and title */}
        <text x="100" y="20" fontFamily="Georgia, serif" fontSize="16" fontWeight="600" 
              fill="#1e293b" textAnchor="middle">
          Dr. Sarah Johnson
        </text>
        <text x="100" y="38" fontFamily="Georgia, serif" fontSize="13" 
              fill="#6b7280" textAnchor="middle">
          Director of Education
        </text>
      </g>

      {/* Right signature - Instructor */}
      <g transform="translate(620, 550)">
        {/* Signature line */}
        <line x1="0" y1="0" x2="200" y2="0" stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Handwritten signature */}
        <path d="M 35 -20 Q 55 -10 75 -25 Q 95 -40 115 -25 Q 130 -15 145 -25 Q 155 -30 165 -20" 
              stroke="#1e40af" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 80 -22 L 85 -12 Q 90 -18 95 -15" 
              stroke="#1e40af" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Name and title */}
        <text x="100" y="20" fontFamily="Georgia, serif" fontSize="16" fontWeight="600" 
              fill="#1e293b" textAnchor="middle">
          Prof. Michael Chen
        </text>
        <text x="100" y="38" fontFamily="Georgia, serif" fontSize="13" 
              fill="#6b7280" textAnchor="middle">
          Course Instructor
        </text>
      </g>

      {/* Official seal */}
      <g transform="translate(500, 570)">
        {/* Outer circle with gold gradient */}
        <circle cx="0" cy="0" r="45" fill="url(#goldGradient)" />
        <circle cx="0" cy="0" r="42" fill="#fef3c7" />
        
        {/* Inner decorative circles */}
        <circle cx="0" cy="0" r="38" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="32" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,2" />
        
        {/* Star in center */}
        <path d="M 0 -18 L 5 -6 L 18 -6 L 8 2 L 13 14 L 0 7 L -13 14 L -8 2 L -18 -6 L -5 -6 Z" 
              fill="#1e3a8a" />
        
        {/* Text around seal */}
        <text x="0" y="-22" fontFamily="Georgia, serif" fontSize="11" fontWeight="bold" 
              fill="#1e3a8a" textAnchor="middle">
          OFFICIAL
        </text>
        <text x="0" y="28" fontFamily="Georgia, serif" fontSize="10" fontWeight="bold" 
              fill="#1e3a8a" textAnchor="middle">
          CERTIFICATION
        </text>
      </g>
    </svg>
  );
};

export default Certificate;