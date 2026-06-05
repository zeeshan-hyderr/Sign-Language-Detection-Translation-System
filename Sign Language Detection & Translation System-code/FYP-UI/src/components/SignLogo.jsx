function SignLogo({ size = 80, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M18 50 C15 45, 12 35, 20 28 C24 24, 28 30, 26 35 L30 25 C32 20, 38 22, 36 28 L39 22 C41 17, 47 19, 45 25 L47 22 C49 17, 55 19, 52 26 L50 40 C52 36, 58 36, 57 42 C56 50, 48 58, 38 58 C28 58, 18 55, 18 50Z" fill="#00D4FF" opacity="0.9" />
      <path d="M62 50 C65 45, 68 35, 60 28 C56 24, 52 30, 54 35 L50 25 C48 20, 42 22, 44 28 L41 22 C39 17, 33 19, 35 25 L33 22 C31 17, 25 19, 28 26 L30 40 C28 36, 22 36, 23 42 C24 50, 32 58, 42 58 C52 58, 62 55, 62 50Z" fill="#1E6FFF" opacity="0.9" />
      <line x1="40" y1="10" x2="40" y2="20" stroke="#00D4FF" strokeWidth="2" strokeDasharray="3 2" />
      <line x1="30" y1="12" x2="33" y2="22" stroke="#00D4FF" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <line x1="50" y1="12" x2="47" y2="22" stroke="#00D4FF" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
    </svg>
  )
}

export default SignLogo
