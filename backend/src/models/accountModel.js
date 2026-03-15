export const ACCOUNT_CATEGORIES = [
  'Income',
  'Expenses',
  'Assets',
  'Liabilities',
  'Equity'
];

export function validateAccount(data) {
  const { name, category } = data;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, message: 'Account name is required' };
  }
  if (!category || !ACCOUNT_CATEGORIES.includes(category)) {
    return { valid: false, message: 'Invalid account category' };
  }
  return { valid: true, data: { name: name.trim(), category } };
}
