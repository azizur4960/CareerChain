import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 mb-6">
        <span className="text-3xl font-extrabold">404</span>
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-xs text-slate-500 max-w-sm">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
