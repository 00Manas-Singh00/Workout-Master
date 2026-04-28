import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300',
    accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
    error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
    outline: 'border-2 border-gray-300 text-gray-800 dark:border-gray-600 dark:text-gray-300',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };
  
  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <span className={classes} {...props}>
      {dot && (
        <span className={`mr-1.5 rounded-full ${dotSizes[size]} bg-current opacity-75`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
