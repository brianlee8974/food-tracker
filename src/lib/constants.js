// Categories available for food items
export const CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy',
  'Bakery',
  'Frozen',
  'Canned Goods',
  'Grains & Pasta',
  'Snacks',
  'Beverages',
  'Condiments & Sauces',
  'Spices & Herbs',
  'Other',
];

// Category → 3-letter abbreviation for item card icons
export const CATEGORY_ABBREV = {
  'Produce': 'PRD',
  'Meat & Seafood': 'M&S',
  'Dairy': 'DRY',
  'Bakery': 'BKY',
  'Frozen': 'FRZ',
  'Canned Goods': 'CAN',
  'Grains & Pasta': 'G&P',
  'Snacks': 'SNK',
  'Beverages': 'BEV',
  'Condiments & Sauces': 'C&S',
  'Spices & Herbs': 'S&H',
  'Other': 'OTH',
};

// Storage locations
export const STORAGE_LOCATIONS = [
  'Fridge',
  'Freezer',
  'Pantry',
  'Counter',
];

// Measurement units
export const UNITS = [
  'pcs',
  'lbs',
  'oz',
  'kg',
  'g',
  'liters',
  'ml',
  'cups',
  'bags',
  'boxes',
  'cans',
  'bottles',
  'jars',
  'dozen',
  'bunch',
];

// Sort options for the toolbar
export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
  { value: 'expiry-asc', label: 'Expiry ↑' },
  { value: 'expiry-desc', label: 'Expiry ↓' },
  { value: 'date-added', label: 'Recently Added' },
];
