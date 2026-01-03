import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const PixelButton: React.FC<PixelButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  
  // Elegant, minimalist base styles
  let baseStyles = "font-body text-xs uppercase tracking-[0.2em] px-8 py-3 transition-all duration-300 ease-in-out border outline-none disabled:opacity-50 disabled:cursor-not-allowed ";
  
  let colorStyles = "";
  switch (variant) {
    case 'primary':
      colorStyles = "bg-stone-900 text-white border-stone-900 hover:bg-white hover:text-stone-900";
      break;
    case 'secondary':
      colorStyles = "bg-transparent text-stone-600 border-stone-300 hover:border-stone-900 hover:text-stone-900";
      break;
    case 'danger':
      colorStyles = "bg-red-50 text-red-700 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600";
      break;
  }

  return (
    <button 
      className={`${baseStyles} ${colorStyles} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default PixelButton;