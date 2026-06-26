export default function StatsBar({ stats }) {
  return (
    <section className="stats-bar">
      <div className="stat-card">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total Items</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.categories}</span>
        <span className="stat-label">Categories</span>
      </div>
      <div className="stat-card stat-expiring">
        <span className="stat-value">{stats.expiring}</span>
        <span className="stat-label">Expiring Soon</span>
      </div>
    </section>
  );
}
