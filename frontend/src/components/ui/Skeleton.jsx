import React from 'react';

const Skeleton = ({
  className = '',
  variant = 'default',
  width,
  height,
  ...props
}) => {
  const baseStyles = 'animate-pulse rounded-md';
  
  const variants = {
    default: 'bg-gray-200 dark:bg-gray-700',
    text: 'bg-gray-200 dark:bg-gray-700',
    circular: 'rounded-full bg-gray-200 dark:bg-gray-700',
    button: 'bg-gray-200 dark:bg-gray-700 rounded-lg',
    input: 'bg-gray-200 dark:bg-gray-700 rounded-lg',
    card: 'bg-gray-200 dark:bg-gray-700 rounded-xl',
  };
  
  const classes = [
    baseStyles,
    variants[variant],
    className,
  ].filter(Boolean).join(' ');
  
  const style = {
    width: width || undefined,
    height: height || undefined,
  };
  
  return <div className={classes} style={style} {...props} />;
};

const SkeletonText = ({ lines = 3, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
          height="1rem"
        />
      ))}
    </div>
  );
};

const SkeletonAvatar = ({ size = 'md', className = '', ...props }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };
  
  return (
    <Skeleton
      variant="circular"
      className={`${sizes[size]} ${className}`}
      {...props}
    />
  );
};

const SkeletonCard = ({ className = '', ...props }) => {
  return (
    <div className={`p-4 space-y-4 ${className}`} {...props}>
      <Skeleton variant="card" className="w-full h-32" />
      <Skeleton variant="text" className="w-3/4 h-6" />
      <SkeletonText lines={2} />
    </div>
  );
};

const SkeletonButton = ({ className = '', ...props }) => {
  return (
    <Skeleton
      variant="button"
      className={`h-10 w-24 ${className}`}
      {...props}
    />
  );
};

const SkeletonInput = ({ className = '', ...props }) => {
  return (
    <Skeleton
      variant="input"
      className={`h-10 w-full ${className}`}
      {...props}
    />
  );
};

const SkeletonTable = ({ rows = 5, columns = 4, className = '', ...props }) => {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" className="h-4 flex-1" />
      ))}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Card = SkeletonCard;
Skeleton.Button = SkeletonButton;
Skeleton.Input = SkeletonInput;
Skeleton.Table = SkeletonTable;

export default Skeleton;
