import { CATEGORY_ABBREV } from '@/lib/constants';
import { expiryBadge } from '@/lib/utils';

export default function ItemCard({ item, index, onEdit, onDelete }) {
  const abbrev = CATEGORY_ABBREV[item.category] || 'OTH';
  const badge = expiryBadge(item.expiry);
  const storageLbl = item.storage || '';

  return (
    <div
      className="item-card"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={() => onEdit(item.id)}
    >
      <div className="item-icon">{abbrev}</div>
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        <div className="item-meta">
          <span className="item-qty">
            {item.quantity} {item.unit}
          </span>
          <span className="dot" />
          <span className="storage-badge">{storageLbl}</span>
          <span className="dot" />
          <span className={`badge ${badge.className}`}>{badge.text}</span>
        </div>
      </div>
      <div className="item-actions">
        <button
          className="btn-edit"
          aria-label="Edit"
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item.id);
          }}
        >
          ✎
        </button>
        <button
          className="btn-delete"
          aria-label="Delete"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
