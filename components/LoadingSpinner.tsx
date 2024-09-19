import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-green-200 via-green-400 to-emerald-500">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-green-100 rounded-full"></div>
        <div className="w-24 h-24 border-8 border-emerald-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
      </div>
      <div className="mt-4 text-white text-2xl font-bold">
        <span className="animate-pulse">Loading</span>
        <span className="animate-bounce inline-block ml-1">.</span>
        <span className="animate-bounce inline-block ml-1 delay-100">.</span>
        <span className="animate-bounce inline-block ml-1 delay-200">.</span>
      </div>
    </div>
  );
}