import accountRoutes from './accountRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import voucherRoutes from './voucherRoutes.js';
import reportRoutes from './reportRoutes.js';

export function registerRoutes(app) {
  app.use('/accounts', accountRoutes);
  app.use('/invoices', invoiceRoutes);
  app.use('/payments', paymentRoutes);
  app.use('/vouchers', voucherRoutes);
  app.use('/reports', reportRoutes);
}
