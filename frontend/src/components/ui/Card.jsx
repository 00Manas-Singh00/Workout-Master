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
  // Utilitarian: square corners, explicit borders, no shadow blur, no scale hover
  const baseStyles = 'rounded-none transition-colors duration-150';
  
  const variants = {
    default:  'bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 border-l-4 border-l-gray-900 dark:border-l-white',
    outlined: 'bg-transparent border-2 border-gray-400 dark:border-gray-500',
    filled:   'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    primary:  'bg-gray-50 dark:bg-gray-900 border-2 border-gray-900 dark:border-white',
  };
  
  const paddings = {
    none: 'p-0',
    xs:   'p-2',
    sm:   'p-3',
    md:   'p-4',
    lg:   'p-6',
    xl:   'p-8',
  };
  
  // Hover: left-border accent shift instead of scale
  const hoverStyles = hover
    ? 'hover:border-l-4 hover:border-l-gray-900 dark:hover:border-l-white cursor-pointer'
    : '';
  
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
    <h3
      className={`text-base font-semibold uppercase tracking-wide text-gray-900 dark:text-white ${className}`}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${className}`} {...props}>
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
    <div
      className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header      = CardHeader;
Card.Title       = CardTitle;
Card.Description = CardDescription;
Card.Content     = CardContent;
Card.Footer      = CardFooter;

export default Card;
