'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { daysUntil } from '@/lib/utils';

const LEGACY_STORAGE_KEY = 'pantry_items';

// Custom hook that encapsulates all item state and CRUD operations.
// Data is fetched from and persisted to the server API.
// Optimistic updates provide instant UI feedback with rollback on failure.
export function useItems() {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Fetch items from API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      try {
        const res = await fetch('/api/items');
        if (!res.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items);
          setIsLoaded(true);

          // Clean up legacy localStorage data (test data from Milestone 1)
          if (typeof window !== 'undefined') {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setIsLoaded(true);
        }
      }
    }

    fetchItems();
    return () => { cancelled = true; };
  }, []);

  // Add a new item (optimistic)
  const addItem = useCallback((itemData) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const optimisticItem = {
      id: tempId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic: add to beginning of list immediately
    setItems(prev => [optimisticItem, ...prev]);
    setError(null);

    // Fire API call in background
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to add item'); });
        return res.json();
      })
      .then(data => {
        // Replace temp item with server-returned item (real ID, timestamps)
        setItems(prev => prev.map(item => item.id === tempId ? data.item : item));
      })
      .catch(err => {
        // Rollback: remove the optimistic item
        setItems(prev => prev.filter(item => item.id !== tempId));
        setError(err.message);
      });

    return optimisticItem;
  }, []);

  // Update an existing item by ID (optimistic)
  const updateItem = useCallback((id, itemData) => {
    let previousItem = null;

    // Optimistic: merge updates immediately
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        previousItem = item;
        return { ...item, ...itemData, updatedAt: new Date().toISOString() };
      }
      return item;
    }));
    setError(null);

    // Fire API call in background
    fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to update item'); });
        return res.json();
      })
      .then(data => {
        // Sync with authoritative server data
        setItems(prev => prev.map(item => item.id === id ? data.item : item));
      })
      .catch(err => {
        // Rollback to previous state
        if (previousItem) {
          setItems(prev => prev.map(item => item.id === id ? previousItem : item));
        }
        setError(err.message);
      });
  }, []);

  // Delete an item by ID (optimistic)
  const deleteItem = useCallback((id) => {
    let previousItem = null;

    // Optimistic: remove immediately
    setItems(prev => {
      previousItem = prev.find(item => item.id === id);
      return prev.filter(item => item.id !== id);
    });
    setError(null);

    // Fire API call in background
    fetch(`/api/items/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Failed to delete item'); });
      })
      .catch(err => {
        // Rollback: restore the deleted item
        if (previousItem) {
          setItems(prev => [...prev, previousItem]);
        }
        setError(err.message);
      });
  }, []);

  // Get an item by ID
  const getItem = useCallback((id) => {
    return items.find(item => item.id === id) || null;
  }, [items]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
        case 'date-added': {
          // createdAt is an ISO string; lexicographic compare works correctly
          const da = a.createdAt || '';
          const db = b.createdAt || '';
          return db.localeCompare(da);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [items]);

  return {
    items,
    isLoaded,
    error,
    clearError,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    stats,
    activeCategories,
    getFilteredSortedItems,
  };
}
