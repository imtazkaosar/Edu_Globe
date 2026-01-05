const Logo = ({ w = 200, h = 60, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={w}
    height={h}
    viewBox="0 0 500 150"
    {...props}
  >
    {/* Blue icon background */}
    <rect x="0" y="15" width="120" height="120" rx="15" fill="#1E5A8E" />

    {/* Graduation cap */}
    <path
      d="M 60 35 L 30 45 L 30 50 L 60 60 L 90 50 L 90 45 Z"
      fill="#fff"
    />
    <rect x="87" y="50" width="6" height="25" fill="#fff" />
    <circle cx="90" cy="77" r="4" fill="#fff" />

    {/* Globe */}
    <circle cx="60" cy="85" r="25" fill="none" stroke="#fff" strokeWidth="3" />
    
    {/* Globe latitude lines */}
    <ellipse cx="60" cy="85" rx="25" ry="8" fill="none" stroke="#fff" strokeWidth="2" />
    <ellipse cx="60" cy="85" rx="25" ry="15" fill="none" stroke="#fff" strokeWidth="2" />
    
    {/* Globe longitude line */}
    <path
      d="M 60 60 Q 50 85 60 110"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
    />
    <path
      d="M 60 60 Q 70 85 60 110"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
    />

    {/* Text: Eduglobe */}
    <text
      x="140"
      y="90"
      fontSize="48"
      fontWeight="bold"
      fill="#1E5A8E"
      fontFamily="Arial, sans-serif"
    >
      Eduglobe
    </text>
  </svg>
);

export default Logo;