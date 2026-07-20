import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/lib/constants';

/**
 * Validate item data for creation (strict) or update (lenient).
 *
 * Strict mode (create): name, category, storage, quantity, and unit are
 * required and must match the allowed constant values.
 *
 * Lenient mode (update): only the fields that are provided are validated.
 * category, storage, and unit are NOT checked against the allowed lists,
 * preserving flexibility for legacy or edge-case data.
 *
 * @param {object} data - The item fields to validate
 * @param {object} options
 * @param {boolean} options.strict - true for create, false for update
 * @returns {{ errors: string[] } | null} - Array of error messages, or null if valid
 */
export function validateItemData(data, { strict = true } = {}) {
  const errors = [];

  if (strict) {
    // --- Required fields ---
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Name is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    } else if (!CATEGORIES.includes(data.category)) {
      errors.push(`Invalid category: ${data.category}`);
    }

    if (!data.storage) {
      errors.push('Storage location is required');
    } else if (!STORAGE_LOCATIONS.includes(data.storage)) {
      errors.push(`Invalid storage location: ${data.storage}`);
    }

    if (data.quantity === undefined || data.quantity === null) {
      errors.push('Quantity is required');
    } else if (typeof data.quantity !== 'number' || data.quantity < 0) {
      errors.push('Quantity must be a non-negative number');
    }

    if (!data.unit) {
      errors.push('Unit is required');
    } else if (!UNITS.includes(data.unit)) {
      errors.push(`Invalid unit: ${data.unit}`);
    }
  } else {
    // --- Lenient mode (update): only validate provided fields ---
    if ('name' in data && (typeof data.name !== 'string' || !data.name.trim())) {
      errors.push('Name must be a non-empty string');
    }

    if ('quantity' in data && (typeof data.quantity !== 'number' || data.quantity < 0)) {
      errors.push('Quantity must be a non-negative number');
    }

    // category, storage, and unit are accepted as-is in lenient mode
  }

  // --- Optional fields (validated in both modes if provided) ---
  if ('expiry' in data && data.expiry !== null && data.expiry !== '') {
    // Expect ISO date format YYYY-MM-DD
    if (typeof data.expiry !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.expiry)) {
      errors.push('Expiry must be a date string in YYYY-MM-DD format');
    }
  }

  if ('notes' in data && data.notes !== null && typeof data.notes !== 'string') {
    errors.push('Notes must be a string');
  }

  return errors.length > 0 ? { errors } : null;
}
