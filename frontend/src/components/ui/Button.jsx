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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-secondary-600',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 dark:bg-accent-600 dark:hover:bg-accent-700 dark:focus:ring-accent-600',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 dark:bg-success-600 dark:hover:bg-success-700 dark:focus:ring-success-600',
    error: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 dark:bg-error-600 dark:hover:bg-error-700 dark:focus:ring-error-600',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 dark:bg-warning-600 dark:hover:bg-warning-700 dark:focus:ring-warning-600',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
    ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    link: 'text-primary-500 hover:text-primary-600 focus:ring-primary-500 dark:text-primary-400 dark:hover:text-primary-300',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };
  
  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={classes}
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
          {Icon && iconPosition === 'left' && <Icon className={`${iconSizes[size]} mr-2`} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={`${iconSizes[size]} ml-2`} />}
        </>
      )}
    </button>
  );
};

export default Button;
