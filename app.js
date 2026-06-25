/* ===================================================
   PANTRY — Food Tracker  |  Application Logic
   =================================================== */

// ——————————————————————————————————————————————————————
// Category → emoji mapping
// ——————————————————————————————————————————————————————
const CATEGORY_EMOJI = {
  'Produce':              '🥦',
  'Meat & Seafood':       '🥩',
  'Dairy':                '🧀',
  'Bakery':               '🍞',
  'Frozen':               '🧊',
  'Canned Goods':         '🥫',
  'Grains & Pasta':       '🌾',
  'Snacks':               '🍿',
  'Beverages':            '🥤',
  'Condiments & Sauces':  '🫙',
  'Spices & Herbs':       '🌿',
  'Other':                '📦',
};

const STORAGE_LABEL = {
  'Fridge':  '❄️ Fridge',
  'Freezer': '🧊 Freezer',
  'Pantry':  '🗄️ Pantry',
  'Counter': '🍌 Counter',
};

// ——————————————————————————————————————————————————————
// State
// ——————————————————————————————————————————————————————
let items = loadItems();
let editingId = null;
let deletingId = null;

// ——————————————————————————————————————————————————————
// DOM references
// ——————————————————————————————————————————————————————
const $list          = document.getElementById('item-list');
const $emptyState    = document.getElementById('empty-state');
const $fabAdd        = document.getElementById('fab-add');
const $modalOverlay  = document.getElementById('modal-overlay');
const $modalTitle    = document.getElementById('modal-title');
const $modalClose    = document.getElementById('modal-close');
const $form          = document.getElementById('item-form');
const $formId        = document.getElementById('form-id');
const $formName      = document.getElementById('form-name');
const $formCategory  = document.getElementById('form-category');
const $formStorage   = document.getElementById('form-storage');
const $formQuantity  = document.getElementById('form-quantity');
const $formUnit      = document.getElementById('form-unit');
const $formExpiry    = document.getElementById('form-expiry');
const $formNotes     = document.getElementById('form-notes');
const $btnCancel     = document.getElementById('btn-cancel');
const $btnSave       = document.getElementById('btn-save');
const $searchInput   = document.getElementById('search-input');
const $categoryFilter = document.getElementById('category-filter');
const $sortSelect    = document.getElementById('sort-select');
const $deleteOverlay = document.getElementById('delete-overlay');
const $deleteClose   = document.getElementById('delete-close');
const $deleteItemName = document.getElementById('delete-item-name');
const $btnDeleteCancel  = document.getElementById('btn-delete-cancel');
const $btnDeleteConfirm = document.getElementById('btn-delete-confirm');
const $statTotal     = document.querySelector('#stat-total .stat-value');
const $statCategories = document.querySelector('#stat-categories .stat-value');
const $statExpiring  = document.querySelector('#stat-expiring .stat-value');

// ——————————————————————————————————————————————————————
// Persistence (localStorage)
// ——————————————————————————————————————————————————————
function loadItems() {
  try {
    const raw = localStorage.getItem('pantry_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem('pantry_items', JSON.stringify(items));
}

// ——————————————————————————————————————————————————————
// Utility helpers
// ——————————————————————————————————————————————————————
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const expiry = new Date(dateStr + 'T00:00:00');
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function expiryBadge(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { class: 'badge-none', text: 'No date' };
  if (days < 0)      return { class: 'badge-expired', text: 'Expired' };
  if (days === 0)    return { class: 'badge-expired', text: 'Today' };
  if (days <= 3)     return { class: 'badge-warning', text: `${days}d left` };
  if (days <= 7)     return { class: 'badge-warning', text: `${days}d left` };
  return { class: 'badge-fresh', text: `${days}d left` };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ——————————————————————————————————————————————————————
// Rendering
// ——————————————————————————————————————————————————————
function render() {
  const filtered = getFilteredSortedItems();

  // Remove existing cards (not the empty state)
  $list.querySelectorAll('.item-card').forEach(el => el.remove());

  if (filtered.length === 0) {
    $emptyState.style.display = 'block';
  } else {
    $emptyState.style.display = 'none';

    filtered.forEach((item, i) => {
      const card = createItemCard(item);
      card.style.animationDelay = `${i * 0.04}s`;
      $list.appendChild(card);
    });
  }

  updateStats();
  updateCategoryFilter();
}

function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.id = item.id;

  const emoji = CATEGORY_EMOJI[item.category] || '📦';
  const badge = expiryBadge(item.expiry);
  const storageLbl = STORAGE_LABEL[item.storage] || item.storage;

  card.innerHTML = `
    <div class="item-emoji">${emoji}</div>
    <div class="item-info">
      <div class="item-name">${escapeHtml(item.name)}</div>
      <div class="item-meta">
        <span class="item-qty">${item.quantity} ${item.unit}</span>
        <span class="dot"></span>
        <span class="storage-badge">${storageLbl}</span>
        <span class="dot"></span>
        <span class="badge ${badge.class}">${badge.text}</span>
      </div>
    </div>
    <div class="item-actions">
      <button class="btn-edit" aria-label="Edit" title="Edit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="btn-delete" aria-label="Delete" title="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    </div>
  `;

  // Event: click card to edit
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-edit') || e.target.closest('.btn-delete')) return;
    openEditModal(item.id);
  });

  card.querySelector('.btn-edit').addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(item.id);
  });

  card.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteConfirm(item.id);
  });

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ——————————————————————————————————————————————————————
// Stats
// ——————————————————————————————————————————————————————
function updateStats() {
  $statTotal.textContent = items.length;

  const cats = new Set(items.map(i => i.category));
  $statCategories.textContent = cats.size;

  const expiringSoon = items.filter(i => {
    const d = daysUntil(i.expiry);
    return d !== null && d <= 3;
  }).length;
  $statExpiring.textContent = expiringSoon;
}

