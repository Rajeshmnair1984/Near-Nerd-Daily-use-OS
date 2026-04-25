import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.25rem', fontSize: '1rem' },
    lg: { padding: '1rem 1.5rem', fontSize: '1.125rem' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--primary)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--error)',
      color: 'white',
      border: 'none',
    },
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        transition: 'var(--transition)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.5 : 1,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      className={className}
      {...props}
    >
      {icon && !isLoading && icon}
      {isLoading && <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>}
      {children}
    </button>
  );
}
