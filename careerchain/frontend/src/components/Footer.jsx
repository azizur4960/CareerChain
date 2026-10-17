import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import careerChainLogo from '../assets/careerchain-logo.svg';

const Footer = () => {
  const { isAuthenticated, role } = useAuth();
  const dashboardPaths = {
    STUDENT: '/student/feed',
    ALUMNI: '/alumni/feed',
    ADMIN: '/admin/feed',
  };

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="flex flex-col gap-2">
          <Link to={dashboardPaths[role] || '/'} aria-label="CareerChain home" className="inline-flex w-fit rounded-md focus-visible:outline-offset-4">
            <img src={careerChainLogo} alt="CareerChain — Daffodil International University" className="h-12 w-auto max-w-[190px] object-contain" />
          </Link>
          <p className="text-xs text-slate-500">Daffodil International University career community</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
          <Link to="/about" className="hover:text-indigo-800">About</Link>
          {isAuthenticated ? (
            <Link to={dashboardPaths[role] || '/'} className="hover:text-indigo-800">News Feed</Link>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-800">Sign in</Link>
              <Link to="/register" className="hover:text-indigo-800">Create account</Link>
            </>
          )}
        </nav>
        <p className="text-[11px] text-slate-500">Academic capstone project · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
