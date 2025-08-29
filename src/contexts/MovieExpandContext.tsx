'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface MovieExpandContextType {
  expandedOverviews: Set<number>;
  expandedProviders: Set<number>;
  toggleOverview: (id: number) => void;
  toggleProviders: (id: number) => void;
  resetExpansions: () => void;
}

const MovieExpandContext = createContext<MovieExpandContextType | null>(null);

export function MovieExpandProvider({ children }: { children: ReactNode }) {
  const [expandedOverviews, setExpandedOverviews] = useState<Set<number>>(new Set());
  const [expandedProviders, setExpandedProviders] = useState<Set<number>>(new Set());

  // 関数をuseCallbackでメモ化
  const toggleOverview = useCallback((movieId: number) => {
    setExpandedOverviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  }, []);

  const toggleProviders = useCallback((movieId: number) => {
    setExpandedProviders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  }, []);

  const resetExpansions = useCallback(() => {
    setExpandedOverviews(new Set());
    setExpandedProviders(new Set());
  }, []);

  // Context valueをuseMemoでメモ化
  const contextValue = useMemo(() => ({
    expandedOverviews,
    expandedProviders,
    toggleOverview,
    toggleProviders,
    resetExpansions
  }), [expandedOverviews, expandedProviders, toggleOverview, toggleProviders, resetExpansions]);

  return (
    <MovieExpandContext.Provider value={contextValue}>
      {children}
    </MovieExpandContext.Provider>
  );
}

// カスタムフック
export function useMovieExpand() {
  const context = useContext(MovieExpandContext);
  if (!context) {
    throw new Error('useMovieExpand must be used within MovieExpandProvider');
  }
  return context;
}