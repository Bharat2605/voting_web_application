export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink/50">
      <div className="w-8 h-8 border-2 border-ink/20 border-t-ballot rounded-full animate-spin" />
      <p className="text-sm tracking-wide">{label}&hellip;</p>
    </div>
  );
}
