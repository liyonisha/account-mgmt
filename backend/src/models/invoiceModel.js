export function validateInvoice(data) {
  const { invoice_number, invoice_date, amount, account_id } = data;
  if (!invoice_number || typeof invoice_number !== 'string' || !invoice_number.trim()) {
    return { valid: false, message: 'Invoice number is required' };
  }
  if (!invoice_date) {
    return { valid: false, message: 'Invoice date is required' };
  }
  if (amount == null || amount === '' || isNaN(Number(amount))) {
    return { valid: false, message: 'Valid amount is required' };
  }
  if (account_id == null || account_id === '') {
    return { valid: false, message: 'Account is required' };
  }
  return {
    valid: true,
    data: {
      invoice_number: invoice_number.trim(),
      invoice_date,
      amount: Number(amount),
      description: data.description?.trim() || null,
      account_id: Number(account_id)
    }
  };
}
