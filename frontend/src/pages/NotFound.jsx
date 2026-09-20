import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      <p className="font-serif text-6xl text-ballot mb-4">404</p>
      <h1 className="font-serif text-2xl mb-2">Page not found</h1>
      <p className="text-ink/50 text-sm mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-outline">Back to candidates</Link>
    </div>
  );
}
