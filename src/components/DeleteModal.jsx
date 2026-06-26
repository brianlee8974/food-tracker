import { useEffect } from 'react';

export default function DeleteModal({ itemName, onConfirm, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>Delete Item</h2>
          <button className="modal-close-btn" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <p className="delete-msg">
          Are you sure you want to delete <strong>{itemName}</strong>?
        </p>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
