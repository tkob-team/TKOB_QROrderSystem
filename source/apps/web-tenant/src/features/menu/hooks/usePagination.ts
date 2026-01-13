'use client';

import { useState } from 'react';

export function usePagination(defaultPageSize = 12) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = defaultPageSize;

  return {
    currentPage,
    setCurrentPage,
    pageSize,
  };
}
