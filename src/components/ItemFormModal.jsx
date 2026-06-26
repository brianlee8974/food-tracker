import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/lib/constants';

export default function ItemFormModal({ item, onSave, onClose }) {
  const isEditing = !!item;
  const nameRef = useRef(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [storage, setStorage] = useState(STORAGE_LOCATIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(UNITS[0]);
  const [expiry, setExpiry] = useState('');
  const [notes, setNotes] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || CATEGORIES[0]);
      setStorage(item.storage || STORAGE_LOCATIONS[0]);
      setQuantity(item.quantity ?? 1);
      setUnit(item.unit || UNITS[0]);
      setExpiry(item.expiry || '');
      setNotes(item.notes || '');
    } else {
      setName('');
      setCategory(CATEGORIES[0]);
      setStorage(STORAGE_LOCATIONS[0]);
      setQuantity(1);
      setUnit(UNITS[0]);
      setExpiry('');
      setNotes('');
    }
  }, [item]);

  // Auto-focus the name input when modal opens
  useEffect(() => {
    nameRef.current?.focus();
  }, [item]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSave({
      name: trimmedName,
      category,
      storage,
      quantity: parseFloat(quantity) || 1,
      unit,
      expiry,
      notes: notes.trim(),
    });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Item' : 'Add Item'}</h2>
          <button className="modal-close-btn" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="item-form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full">
              <label htmlFor="form-name">
                Item Name <span className="required">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                id="form-name"
                placeholder="e.g. Chicken Breast"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label htmlFor="form-category">Category</label>
              <select
                id="form-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="form-storage">Storage</label>
              <select
                id="form-storage"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
              >
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label htmlFor="form-quantity">Quantity</label>
              <input
                type="number"
                id="form-quantity"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="form-unit">Unit</label>
              <select
                id="form-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="form-expiry">Expiry Date</label>
              <input
                type="date"
                id="form-expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full">
              <label htmlFor="form-notes">Notes</label>
              <textarea
                id="form-notes"
                rows={2}
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
