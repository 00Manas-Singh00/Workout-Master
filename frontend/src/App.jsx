import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { 
  SignedIn, 
  SignedOut, 
  SignIn, 
  SignUp, 
  UserButton, 
  useUser, 
  useClerk,
  useAuth as useClerkAuth
} from '@clerk/clerk-react'
import Hero from './components/Hero'
import Generator from './components/Generator'
import Workout from './components/Workout'
import Navbar from './components/Navbar'
import Profile from './components/Profile'
import WorkoutHistory from './components/WorkoutHistory'
import WeeklyPlanView from './components/WeeklyPlanView'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AiCoach from './components/AiCoach'
import { useWorkout } from './context/WorkoutContext'
import { setAuthTokenGetter, syncAuthUser } from './utils/api'
import ToastProvider from './components/ui/Toast'

// Clerk style overrides — keep to monochrome
const ClerkStyles = ({ isDarkMode }) => {
  const styles = `
    .clerk-auth-container .cl-card {
      border-radius: 0;
      box-shadow: none;
      ${isDarkMode ? 'background-color: #111111; color: white;' : 'background-color: #ffffff;'}
    }
    
    .clerk-auth-container .cl-socialButtonsIconButton {
      border-radius: 0;
      ${isDarkMode ? 'background-color: #222222; border-color: #333333;' : 'border-radius: 0;'}
    }
    
    .clerk-auth-container .cl-dividerText {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      ${isDarkMode ? 'color: #6b7280;' : 'color: #9ca3af;'}
    }
    
    .clerk-auth-container .cl-dividerLine {
      ${isDarkMode ? 'background-color: #333333;' : 'background-color: #e5e7eb;'}
    }
    
    .clerk-auth-container .cl-formFieldLabel {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      ${isDarkMode ? 'color: #d1d5db;' : 'color: #374151;'}
    }
    
    .clerk-auth-container .cl-formFieldInput {
      border-radius: 0;
      ${isDarkMode ? 'background-color: #1a1a1a; border-color: #333333; color: white;' : 'border-color: #d1d5db;'}
    }
    
    .clerk-auth-container .cl-footerActionText {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.7rem;
      ${isDarkMode ? 'color: #6b7280;' : 'color: #9ca3af;'}
    }

    .clerk-auth-container .cl-formButtonPrimary {
      border-radius: 0;
      background-color: #111111;
      font-family: 'IBM Plex Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.75rem;
    }
  `;

  return <style>{styles}</style>;
};


// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();
  
  if (!isLoaded) {
    // Show loading state while Clerk loads
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 dark:border-white border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

function App() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const { currentWorkout, saveWorkout, markWorkoutComplete } = useWorkout();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Check system preference for dark mode
  useEffect(() => {
    const savedThemePreference = localStorage.getItem('themePreference');
    
    if (savedThemePreference) {
      setIsDarkMode(JSON.parse(savedThemePreference));
    } else {
      // Default to dark mode
      setIsDarkMode(true);
    }
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem('themePreference', JSON.stringify(isDarkMode));
    
    // Apply the appropriate theme class to the document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Register Clerk token getter for API requests and sync user in backend
  useEffect(() => {
    setAuthTokenGetter(async () => {
      if (!isSignedIn) return null;
      return getToken();
    });

    if (isSignedIn && user?.id) {
      localStorage.setItem('clerk-user-id', user.id);
    } else {
      localStorage.removeItem('clerk-user-id');
    }
  }, [isSignedIn, getToken, user]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !isLoaded || !user) return;

      try {
        await syncAuthUser({
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        });
      } catch (error) {
        console.error('Failed to sync user with backend:', error);
      }
    };

    syncUser();
  }, [isSignedIn, isLoaded, user]);

  // Handle workout completion with backend integration
  const completeWorkout = async () => {
    try {
      // First save the workout if it doesn't have an ID yet
      let workoutId = currentWorkout._id;
      
      if (!workoutId) {
        const savedWorkout = await saveWorkout();
        workoutId = savedWorkout._id;
      }
      
      // Mark the workout as complete
      await markWorkoutComplete(workoutId);
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Utilitarian tones: off-white parchment for light, near-black for dark
  const themeClass = isDarkMode 
    ? 'bg-[#0d0d0d] text-white' 
    : 'bg-[#f5f0eb] text-gray-900';

  // Clerk Auth Modal — utilitarian: solid overlay, square container, no blur/animation
  const ClerkAuthModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
        <div className="w-full max-w-md m-4 relative">
          <button 
            onClick={() => setShowAuth(false)}
            className={`absolute top-0 right-0 z-10 p-2 text-xs uppercase tracking-wider font-medium transition-colors duration-150
              ${isDarkMode ? 'bg-gray-900 text-gray-300 hover:text-white border border-gray-700' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-300'}`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            ✕ Close
          </button>
          
          <div className={`overflow-hidden border-2 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
            {/* Utilitarian header bar */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p
                className={`text-xs uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {showAuth === 'signin' ? '/ Authentication' : '/ Registration'}
              </p>
              <h2 className={`text-lg font-bold uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {showAuth === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
            </div>
            
            <div className="clerk-auth-container">
              {showAuth === 'signin' ? (
                <SignIn 
                  routing="path" 
                  path="/" 
                  signUpUrl="#" 
                  afterSignInUrl="/"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gray-900 hover:bg-gray-700 rounded-none',
                      footerActionLink: 'text-gray-900 hover:text-gray-600',
                      card: 'shadow-none',
                    },
                  }}
                />
              ) : (
                <SignUp 
                  routing="path" 
                  path="/" 
                  signInUrl="#" 
                  afterSignUpUrl="/"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gray-900 hover:bg-gray-700 rounded-none',
                      footerActionLink: 'text-gray-900 hover:text-gray-600',
                      card: 'shadow-none',
                    },
                  }}
                />
              )}
              
              <div className={`py-4 px-6 text-center border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {showAuth === 'signin' ? (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    No account?{' '}
                    <button 
                      onClick={() => setShowAuth('signup')}
                      className="underline hover:no-underline font-medium"
                    >
                      Register
                    </button>
                  </p>
                ) : (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Have an account?{' '}
                    <button 
                      onClick={() => setShowAuth('signin')}
                      className="underline hover:no-underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ToastProvider>
      <div className={`min-h-screen flex flex-col ${themeClass} transition-colors duration-500 text-sm sm:text-base`}>
        <Navbar 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          setShowAuth={setShowAuth}
          isAuthenticated={isSignedIn}
        />
        
        <div className="flex-grow relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Hero isDarkMode={isDarkMode} />} />
            <Route path="/generate" element={
              <ProtectedRoute>
                <Generator isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="/workout" element={
              <ProtectedRoute>
                <Workout 
                  completeWorkout={completeWorkout}
                  isDarkMode={isDarkMode} 
                />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <WorkoutHistory isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="/weekly-plan" element={
              <ProtectedRoute>
                <WeeklyPlanView isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboard isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="/coach" element={
              <ProtectedRoute>
                <AiCoach isDarkMode={isDarkMode} />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        {/* Clerk Auth Modal */}
        {showAuth && <ClerkAuthModal />}

        {/* Clerk custom styles */}
        <ClerkStyles isDarkMode={isDarkMode} />
      </div>
    </ToastProvider>
  )
}

export default App
