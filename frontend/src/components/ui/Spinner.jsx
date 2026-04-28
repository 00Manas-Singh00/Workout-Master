import React from 'react';

const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const colors = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500',
    white: 'text-white',
    gray: 'text-gray-500',
  };
  
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Spinner size="xl" color="primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

const LoadingOverlay = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10';
  
  return (
    <div className={`${containerClasses} flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm`}>
      <div className="flex flex-col items-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

Spinner.Page = LoadingPage;
Spinner.Overlay = LoadingOverlay;

export default Spinner;
