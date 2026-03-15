import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

registerRoutes(app);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend API running on port ${port}`);
});
