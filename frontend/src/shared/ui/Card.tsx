import React from 'react';

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ title, children, className = '', headerAction }) => {
  return (
    <section className={`card w-full ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 pt-5">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {headerAction}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </section>
  );
};


