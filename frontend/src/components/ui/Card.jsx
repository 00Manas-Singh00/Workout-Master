import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    filled: 'bg-gray-100 dark:bg-gray-900',
    primary: 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800',
  };
  
  const paddings = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const hoverStyles = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';
  
  const classes = [
    baseStyles,
    variants[variant],
    paddings[padding],
    hoverStyles,
    onClick ? 'cursor-pointer' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
