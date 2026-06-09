import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, LineChart, Sliders,
  UploadCloud, Bell, Search, UserCircle, Menu, X,
  Zap, ChevronRight,
} from 'lucide-react';
import { ParticleCanvas } from '../ParticleCanvas';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, description: 'Platform overview' },
  { name: 'User Analysis', path: '/user-analysis', icon: Users, description: 'Single prediction' },
  { name: 'Insights', path: '/insights', icon: LineChart, description: 'Model intelligence' },
  { name: 'Simulation', path: '/simulation', icon: Sliders, description: 'What-if scenarios' },
  { name: 'Batch Upload', path: '/batch', icon: UploadCloud, description: 'Bulk campaigns' },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Platform overview and core workflow navigator' },
  '/user-analysis': { title: 'User Analysis', subtitle: 'ML-powered individual churn risk scoring' },
  '/insights': { title: 'Model Insights', subtitle: 'Feature importance and model performance benchmarks' },
  '/simulation': { title: 'Simulation', subtitle: 'Intervention what-if scenario modeling' },
  '/batch': { title: 'Batch Campaign', subtitle: 'Upload cohorts for bulk churn prediction and auto-email' },
};

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: 'Churn Intel', subtitle: '' };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative">
      <ParticleCanvas />

      {/* Sidebar */}
      <aside className={cn(
        'w-[220px] flex-shrink-0 flex flex-col bg-white border-r border-[#E8EDF4] relative z-20 transition-all duration-300',
        'hidden md:flex',
      )}>
        {/* Logo */}
        <div className="h-[60px] flex items-center px-5 border-b border-[#E8EDF4]">
          <img src="/logo.png" alt="TRICP" className="h-8 w-8 rounded-[10px] object-contain flex-shrink-0" />
          <div className="ml-2.5">
            <span className="font-bold text-[15px] text-[#0f1c2e] tracking-tight">TRICP</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-[#9aa5b8] uppercase tracking-widest px-3 mb-3 mt-1">
            Navigation
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2.5 text-[13.5px] font-medium rounded-lg transition-all duration-150 relative',
                  isActive
                    ? 'bg-[#EBF4FF] text-[#0875E1]'
                    : 'text-[#4B5565] hover:bg-[#F5F8FF] hover:text-[#0f1c2e]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#0875E1] rounded-r-full" />
                  )}
                  <item.icon className={cn('mr-3 h-[17px] w-[17px] flex-shrink-0 transition-transform duration-150', isActive ? 'text-[#0875E1]' : 'text-[#8898AA] group-hover:text-[#0875E1] group-hover:scale-105')} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status badge */}
        <div className="p-4 border-t border-[#E8EDF4]">
          <div className="bg-[#F5F8FF] border border-[#DBEAFE] rounded-lg p-3 flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold text-[#0f1c2e]">API Connected</p>
              <p className="text-[10.5px] text-[#8898AA]">Live sync active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-[240px] bg-white border-r border-[#E8EDF4] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[60px] flex items-center justify-between px-5 border-b border-[#E8EDF4]">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="TRICP" className="h-8 w-8 rounded-[10px] object-contain flex-shrink-0" />
                <span className="font-bold text-[15px] text-[#0f1c2e]">TRICP</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-[#8898AA] hover:text-[#0f1c2e]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2.5 text-[13.5px] font-medium rounded-lg transition-all',
                      isActive ? 'bg-[#EBF4FF] text-[#0875E1]' : 'text-[#4B5565] hover:bg-[#F5F8FF]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn('mr-3 h-[17px] w-[17px]', isActive ? 'text-[#0875E1]' : 'text-[#8898AA]')} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="h-[60px] flex items-center justify-between px-5 lg:px-8 border-b border-[#E8EDF4] bg-white/90 backdrop-blur-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[#8898AA] hover:text-[#0f1c2e] transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-[13px] text-[#8898AA]">
                <Zap className="h-3.5 w-3.5 text-[#0875E1]" />
                <span className="text-[#0875E1] font-medium">TRICP</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-[#0f1c2e]">{page.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8898AA]" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 pl-8 pr-4 rounded-lg bg-[#F5F7FA] border border-[#E8EDF4] text-[13px] text-[#0f1c2e] placeholder-[#9aa5b8] focus:outline-none focus:ring-2 focus:ring-[#0875E1]/20 focus:border-[#0875E1]/30 w-48 transition-all font-medium"
              />
            </div>

            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#8898AA] hover:text-[#0f1c2e]">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#0875E1]" />
            </button>

            <div className="h-7 w-[1px] bg-[#E8EDF4] mx-1" />

            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#F5F7FA] transition-colors">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0875E1] to-[#06A0C7] flex items-center justify-center">
                <UserCircle className="h-4 w-4 text-white" />
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-7 relative">
          {/* Page header */}
          <div className="mb-7 animate-fade-up">
            <h1 className="text-[22px] font-bold text-[#0f1c2e] tracking-tight">{page.title}</h1>
            <p className="text-[13.5px] text-[#8898AA] mt-0.5 font-medium">{page.subtitle}</p>
          </div>

          <div className="page-wrapper">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
