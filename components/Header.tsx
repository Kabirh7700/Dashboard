
import React from 'react';
import { LogoIcon, RefreshIcon, UserCircleIcon } from './Icons.tsx';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  currentUserEmail: string;
  currentUserImageUrl?: string;
  onLogout: () => void;
  lastRefreshed: Date | null;
  isAdmin: boolean;
  isBoss: boolean;
  currentView: 'dashboard' | 'employeeMIS';
  onViewChange: (view: 'dashboard' | 'employeeMIS') => void;
}

const NavButton: React.FC<{ label: string, onClick: () => void, isActive: boolean }> = ({ label, onClick, isActive }) => {
  const baseClasses = "px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white shadow-sm";
  const inactiveClasses = "text-slate-600 hover:bg-slate-200/70";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, currentUserEmail, currentUserImageUrl, onLogout, lastRefreshed, isAdmin, isBoss, currentView, onViewChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-900/10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Task Dashboard
            </h1>
            {isAdmin && !isBoss && (
              <>
                <div className="h-6 w-px bg-slate-300/60 ml-4 mr-2"></div>
                <nav className="flex items-center gap-1">
                  <NavButton label="My Dashboard" onClick={() => onViewChange('dashboard')} isActive={currentView === 'dashboard'} />
                  <NavButton label="Employee MIS" onClick={() => onViewChange('employeeMIS')} isActive={currentView === 'employeeMIS'} />
                </nav>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{currentUserEmail}</p>
                <p className="text-xs text-slate-500" suppressHydrationWarning>
                  {lastRefreshed ? `Updated: ${lastRefreshed.toLocaleTimeString()}` : 'Updating...'}
                </p>
              </div>
              
              {currentUserImageUrl ? (
                    <img src={currentUserImageUrl} alt={currentUserEmail} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                    <UserCircleIcon className="h-10 w-10 text-slate-400" />
                )}

              <button onClick={onLogout} className="rounded-md bg-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300/80 transition-colors">Change</button>
            </div>
           
            <div className="h-6 w-px bg-slate-300/60"></div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
            >
              <RefreshIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};