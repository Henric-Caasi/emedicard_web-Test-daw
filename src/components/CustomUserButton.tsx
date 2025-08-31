import React from 'react';

const CustomUserButton: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      {/* Placeholder for user button */}
      <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-semibold">U</div>
      <span className="text-gray-700 text-sm">User Name</span>
    </div>
  );
};

export default CustomUserButton;
