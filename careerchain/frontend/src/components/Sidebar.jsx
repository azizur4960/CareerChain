import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import careerChainLogo from '../assets/careerchain-logo.svg';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Users,
  Sparkles,
  Bot,
  MessageSquare,
  BookOpen,
  Calendar,
  FilePlus,
  CheckCircle,
  FolderKanban,
  FileText,
  Newspaper,
  X,
} from 'lucide-react';

const navigationByRole = {
  STUDENT: [
    { section: 'Workspace', items: [
      { label: 'News Feed', to: '/student/feed', icon: Newspaper },
      { label: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Alumni directory', to: '/student/alumni', icon: Users },
      { label: 'Jobs & referrals', to: '/student/jobs', icon: Briefcase },
      { label: 'Messages', to: '/student/messages', icon: MessageSquare },
    ] },
    { section: 'Career tools', items: [
      { label: 'Resume & job match', to: '/student/ai-match', icon: Sparkles },
      { label: 'AI resume builder', to: '/student/resume-builder', icon: FileText },
      { label: 'Career assistant', to: '/student/ai-chat', icon: Bot },
    ] },
    { section: 'Campus', items: [
      { label: 'Career articles', to: '/student/blogs', icon: BookOpen },
      { label: 'Events & webinars', to: '/student/events', icon: Calendar },
      { label: 'My profile', to: '/student/profile', icon: User },
    ] },
  ],
  ALUMNI: [
    { section: 'Workspace', items: [
      { label: 'News Feed', to: '/alumni/feed', icon: Newspaper },
      { label: 'Overview', to: '/alumni/dashboard', icon: LayoutDashboard },
      { label: 'Student messages', to: '/alumni/messages', icon: MessageSquare },
      { label: 'My profile', to: '/alumni/profile', icon: User },
    ] },
    { section: 'Career tools', items: [
      { label: 'AI resume builder', to: '/alumni/resume-builder', icon: FileText },
    ] },
    { section: 'Opportunities', items: [
      { label: 'Post a job', to: '/alumni/jobs/create', icon: FilePlus },
      { label: 'My job listings', to: '/alumni/jobs', icon: Briefcase },
    ] },
    { section: 'Community', items: [
      { label: 'Write an article', to: '/alumni/blogs/create', icon: BookOpen },
      { label: 'My articles', to: '/alumni/blogs', icon: FolderKanban },
      { label: 'Campus events', to: '/student/events', icon: Calendar },
    ] },
  ],
  ADMIN: [
    { section: 'Administration', items: [
      { label: 'News Feed', to: '/admin/feed', icon: Newspaper },
      { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'User accounts', to: '/admin/users', icon: Users },
      { label: 'Alumni credentials', to: '/admin/alumni-verify', icon: CheckCircle },
      { label: 'Jobs governance', to: '/admin/jobs', icon: Briefcase },
      { label: 'Events', to: '/admin/events', icon: Calendar },
      { label: 'My profile', to: '/admin/profile', icon: User },
      { label: 'AI resume builder', to: '/admin/resume-builder', icon: FileText },
    ] },
  ],
};

const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const { role } = useAuth();
  const sections = navigationByRole[role] || [];

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onClose]);

  return (
    <>
      {mobileOpen && (
        <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/35 md:hidden" />
      )}
      <aside
        aria-label={`${role?.toLowerCase() || 'Account'} navigation`}
        className={`fixed bottom-0 left-0 top-[68px] z-50 w-[min(19rem,calc(100vw-2.75rem))] overflow-y-auto border-r border-slate-200 bg-white px-4 pb-6 pt-5 transition-transform duration-200 md:sticky md:bottom-auto md:top-[73px] md:z-10 md:block md:h-[calc(100vh-73px)] md:w-56 md:flex-shrink-0 md:translate-x-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 ${mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:shadow-none'}`}
      >
        <div className="mb-5 flex items-center justify-between px-2 md:hidden">
          <div>
            <img src={careerChainLogo} alt="CareerChain — Daffodil International University" className="h-9 w-auto max-w-[150px] object-contain" />
            <p className="mt-1 text-sm font-bold text-slate-900">{role?.toLowerCase()} workspace</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-6" aria-label="Main navigation">
          {sections.map((section) => (
            <section key={section.section}>
              <h2 className="mb-2 px-3 text-[10px] font-bold uppercase text-slate-500">{section.section}</h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to.endsWith('/dashboard') || item.label === 'My job listings' || item.label === 'My articles'}
                      onClick={onClose}
                      className={({ isActive }) => `group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-offset-2 ${isActive ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-700' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
        <div className="mt-8 border-t border-slate-200 px-3 pt-4">
          <p className="text-[11px] font-semibold text-slate-500">Daffodil International University</p>
          <p className="mt-1 text-[10px] text-slate-400">Career community</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
