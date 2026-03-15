export function validatePayment(data) {
  const { amount, payment_date } = data;
  if (amount == null || amount === '' || isNaN(Number(amount))) {
    return { valid: false, message: 'Valid amount is required' };
  }
  if (!payment_date) {
    return { valid: false, message: 'Payment date is required' };
  }
  return {
    valid: true,
    data: {
      amount: Number(amount),
      payment_date
    }
  };
}
