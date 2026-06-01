import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-auto" }) => {
  return (
    <img 
      src="/logo.png" 
      alt="La Prama Logo" 
      className={className}
    />
  );
};