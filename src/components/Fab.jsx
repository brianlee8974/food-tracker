export default function Fab({ onClick }) {
  return (
    <button className="fab-add" onClick={onClick} aria-label="Add item">
      <span className="fab-icon">+</span>
    </button>
  );
}
