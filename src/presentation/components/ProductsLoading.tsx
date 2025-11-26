import React from 'react';

const ProductsLoading: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {Array.from({ length: 12 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-t-lg" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductsLoading;
