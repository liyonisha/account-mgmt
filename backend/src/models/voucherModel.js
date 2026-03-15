export function validateVoucher(data) {
  const { account_id, amount, voucher_date } = data;
  if (account_id == null || account_id === '') {
    return { valid: false, message: 'Account is required' };
  }
  if (amount == null || amount === '' || isNaN(Number(amount))) {
    return { valid: false, message: 'Valid amount is required' };
  }
  if (!voucher_date) {
    return { valid: false, message: 'Voucher date is required' };
  }
  return {
    valid: true,
    data: {
      account_id: Number(account_id),
      amount: Number(amount),
      description: data.description?.trim() || null,
      voucher_date
    }
  };
}
