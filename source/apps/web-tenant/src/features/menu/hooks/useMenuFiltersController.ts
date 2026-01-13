'use client';

import { useEffect, useState } from 'react';
import type { MenuFilters, SortOption } from '../model/types';

export function useMenuFiltersController() {
  const debounceMs = 500;

  const [appliedFilters, setAppliedFilters] = useState<MenuFilters>({
    categoryId: 'all',
    status: 'All Status',
    sortBy: 'Sort by: Newest',
    searchQuery: '',
    availability: 'all',
    chefRecommended: false,
  });

  const [tempFilters, setTempFilters] = useState<MenuFilters>(appliedFilters);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  // Debounce search input into appliedFilters.searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, searchQuery: searchInputValue }));
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchInputValue, debounceMs]);

  const handleTempFilterChange = (newFilters: Partial<MenuFilters>) => {
    setTempFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterDropdownOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: MenuFilters = {
      categoryId: appliedFilters.categoryId,
      status: 'All Status',
      sortBy: appliedFilters.sortBy,
      searchQuery: appliedFilters.searchQuery,
      availability: 'all',
      chefRecommended: false,
    };
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setIsFilterDropdownOpen(false);
  };

  const handleSearchChange = (query: string) => setSearchInputValue(query);

  const handleSearchSubmit = () => {
    setAppliedFilters({ ...appliedFilters, searchQuery: searchInputValue });
  };

  const handleSortChange = (sortBy: string) => {
    setAppliedFilters({ ...appliedFilters, sortBy: sortBy as SortOption });
  };

  const toggleFilterDropdown = () => setIsFilterDropdownOpen(!isFilterDropdownOpen);
  const closeFilterDropdown = () => setIsFilterDropdownOpen(false);

  return {
    appliedFilters,
    setAppliedFilters,
    tempFilters,
    setTempFilters,
    isFilterDropdownOpen,
    searchInputValue,
    handleTempFilterChange,
    handleApplyFilters,
    handleResetFilters,
    handleSearchChange,
    handleSearchSubmit,
    handleSortChange,
    toggleFilterDropdown,
    closeFilterDropdown,
  };
}
