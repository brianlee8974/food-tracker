'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateId, daysUntil } from '@/lib/utils';

const STORAGE_KEY = 'pantry_items';

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Custom hook that encapsulates all item state and CRUD operations.
// The data layer is abstracted so it can be swapped from localStorage
// to API calls (database) in a future milestone without touching components.
export function useItems() {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever items change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Add a new item
  const addItem = useCallback((itemData) => {
    const newItem = {
      id: generateId(),
      ...itemData,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  // Update an existing item by ID
  const updateItem = useCallback((id, itemData) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...itemData, updatedAt: Date.now() }
          : item
      )
    );
  }, []);

  // Delete an item by ID
  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Get an item by ID
  const getItem = useCallback((id) => {
    return items.find(item => item.id === id) || null;
  }, [items]);

  // Compute stats from current items
  const stats = useMemo(() => {
    const categories = new Set(items.map(i => i.category));
    const expiringSoon = items.filter(i => {
      const d = daysUntil(i.expiry);
      return d !== null && d <= 3;
    }).length;

    return {
      total: items.length,
      categories: categories.size,
      expiring: expiringSoon,
    };
  }, [items]);

  // Get unique categories present in items (for filter dropdown)
  const activeCategories = useMemo(() => {
    return [...new Set(items.map(i => i.category))].sort();
  }, [items]);

  // Filter and sort items
  const getFilteredSortedItems = useCallback((query = '', category = 'all', sortBy = 'name-asc') => {
    const q = query.toLowerCase().trim();

    let result = items.filter(item => {
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      const matchesCat = category === 'all' || item.category === category;
      return matchesSearch && matchesCat;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'expiry-asc': {
          const da = a.expiry || '9999-12-31';
          const db = b.expiry || '9999-12-31';
          return da.localeCompare(db);
        }
        case 'expiry-desc': {
          const da = a.expiry || '0000-01-01';
          const db = b.expiry || '0000-01-01';
          return db.localeCompare(da);
        }
        case 'date-added':
          return (b.addedAt || 0) - (a.addedAt || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [items]);

  return {
    items,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    stats,
    activeCategories,
    getFilteredSortedItems,
  };
}
