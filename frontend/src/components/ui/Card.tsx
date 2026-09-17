import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#111827] text-slate-100 rounded-2xl border border-slate-800/90 shadow-xl p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-sky-500/50 hover:shadow-sky-500/10' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
