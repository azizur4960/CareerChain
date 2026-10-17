import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import careerChainLogo from '../assets/careerchain-logo.svg';

const dashboardPaths = {
  STUDENT: '/student/feed',
  ALUMNI: '/alumni/feed',
  ADMIN: '/admin/feed',
};

const profilePaths = {
  STUDENT: '/student/profile',
  ALUMNI: '/alumni/profile',
  ADMIN: '/admin/dashboard',
};

const AppHeader = ({ onMenuClick }) => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setAccountOpen(false);
    setPublicMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to={isAuthenticated ? (dashboardPaths[role] || '/') : '/'} aria-label="CareerChain home" className="group flex min-w-0 items-center rounded-md focus-visible:outline-offset-4">
            <img src={careerChainLogo} alt="CareerChain — Daffodil International University" className="h-12 w-auto max-w-[190px] object-contain sm:h-14 sm:max-w-[220px]" />
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="relative flex items-center gap-2">
            <span className="hidden text-xs font-medium text-slate-500 sm:block">{role?.toLowerCase()}</span>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((open) => !open)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-left hover:bg-slate-50"
            >
              <UserAvatar user={user} size="small" />
              <span className="hidden max-w-36 truncate text-xs font-semibold text-slate-800 sm:block">{user?.full_name}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </button>
            {accountOpen && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <Link role="menuitem" to={profilePaths[role] || '/'} className="mt-1 flex min-h-10 items-center gap-2 rounded-md px-3 text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <User className="h-4 w-4 text-slate-500" />
                  Profile & account
                </Link>
                <button role="menuitem" type="button" onClick={handleLogout} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-xs font-medium text-rose-700 hover:bg-rose-50">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <nav aria-label="Public navigation" className="hidden items-center gap-5 sm:flex">
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">About</Link>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Sign in</Link>
              <Link to="/register" className="inline-flex min-h-10 items-center rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800">Create account</Link>
            </nav>
            <div className="relative sm:hidden">
              <button type="button" aria-label={publicMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={publicMenuOpen} onClick={() => setPublicMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
                {publicMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              {publicMenuOpen && (
                <nav aria-label="Public navigation" className="absolute right-0 top-full mt-2 flex w-48 flex-col rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                  <Link onClick={() => setPublicMenuOpen(false)} to="/about" className="rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100">About</Link>
                  <Link onClick={() => setPublicMenuOpen(false)} to="/login" className="rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100">Sign in</Link>
                  <Link onClick={() => setPublicMenuOpen(false)} to="/register" className="rounded-md bg-indigo-700 px-3 py-2.5 text-sm font-semibold text-white">Create account</Link>
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
