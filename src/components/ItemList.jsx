import ItemCard from './ItemCard';

export default function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <main className="item-list">
        <div className="empty-state">
          <span className="empty-icon">—</span>
          <h2>Your pantry is empty</h2>
          <p>Add your first item to get started.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="item-list">
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          item={item}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </main>
  );
}
