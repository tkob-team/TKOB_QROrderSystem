'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { fadeInUp, staggerFadeIn, countUp } from '@/shared/utils/animations';
import type { TimePeriod, ChartPeriod, RangeOption, KPIData } from '../model/types';

interface UseDashboardPageProps {
  isLoading?: boolean;
  currentKPI?: KPIData;
}

interface UseDashboardPageReturn {
  state: {
    timePeriod: TimePeriod;
    rangeFilter: RangeOption;
  };
  handlers: {
    handleRangeChange: (value: RangeOption) => void;
  };
  animation: {
    headerRef: React.RefObject<HTMLDivElement>;
    kpiGridRef: React.RefObject<HTMLDivElement>;
    chartsRef: React.RefObject<HTMLDivElement>;
    tableRef: React.RefObject<HTMLDivElement>;
  };
  mappers: {
    getChartPeriod: () => ChartPeriod;
  };
  effects: {
    setupAnimations: (isLoading: boolean, currentKPI?: KPIData) => void;
  };
}

export function useDashboardPage(): UseDashboardPageReturn {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Today');
  const [rangeFilter, setRangeFilter] = useState<RangeOption>('Today');

  // Refs for animations - persist across renders
  const headerRef = useRef<HTMLDivElement>(null);
  const kpiGridRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter change handler
  const handleRangeChange = useCallback((value: RangeOption) => {
    setRangeFilter(value);
    // Map range filter to time period for KPIs
    if (value === 'Today' || value === 'Yesterday') {
      setTimePeriod('Today');
    } else if (value === 'Last 7 days') {
      setTimePeriod('This Week');
    } else if (value === 'Last 30 days') {
      setTimePeriod('This Month');
    }
  }, []);

  // Map rangeFilter to chart period for revenue chart
  const getChartPeriod = useCallback((): ChartPeriod => {
    if (rangeFilter === 'Today') {
      return 'today';
    } else if (rangeFilter === 'Yesterday') {
      return 'yesterday';
    } else if (rangeFilter === 'Last 7 days') {
      return 'week';
    } else {
      return 'month';
    }
  }, [rangeFilter]);

  // Animation setup function to be called by the page
  const setupAnimations = useCallback((isLoading: boolean, currentKPI?: KPIData) => {
    // Entrance animations
    const animateEntrance = async () => {
      if (headerRef.current) fadeInUp(headerRef.current, 0);
      if (kpiGridRef.current) {
        const cards = kpiGridRef.current.querySelectorAll('.stat-card');
        if (cards.length > 0) {
          staggerFadeIn(Array.from(cards) as unknown as HTMLElement, 100);
        }
      }
      if (chartsRef.current) fadeInUp(chartsRef.current, 300);
      if (tableRef.current) fadeInUp(tableRef.current, 400);
    };

    if (!isLoading) {
      animateEntrance();
    }

    // Count-up animation for KPI values
    if (!isLoading && currentKPI && kpiGridRef.current) {
      const valueElements = kpiGridRef.current.querySelectorAll('.stat-value');
      valueElements.forEach((el) => {
        const target = el as HTMLElement;
        const text = target.textContent || '0';
        const numMatch = text.match(/[\d,]+/);
        if (numMatch) {
          const value = parseInt(numMatch[0].replace(/,/g, ''), 10);
          if (!isNaN(value)) {
            const formatFn = text.includes('$')
              ? (v: number) => `$${v.toLocaleString()}`
              : (v: number) => v.toLocaleString();
            countUp(target, 0, value, 1500, formatFn);
          }
        }
      });
    }
  }, []);

  return {
    state: {
      timePeriod,
      rangeFilter,
    },
    handlers: {
      handleRangeChange,
    },
    animation: {
      headerRef,
      kpiGridRef,
      chartsRef,
      tableRef,
    },
    mappers: {
      getChartPeriod,
    },
    effects: {
      setupAnimations,
    },
  };
}
