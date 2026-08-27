// Ícono LSA — PNG blanco sobre negro. mix-blend-screen hace el negro transparente.
// Usar siempre sobre fondos oscuros/de color (red, gray-900, etc.).
const LSA_HAND_SRC = `${import.meta.env.BASE_URL}icons/lsa-hand.png`;

export function LSAHandIcon({
  className,
  strokeWidth: _sw,
  onDark = true,
  decorative = true,
}: {
  className?: string;
  strokeWidth?: number;
  onDark?: boolean;
  decorative?: boolean;
}) {
  return (
    <img
      src={LSA_HAND_SRC}
      alt={decorative ? '' : 'Lengua de Señas Argentina'}
      className={`object-contain -rotate-[30deg] scale-[1.8] ${
        onDark ? 'mix-blend-screen' : 'invert grayscale opacity-60'
      } ${className ?? ''}`}
    />
  );
}
