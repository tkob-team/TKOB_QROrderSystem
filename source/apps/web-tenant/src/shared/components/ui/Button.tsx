import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  // Compact modern base style matching admin-screens buttons
  const baseClasses = 'inline-flex h-12 px-6 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-none hover:shadow-md active:shadow-inner';

  const variantClasses = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
    secondary: 'bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 active:bg-emerald-100',
    tertiary: 'bg-transparent text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'
  } as const;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
