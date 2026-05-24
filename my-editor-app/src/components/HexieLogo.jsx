export default function HexieLogo({ size = 80, className = '' }) {
  return (
    <img
      src="/hexie-logo.svg"
      alt="Hexie logo"
      width={size}
      height={size}
      className={className}
      style={{ filter: 'drop-shadow(0 0 12px rgba(0, 245, 255, 0.5))' }}
    />
  );
}
