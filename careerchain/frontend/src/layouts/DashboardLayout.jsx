import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg">
        Skip to main content
      </a>
      <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-5 px-4 py-5 sm:px-6 lg:gap-8 lg:px-8 lg:py-8">
          <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          <main id="main-content" className="min-w-0 flex-1" style={{ overflowAnchor: 'none' }} tabIndex="-1">
            <Outlet />
          </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
