import * as reportService from '../services/reportService.js';

export async function getIncomeStatement(req, res) {
  try {
    const { type, year, month, toDate } = req.query;

    if (type === 'monthly') {
      if (!year || !month) {
        return res.status(400).json({
          message: 'year and month are required for monthly report'
        });
      }
    } else if (type === 'yearly') {
      if (!year) {
        return res.status(400).json({ message: 'year is required for yearly report' });
      }
    } else {
      return res.status(400).json({ message: 'type must be monthly or yearly' });
    }

    const result = await reportService.getIncomeStatement(type, year, month, toDate);
    if (!result) {
      return res.status(400).json({ message: 'Invalid report parameters' });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: `Failed to generate income statement: ${err.message}`
    });
  }
}