// ——————————————————————————————————————————————————————
// Category filter dropdown (dynamic)
// ——————————————————————————————————————————————————————
function updateCategoryFilter() {
  const current = $categoryFilter.value;
  const cats = [...new Set(items.map(i => i.category))].sort();

  // Rebuild options
  $categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = `${CATEGORY_EMOJI[c] || '📦'} ${c}`;
    $categoryFilter.appendChild(opt);
  });

  // Restore selection
  if (cats.includes(current) || current === 'all') {
    $categoryFilter.value = current;
  }
}

// ——————————————————————————————————————————————————————
// Filtering & Sorting
// ——————————————————————————————————————————————————————
function getFilteredSortedItems() {
  const query = $searchInput.value.toLowerCase().trim();
  const cat   = $categoryFilter.value;
  const sort  = $sortSelect.value;

  let result = items.filter(item => {
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || (item.notes && item.notes.toLowerCase().includes(query));
    const matchesCat    = cat === 'all' || item.category === cat;
    return matchesSearch && matchesCat;
  });

  result.sort((a, b) => {
    switch (sort) {
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
}

// ——————————————————————————————————————————————————————
// Modal open / close
// ——————————————————————————————————————————————————————
function openAddModal() {
  editingId = null;
  $modalTitle.textContent = 'Add Item';
  $btnSave.textContent = 'Save Item';
  $form.reset();
  $formQuantity.value = 1;
  $formExpiry.value = '';
  $modalOverlay.classList.remove('hidden');
  $formName.focus();
}

function openEditModal(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  editingId = id;
  $modalTitle.textContent = 'Edit Item';
  $btnSave.textContent = 'Update Item';

  $formName.value     = item.name;
  $formCategory.value = item.category;
  $formStorage.value  = item.storage;
  $formQuantity.value = item.quantity;
  $formUnit.value     = item.unit;
  $formExpiry.value   = item.expiry || '';
  $formNotes.value    = item.notes || '';

  $modalOverlay.classList.remove('hidden');
  $formName.focus();
}

function closeModal() {
  $modalOverlay.classList.add('hidden');
  editingId = null;
}

function openDeleteConfirm(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  deletingId = id;
  $deleteItemName.textContent = item.name;
  $deleteOverlay.classList.remove('hidden');
}

function closeDeleteConfirm() {
  $deleteOverlay.classList.add('hidden');
  deletingId = null;
}

// ——————————————————————————————————————————————————————
// CRUD operations
// ——————————————————————————————————————————————————————
function handleFormSubmit(e) {
  e.preventDefault();

  const name     = $formName.value.trim();
  const category = $formCategory.value;
  const storage  = $formStorage.value;
  const quantity = parseFloat($formQuantity.value) || 1;
  const unit     = $formUnit.value;
  const expiry   = $formExpiry.value || '';
  const notes    = $formNotes.value.trim();

  if (!name) return;

  if (editingId) {
    // Update existing
    const idx = items.findIndex(i => i.id === editingId);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        name, category, storage, quantity, unit, expiry, notes,
        updatedAt: Date.now(),
      };
    }
  } else {
    // Create new
    items.push({
      id: generateId(),
      name, category, storage, quantity, unit, expiry, notes,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  saveItems();
  closeModal();
  render();
}

function deleteItem() {
  if (!deletingId) return;
  items = items.filter(i => i.id !== deletingId);
  saveItems();
  closeDeleteConfirm();
  render();
}

// ——————————————————————————————————————————————————————
// Event Listeners
// ——————————————————————————————————————————————————————
$fabAdd.addEventListener('click', openAddModal);
$modalClose.addEventListener('click', closeModal);
$btnCancel.addEventListener('click', closeModal);
$form.addEventListener('submit', handleFormSubmit);

$deleteClose.addEventListener('click', closeDeleteConfirm);
$btnDeleteCancel.addEventListener('click', closeDeleteConfirm);
$btnDeleteConfirm.addEventListener('click', deleteItem);

// Close modals on overlay click
$modalOverlay.addEventListener('click', (e) => {
  if (e.target === $modalOverlay) closeModal();
});
$deleteOverlay.addEventListener('click', (e) => {
  if (e.target === $deleteOverlay) closeDeleteConfirm();
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!$deleteOverlay.classList.contains('hidden')) closeDeleteConfirm();
    else if (!$modalOverlay.classList.contains('hidden')) closeModal();
  }
});

// Search & filter
$searchInput.addEventListener('input', render);
$categoryFilter.addEventListener('change', render);
$sortSelect.addEventListener('change', render);

// ——————————————————————————————————————————————————————
// Initial render
// ——————————————————————————————————————————————————————
render();
