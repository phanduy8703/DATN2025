import React from "react";

interface ITitleProps {
  title1: string;
  title2: string;
}

const Title = ({ title1, title2 }: ITitleProps) => {
  return (
    <div className="relative mb-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-1 z-10 flex items-baseline">
        <span className="mr-2 text-2xl">{title1}</span>
        <span className="text-indigo-600">{title2}</span>
      </h2>
      
      <div className="w-24 h-1 bg-indigo-500 rounded-full my-2"></div>
      
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10 30C10 13.4315 23.4315 0 40 0H80C96.5685 0 110 13.4315 110 30C110 46.5685 96.5685 60 80 60H40C23.4315 60 10 46.5685 10 30Z" 
            fill="#EBF4FF" 
          />
        </svg>
      </div>
    </div>
  );
};

export default Title;
