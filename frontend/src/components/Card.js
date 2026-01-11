import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
