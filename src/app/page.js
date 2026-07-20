'use client';

import { useState } from 'react';
import { useItems } from '@/hooks/useItems';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import Toolbar from '@/components/Toolbar';
import ItemList from '@/components/ItemList';
import ItemFormModal from '@/components/ItemFormModal';
import DeleteModal from '@/components/DeleteModal';
import Fab from '@/components/Fab';

export default function Home() {
  const { items, isLoaded, error, clearError, addItem, updateItem, deleteItem, getItem, stats, activeCategories, getFilteredSortedItems } = useItems();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);

  if (!isLoaded) {
    return null; // or a loading skeleton
  }

  // Get filtered and sorted items
  const filteredItems = getFilteredSortedItems(searchQuery, categoryFilter, sortBy);

  // Modal handlers
  const handleOpenForm = (itemId = null) => {
    setEditingItemId(itemId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItemId(null);
  };

  const handleSaveForm = (formData) => {
    if (editingItemId) {
      updateItem(editingItemId, formData);
    } else {
      addItem(formData);
    }
    handleCloseForm();
  };

  const handleOpenDelete = (itemId) => {
    setDeletingItemId(itemId);
  };

  const handleCloseDelete = () => {
    setDeletingItemId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingItemId) {
      deleteItem(deletingItemId);
    }
    handleCloseDelete();
  };

  // Get items for modals
  const editingItem = editingItemId ? getItem(editingItemId) : null;
  const deletingItem = deletingItemId ? getItem(deletingItemId) : null;

  return (
    <div className="app">
      <Header />
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} aria-label="Dismiss error">&times;</button>
        </div>
      )}
      <StatsBar stats={stats} />
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeCategories={activeCategories}
      />
      <ItemList
        items={filteredItems}
        onEdit={handleOpenForm}
        onDelete={handleOpenDelete}
      />
      <Fab onClick={() => handleOpenForm()} />

      {isFormOpen && (
        <ItemFormModal
          item={editingItem}
          onSave={handleSaveForm}
          onClose={handleCloseForm}
        />
      )}

      {deletingItemId !== null && (
        <DeleteModal
          itemName={deletingItem?.name || ''}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDelete}
        />
      )}
    </div>
  );
}

