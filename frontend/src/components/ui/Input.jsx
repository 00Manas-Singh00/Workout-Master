import React from 'react';

const Input = ({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  disabled = false,
  required = false,
  ...props
}) => {
  const baseStyles = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
    filled: 'border-transparent bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
    error: 'border-error-500 dark:border-error-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-error-500 focus:ring-error-500 dark:focus:border-error-400 dark:focus:ring-error-400',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const classes = [
    baseStyles,
    variants[error ? 'error' : variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className={`${iconSizes[size]} text-gray-400 dark:text-gray-500`} />
          </div>
        )}
        <input
          className={`${classes} ${LeftIcon ? 'pl-10' : ''} ${RightIcon ? 'pr-10' : ''}`}
          disabled={disabled}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <RightIcon className={iconSizes[size]} />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-500 dark:text-error-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

const Textarea = ({
  label,
  error,
  helperText,
  className = '',
  rows = 4,
  fullWidth = false,
  disabled = false,
  required = false,
  ...props
}) => {
  const baseStyles = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
  
  const variant = error ? 'error' : 'default';
  
  const variants = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
    error: 'border-error-500 dark:border-error-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-error-500 focus:ring-error-500 dark:focus:border-error-400 dark:focus:ring-error-400',
  };
  
  const classes = [
    baseStyles,
    variants[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={classes}
        rows={rows}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-500 dark:text-error-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

const Select = ({
  label,
  error,
  helperText,
  options = [],
  className = '',
  fullWidth = false,
  disabled = false,
  required = false,
  placeholder,
  ...props
}) => {
  const baseStyles = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variant = error ? 'error' : 'default';
  
  const variants = {
    default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400',
    error: 'border-error-500 dark:border-error-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-error-500 focus:ring-error-500 dark:focus:border-error-400 dark:focus:ring-error-400',
  };
  
  const classes = [
    baseStyles,
    variants[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <select className={classes} disabled={disabled} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error-500 dark:text-error-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

Input.Textarea = Textarea;
Input.Select = Select;

export default Input;
