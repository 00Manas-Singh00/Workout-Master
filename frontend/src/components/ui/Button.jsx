import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  // Utilitarian base: square, uppercase, mono font, flat color transitions only
  const baseStyles = [
    'inline-flex items-center justify-center font-medium rounded-none',
    'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'uppercase tracking-wider',
  ].join(' ');
  
  const variants = {
    // Filled black — primary CTA
    primary:  'bg-gray-900 text-white border-2 border-gray-900 hover:bg-gray-700 hover:border-gray-700 focus:ring-gray-900 dark:bg-white dark:text-gray-900 dark:border-white dark:hover:bg-gray-200 dark:hover:border-gray-200 dark:focus:ring-white',
    // Outlined (secondary action)
    secondary:'bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-100 focus:ring-gray-900 dark:text-white dark:border-white dark:hover:bg-gray-800 dark:focus:ring-white',
    // Accent green — success / positive confirmation only
    accent:   'bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-600',
    success:  'bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-600',
    // Danger
    error:    'bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-600',
    warning:  'bg-yellow-500 text-gray-900 border-2 border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600 focus:ring-yellow-500',
    // Ghost — minimal, no border
    outline:  'bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-100 focus:ring-gray-900 dark:text-white dark:border-white dark:hover:bg-gray-800 dark:focus:ring-white',
    ghost:    'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
    link:     'bg-transparent text-gray-900 border-0 underline hover:no-underline focus:ring-0 dark:text-white',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
    xl: 'px-6 py-3 text-base',
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  };
  
  const classes = [
    baseStyles,
    variants[variant] || variants.primary,
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={classes}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg className={`animate-spin ${iconSizes[size]}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left'  && <Icon className={`${iconSizes[size]} mr-2`} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={`${iconSizes[size]} ml-2`} />}
        </>
      )}
    </button>
  );
};

export default Button;
