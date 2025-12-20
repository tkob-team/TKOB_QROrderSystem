'use client'

import { useState, useMemo, useEffect } from 'react'

interface UsePaginationProps<T> {
  items: T[]
  itemsPerPage: number
}

export function usePagination<T>({
  items,
  itemsPerPage,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items])

  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    return {
      currentItems,
      currentPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      totalItems: items.length,
    }
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)))
  }

  const nextPage = () => {
    if (paginationInfo.hasNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const prevPage = () => {
    if (paginationInfo.hasPrev) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  return {
    ...paginationInfo,
    setCurrentPage: goToPage,
    nextPage,
    prevPage,
  }
}
