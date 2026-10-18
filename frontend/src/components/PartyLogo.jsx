// Shows the party logo, or the party's first letter when there is no logo.
export default function PartyLogo({ src, party = '', size = 40 }) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={`${party} logo`}
        style={style}
        className="object-contain shrink-0 rounded-sm border border-line bg-white"
      />
    );
  }

  return (
    <span
      style={style}
      className="shrink-0 rounded-sm border border-line bg-ink/5 text-ink/40 flex items-center justify-center text-sm font-serif"
    >
      {party.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}