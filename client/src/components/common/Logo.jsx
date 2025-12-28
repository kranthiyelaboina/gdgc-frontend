const Logo = ({ width = 300, height = 120 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="left-bracket">
        <rect
          x="10"
          y="10"
          width="80"
          height="35"
          rx="25"
          fill="#ea4335"
          stroke="#000000"
          strokeWidth="4"
        />
        <rect
          x="10"
          y="55"
          width="80"
          height="35"
          rx="25"
          fill="#4285f4"
          stroke="#000000"
          strokeWidth="4"
        />
      </g>
      
      <g id="right-bracket">
        <rect
          x="210"
          y="10"
          width="80"
          height="35"
          rx="25"
          fill="#34a853"
          stroke="#000000"
          strokeWidth="4"
        />
        <rect
          x="210"
          y="55"
          width="80"
          height="35"
          rx="25"
          fill="#f9ab00"
          stroke="#000000"
          strokeWidth="4"
        />
      </g>
      
      <text
        x="150"
        y="115"
        fontFamily="Poppins, sans-serif"
        fontWeight="700"
        fontSize="48"
        fill="#000000"
        textAnchor="middle"
        letterSpacing="-1"
      >
        GDGC IARE
      </text>
    </svg>
  );
};

export default Logo;
