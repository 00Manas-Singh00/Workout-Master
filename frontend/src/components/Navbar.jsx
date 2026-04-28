import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useClerk, UserButton } from '@clerk/clerk-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

export default function Navbar({ isDarkMode, toggleTheme, setShowAuth, isAuthenticated }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { success: toastSuccess, error: toastError } = useToast();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home',     label: 'Home',           path: '/',         icon: <HomeIcon />    },
    { id: 'generate', label: 'Create Workout',  path: '/generate', icon: <DumbbellIcon /> },
    { id: 'history',  label: 'History',         path: '/history',  icon: <HistoryIcon /> },
    { id: 'profile',  label: 'Profile',         path: '/profile',  icon: <ProfileIcon /> }
  ];

  // Utilitarian navbar — solid, no blur, no transparency
  const navBg     = isDarkMode ? 'bg-gray-950 border-b border-gray-800' : 'bg-white border-b border-gray-200';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      if (isMobileMenuOpen) {
        mobileMenu.classList.add('animate-slide-out');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
          mobileMenu.classList.remove('animate-slide-out');
        }, 200);
      } else {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('animate-slide-in');
        setTimeout(() => mobileMenu.classList.remove('animate-slide-in'), 200);
      }
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleAuthClick   = () => { setShowAuth('signin'); setIsMobileMenuOpen(false); };
  const handleSignUpClick = () => { setShowAuth('signup'); setIsMobileMenuOpen(false); };

  const handleLogout = async () => {
    try {
      await signOut();
      toastSuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      toastError('Logout failed');
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`${navBg} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">

          {/* ── Logo ────────────────────────────────────── */}
          <Link
            to="/"
            className={`font-bold text-base uppercase tracking-widest ${textColor} hover:opacity-70 transition-opacity duration-150`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Work<span className="font-black">Out</span> Master
          </Link>

          {/* ── Desktop nav ────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={[
                    'px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors duration-150 flex items-center gap-2 relative',
                    isActive
                      ? `${textColor} border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`
                      : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                  ].join(' ')}
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  <span className="opacity-60">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            {/* GitHub link */}
            <a
              href="https://github.com/Prthmsh7/Workout-Master"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 ml-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors duration-150`}
              aria-label="GitHub Repository"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 ml-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors duration-150`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Auth */}
            <div className="ml-3">
              {isAuthenticated ? (
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: { width: '2rem', height: '2rem', borderRadius: '0' },
                    },
                  }}
                  afterSignOutUrl="/"
                />
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleAuthClick}   variant="primary"   size="sm">Sign In</Button>
                  <Button onClick={handleSignUpClick} variant="secondary" size="sm">Sign Up</Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile controls ─────────────────────────── */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-1.5 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors duration-150`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {isAuthenticated && (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: '1.75rem', height: '1.75rem', borderRadius: '0' },
                  },
                }}
                afterSignOutUrl="/"
              />
            )}

            <button
              className={`p-1.5 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-150`}
              onClick={toggleMobileMenu}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"
                  d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────── */}
      <div className="hidden md:hidden" id="mobile-menu">
        <div className={`px-4 py-3 space-y-1 ${isDarkMode ? 'bg-gray-950 border-t border-gray-800' : 'bg-white border-t border-gray-200'}`}>
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider font-medium w-full transition-colors duration-150',
                  isActive
                    ? `${textColor} border-l-2 ${isDarkMode ? 'border-white' : 'border-gray-900'} pl-2`
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
                ].join(' ')}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="opacity-60">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <a
            href="https://github.com/Prthmsh7/Workout-Master"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors duration-150 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </a>

          {!isAuthenticated && (
            <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex flex-col gap-2`}>
              <button
                onClick={handleAuthClick}
                className="w-full py-2.5 text-xs uppercase tracking-wider font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors duration-150 text-center"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Sign In
              </button>
              <button
                onClick={handleSignUpClick}
                className={`w-full py-2.5 text-xs uppercase tracking-wider font-medium border-2 transition-colors duration-150 text-center ${isDarkMode ? 'border-gray-700 text-gray-300 hover:border-white hover:text-white' : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Icon components
function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2m4 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-4 0H6a2 2 0 01-2-2v-2" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}